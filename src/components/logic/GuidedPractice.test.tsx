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
vi.mock('./SolutionReveal', () => ({ default: () => <button>Solution</button> }));
const problem: LogicProblem={id:1,title:'Two Sum',difficulty:'Easy',topic:'Arrays',description:'Find two different indices.',examples:[],starter:'def twoSum(nums, target):\n    pass',parameters:[],interfaces:[],fixtures:[{entry:'twoSum',name:'Example',args:[[2,7],9],expected:[0,1]}],validation:{kind:'practice-cases',count:1,adversarialCount:0}};
function lesson(language:'python'|'javascript'='python'):GuidedLesson{return {id:1,title:'Two Sum',language,revision:'v1',source:language==='python'?'def twoSum(nums, target):\n    return [0, 1]':'function twoSum(nums,target) { return [0,1]; }',sourceHash:'hash',patternId:'hash',coverage:{requiredLines:[2],coveredLines:[2],terminalLines:[2]},validation:{correctCases:1,wrongChoices:2,testedWitnesses:2},questions:[
{id:'pattern',stage:'pattern',prompt:'Which approach fits this lesson?',choices:Array.from({length:8},(_,i)=>({id:`pattern-${i}`,label:i===3?'Hash lookup':`Pattern ${i}`,correct:i===3,feedback:i===3?'Remember earlier values for lookup.':'This is a different approach from the one practiced here.'}))},
{id:'structure',stage:'structure',prompt:'How should we organize the solution?',choices:Array.from({length:4},(_,i)=>({id:`structure-${i}`,label:i===1?'Scan and remember':'Plan '+i,correct:i===1,feedback:i===1?'Check before storing.':'That structure misses the goal.'}))},
{id:`implementation-${language}`,stage:'implementation',prompt:'Which result should we return?',context:language==='python'?'def twoSum(nums, target):\n    # Choose the missing statement.':'function twoSum(nums,target) {\n // Choose the missing statement.',line:2,endLine:2,choices:[{id:'right',label:'Right',code:language==='python'?'return [0, 1]':'return [0, 1];',correct:true,feedback:'These are different indices.'},{id:'wrong',label:'Wrong',code:language==='python'?'return [0, 0]':'return [0, 0];',correct:false,feedback:'This reuses one index.',witness:{fixtureIndex:0,name:'Example',input:[[2,7],9],expected:[0,1],actual:[0,0]}},{id:'empty',label:'Empty',code:language==='python'?'return []':'return [];',correct:false,feedback:'An empty answer misses the pair.',witness:{fixtureIndex:0,name:'Example',input:[[2,7],9],expected:[0,1],actual:[]}}]}
]};}
function show(language:'python'|'javascript'='python'){return render(<MemoryRouter><GuidedPractice problem={problem} language={language} onLanguageChange={()=>{}}/></MemoryRouter>);}
async function correctPattern(){fireEvent.click(await screen.findByRole('button',{name:/Hash lookup/}));}
async function correctStructure(){fireEvent.click(await screen.findByRole('button',{name:/Scan and remember/}));}
function navigationLesson(language: 'python' | 'javascript'): GuidedLesson {
 const full = lesson(language);
 const structure = full.questions[1], implementation = full.questions[2];
 full.questions = [full.questions[0],
  {...structure, id:'plan-remember', prompt:'What should we remember?'},
  {...structure, id:'plan-order', prompt:'When should we check the saved values?'},
  {...implementation, id:'code-first', prompt:'How should the first code step work?'},
  {...implementation, id:'code-middle', prompt:'How should the middle code step work?'},
  {...implementation, id:'code-final', prompt:'How should the final code step work?'},
 ];
 return full;
}
function savedProgress(language: 'python' | 'javascript') {
 return JSON.parse(localStorage.getItem(`lc-guided-progress-1-${language}`)!);
}
function navigateStep(name: 'Previous step' | 'Skip step' | 'Next step') {
 fireEvent.click(screen.getByRole('button', {name}));
}
function expectStageDone(stage: 'pattern' | 'structure' | 'implementation', done: boolean) {
 const index = ['pattern', 'structure', 'implementation'].indexOf(stage) + 1;
 expect(document.querySelector(`.guided-progress li:nth-child(${index})`)?.getAttribute('data-done')).toBe(String(done));
}
async function correctImplementation() {
 fireEvent.click(await screen.findByRole('button', {name:/return \[0, 1\]/}));
}
beforeEach(()=>{localStorage.clear();vi.clearAllMocks();mocks.load.mockImplementation((_id,lang)=>Promise.resolve(lesson(lang)));Element.prototype.scrollIntoView=vi.fn();});afterEach(cleanup);
describe('guided approach-to-code workflow',()=>{
 it.each(['python','javascript'] as const)('shows one structure decision at a time in %s and reviews every step before resuming code',async(language)=>{
  const full=lesson(language), implementation=full.questions[2];
  const plans=[
   ['remember','What should we remember from earlier numbers?','Earlier values and their indices','Keep the original indices so the answer can identify the two elements.'],
   ['lookup','When should we look for the matching value?','Before storing the current number','Checking earlier values first prevents using the current index twice.'],
   ['finish-plan','What should we return when a match is found?','The two original indices','The problem asks for positions, so return the earlier index and the current index.'],
  ];
  full.questions=[full.questions[0],...plans.map(([id,prompt,label,explanation])=>({id,stage:'structure' as const,prompt,choices:[
   {id:'right',label,correct:true,feedback:explanation},
   {id:'wrong-a',label:'Use only the current number',correct:false,feedback:'That loses the earlier index.'},
   {id:'wrong-b',label:'Use only the last number',correct:false,feedback:'The needed value may occur earlier.'},
  ]})),{...implementation,id:'first-code'}, {...implementation,id:'last-code',prompt:'Which pair finishes the function?'}];
  mocks.load.mockResolvedValue(full);
  const first=show(language);await correctPattern();
  for(let index=0;index<plans.length;index++){
   const card=await screen.findByRole('region',{name:'Structure question'});
   expect(screen.getByText(`Structure · Step ${index+1} of 3`)).toBeTruthy();
   expect(within(card).getAllByRole('button')).toHaveLength(3);
   expect(document.querySelectorAll('.guided-context, .guided-runner')).toHaveLength(0);
   expect(document.querySelector('.guided-progress li:nth-child(2)')?.getAttribute('data-done')).toBe('false');
   if(index+1<plans.length) expect(screen.queryByRole('heading',{name:plans[index+1][1]})).toBeNull();
   fireEvent.click(within(card).getByRole('button',{name:/Use only the current number/}));
   expect(screen.getByRole('heading',{name:plans[index][1]})).toBeTruthy();
   fireEvent.click(within(card).getByRole('button',{name:new RegExp(plans[index][2])}));
  }
  expect(document.querySelector('.guided-progress li:nth-child(2)')?.getAttribute('data-done')).toBe('true');
  fireEvent.click(await screen.findByRole('button',{name:/return \[0, 1\]/}));
  await screen.findByRole('heading',{name:'Which pair finishes the function?'});first.unmount();
  show(language);await correctPattern();
  for(const [,prompt,label] of plans){
   await screen.findByRole('heading',{name:prompt});
   expect(screen.queryByLabelText('Implementation context')).toBeNull();
   fireEvent.click(screen.getByRole('button',{name:new RegExp(label)}));
  }
  await screen.findByRole('heading',{name:'Which pair finishes the function?'});
  expect(mocks.runner).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:/return \[0, 1\]/}));
  await screen.findByRole('region',{name:'Completed test code'});
 });
 it('starts with eight patterns and no direct code, keeps wrong choices on the same question, and advances correct ones',async()=>{
  show();const pattern=await screen.findByRole('region',{name:'Approach question'});
  expect(within(pattern).getAllByRole('button')).toHaveLength(8);expect(screen.queryByLabelText('Implementation context')).toBeNull();expect(mocks.runner).not.toHaveBeenCalled();
  fireEvent.click(within(pattern).getByRole('button',{name:/Pattern 0/}));await screen.findByRole('alert');expect(screen.getByText('Question 1 of 3')).toBeTruthy();
  await correctPattern();const structure=await screen.findByRole('region',{name:'Structure question'});expect(screen.getByText('Correct')).toBeTruthy();expect(screen.getByText('Question 2 of 3')).toBeTruthy();expect(screen.queryByLabelText('Chosen code structure')).toBeNull();expect(screen.queryByLabelText('Code structure scaffold')).toBeNull();
  fireEvent.click(within(structure).getByRole('button',{name:/Plan 0/}));expect(screen.getByText('Not quite')).toBeTruthy();expect(screen.queryByLabelText('Implementation context')).toBeNull();expect(screen.getByText('Question 2 of 3')).toBeTruthy();
  await correctStructure();const implementation=await screen.findByRole('region',{name:'Implementation question'});expect(within(implementation).getAllByRole('button')).toHaveLength(3);expect(screen.queryByLabelText('Chosen code structure')).toBeNull();
  fireEvent.click(within(implementation).getByRole('button',{name:/return \[0, 0\]/}));expect(screen.getByText('Question 3 of 3')).toBeTruthy();expect(screen.getByText('This reuses one index.')).toBeTruthy();expect(screen.getByText('See the counterexample')).toBeTruthy();expect(mocks.runner).not.toHaveBeenCalled();
  fireEvent.click(within(implementation).getByRole('button',{name:/return \[0, 1\]/}));await screen.findByRole('region',{name:'Completed test code'});expect(mocks.runner.mock.calls[0][0].code).toBe(lesson().source);
 });
 it('persists progress independently for each language and hides stale-language questions while loading',async()=>{
  const first=show();await correctPattern();await correctStructure();first.unmount();
  const js=show('javascript');await screen.findByText('Question 1 of 3');expect(screen.queryByLabelText('Implementation context')).toBeNull();await correctPattern();js.unmount();
  const py=show();await screen.findByText('Question 1 of 3');expect(screen.queryByLabelText('Implementation context')).toBeNull();await correctPattern();await correctStructure();await screen.findByText('Question 3 of 3');expect(screen.getByLabelText('Implementation context').textContent).toContain('def twoSum');
  let resolveJS!:(value:GuidedLesson)=>void;mocks.load.mockImplementation(()=>new Promise(resolve=>{resolveJS=resolve;}));
  py.rerender(<MemoryRouter><GuidedPractice problem={problem} language="javascript" onLanguageChange={()=>{}}/></MemoryRouter>);
  expect(screen.queryByLabelText('Implementation context')).toBeNull();expect(screen.getByText('Loading guided questions…')).toBeTruthy();
  resolveJS(lesson('javascript'));await screen.findByText('Question 1 of 3');expect(screen.queryByLabelText('Implementation context')).toBeNull();await correctPattern();await screen.findByText('Question 2 of 3');expect(JSON.parse(localStorage.getItem('lc-guided-progress-1-python')!).answered).toHaveLength(2);
 });
 it('starts fresh for corrupted or obsolete progress, and supports restarting after completion',async()=>{
  localStorage.setItem('lc-guided-progress-1-python',JSON.stringify({revision:'old',answered:['pattern','structure'],attempts:2}));show();await correctPattern();await correctStructure();fireEvent.click(await screen.findByRole('button',{name:/return \[0, 1\]/}));await screen.findByRole('region',{name:'Completed test code'});
  const restart=screen.getByRole('button',{name:'Start again'});restart.focus();fireEvent.click(restart);expect(screen.queryByRole('region',{name:'Completed test code'})).toBeNull();expect(screen.getByText('Question 1 of 3')).toBeTruthy();expect(screen.queryByText('Correct')).toBeNull();expect(document.activeElement).toBe(screen.getByRole('heading',{name:'Which approach fits this lesson?'}));
 });
 it('uses the matching JavaScript implementation and retries a failed lesson download',async()=>{
  mocks.load.mockRejectedValueOnce(new Error('offline'));show('javascript');await screen.findByRole('alert');fireEvent.click(screen.getByRole('button',{name:'Retry questions'}));await correctPattern();await correctStructure();expect(screen.getByLabelText('Implementation context').textContent).toContain('function twoSum');fireEvent.click(await screen.findByRole('button',{name:/return \[0, 1\];/}));await screen.findByRole('region',{name:'Completed test code'});await waitFor(()=>expect(mocks.runner.mock.calls[0][0].language).toBe('javascript'));
 });
 it('requires approach and structure again before resuming saved implementation, and does not finish before its final question',async()=>{
  const full=lesson();
  const implementation=full.questions[2];
  full.questions=[...full.questions.slice(0,2),
   {...implementation,id:'loop',prompt:'How should the loop continue?',choices:implementation.choices.map(choice=>({...choice,code:undefined,label:choice.correct?'Use the loop condition':'Skip the loop'}))},
   {...implementation,id:'update',prompt:'How should the result change?',choices:implementation.choices.map(choice=>({...choice,code:undefined,label:choice.correct?'Update the earlier index':'Update the current index'}))},
   {...implementation,id:'finish',prompt:'What finishes the solution?'}];
  mocks.load.mockResolvedValue(full);
  const first=show();await correctPattern();await correctStructure();
  fireEvent.click(await screen.findByRole('button',{name:/Use the loop condition/}));
  await screen.findByText('Question 4 of 5');expect(mocks.runner).not.toHaveBeenCalled();first.unmount();
  const resumed=show();await screen.findByText('Question 1 of 5');expect(screen.queryByLabelText('Implementation context')).toBeNull();
  expect(screen.getByText(/Review the approach and each structure step/)).toBeTruthy();
  await correctPattern();await screen.findByText('Question 2 of 5');expect(screen.queryByLabelText('Implementation context')).toBeNull();
  await correctStructure();await screen.findByText('Question 4 of 5');
  fireEvent.click(screen.getByRole('button',{name:/Update the earlier index/}));await screen.findByText('Question 5 of 5');expect(mocks.runner).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:/return \[0, 1\]/}));await screen.findByRole('region',{name:'Completed test code'});
  resumed.unmount();mocks.runner.mockClear();show();await screen.findByText('Question 1 of 5');
  await correctPattern();await correctStructure();await screen.findByText('Question 3 of 5');expect(mocks.runner).not.toHaveBeenCalled();
 });
});

describe('guided step navigation', () => {
 beforeEach(() => mocks.load.mockImplementation((_id, language) => Promise.resolve(navigationLesson(language))));

 it.each(['python', 'javascript'] as const)('goes back across stage boundaries in %s without retaining feedback or counting navigation as answers', async language => {
  show(language);
  const approach = await screen.findByRole('region', {name:'Approach question'});
  expect((screen.getByRole('button', {name:'Previous step'}) as HTMLButtonElement).disabled).toBe(true);
  expect(within(approach).queryByRole('button', {name:'Skip step'})).toBeNull();
  expect(within(approach).getAllByRole('button')).toHaveLength(8);
  expect(screen.queryByRole('button', {name:'Next step'})).toBeNull();

  await correctPattern();
  await correctStructure();
  await correctStructure();
  const implementation = await screen.findByRole('region', {name:'Implementation question'});
  fireEvent.click(within(implementation).getByRole('button', {name:/return \[0, 0\]/}));
  expect(screen.getByRole('alert').textContent).toContain('This reuses one index.');
  expect(within(implementation).getByRole('button', {name:/return \[0, 0\]/}).getAttribute('data-attempted')).toBe('true');
  const beforeNavigation = savedProgress(language);
  expect(beforeNavigation.attempts).toBe(4);

  navigateStep('Previous step');
  expect(screen.getByRole('heading', {name:'When should we check the saved values?'})).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByText('Correct')).toBeNull();
  expect(screen.queryByRole('button', {name:'Skip step'})).toBeNull();
  expect(within(screen.getByRole('region', {name:'Structure question'})).queryByRole('button', {name:'Next step'})).toBeNull();
  navigateStep('Next step');
  expect(screen.getByRole('heading', {name:'How should the first code step work?'})).toBeTruthy();
  expect(screen.getByRole('button', {name:/return \[0, 0\]/}).getAttribute('data-attempted')).toBe('false');
  expect(screen.queryByText('Try a different choice')).toBeNull();
  expect(screen.queryByRole('button', {name:'Next step'})).toBeNull();

  navigateStep('Previous step');
  navigateStep('Previous step');
  expect(screen.getByRole('heading', {name:'What should we remember?'})).toBeTruthy();
  navigateStep('Previous step');
  expect(screen.getByRole('heading', {name:'Which approach fits this lesson?'})).toBeTruthy();
  expect((screen.getByRole('button', {name:'Previous step'}) as HTMLButtonElement).disabled).toBe(true);
  navigateStep('Next step');
  expect(screen.getByRole('heading', {name:'What should we remember?'})).toBeTruthy();
  expect(savedProgress(language)).toEqual(beforeNavigation);
 });

 it.each(['python', 'javascript'] as const)('can skip through the final %s step, revisit it, answer it, and restart without treating skips as correct', async language => {
  show(language);
  await screen.findByRole('region', {name:'Approach question'});
  const full = navigationLesson(language);
  for (const question of full.questions) {
   expect(screen.getByRole('heading', {name:question.prompt})).toBeTruthy();
   const card = screen.getByRole('region', {name:`${question.stage === 'pattern' ? 'Approach' : question.stage === 'structure' ? 'Structure' : 'Implementation'} question`});
   expect(within(card).queryByRole('button', {name:'Previous step'})).toBeNull();
   expect(within(card).queryByRole('button', {name:'Skip step'})).toBeNull();
   navigateStep('Skip step');
  }
  await screen.findByRole('region', {name:'Completed test code'});
  expect(savedProgress(language)).toMatchObject({answered:[], skipped:full.questions.map(question => question.id), attempts:0});
  expect(document.querySelector('.guided-complete')?.textContent).toContain('6 skipped');
  expect(document.querySelector('.guided-complete')?.textContent).not.toContain('DECISIONS COMPLETE');
  expect(document.querySelector('.guided-progress')?.textContent).toContain('0 answered');
  expect(document.querySelector('.guided-progress')?.textContent).not.toContain('6 decisions complete');
  for (const stage of ['pattern', 'structure', 'implementation'] as const) expectStageDone(stage, false);
  expect((screen.getByRole('button', {name:'Previous step'}) as HTMLButtonElement).disabled).toBe(false);
  expect(screen.queryByRole('button', {name:'Skip step'})).toBeNull();

  navigateStep('Previous step');
  expect(screen.getByRole('heading', {name:'How should the final code step work?'})).toBeTruthy();
  expect(screen.queryByRole('region', {name:'Completed test code'})).toBeNull();
  await correctImplementation();
  await screen.findByRole('region', {name:'Completed test code'});
  expect(savedProgress(language)).toMatchObject({answered:['code-final'], skipped:full.questions.slice(0, -1).map(question => question.id), attempts:1});
  expect(document.querySelector('.guided-complete')?.textContent).toContain('5 skipped');
  expectStageDone('implementation', false);
  navigateStep('Previous step');
  expect(screen.queryByRole('button', {name:'Skip step'})).toBeNull();
  navigateStep('Next step');
  await screen.findByRole('region', {name:'Completed test code'});
  expect(savedProgress(language).attempts).toBe(1);

  fireEvent.click(screen.getByRole('button', {name:'Start again'}));
  expect(screen.getByText('Question 1 of 6')).toBeTruthy();
  expect(screen.queryByRole('region', {name:'Completed test code'})).toBeNull();
  expect(savedProgress(language)).toMatchObject({answered:[], skipped:[], attempts:0});
  expect(document.activeElement).toBe(screen.getByRole('heading', {name:'Which approach fits this lesson?'}));
 });

 it.each(['python', 'javascript'] as const)('marks a %s stage done only after every decision in that stage is answered, including a revisited skip', async language => {
  show(language);
  await correctPattern();
  navigateStep('Skip step');
  await correctStructure();
  expectStageDone('pattern', true);
  expectStageDone('structure', false);
  await correctImplementation();
  await correctImplementation();
  await correctImplementation();
  await screen.findByRole('region', {name:'Completed test code'});
  expectStageDone('implementation', true);
  expectStageDone('structure', false);
  expect(document.querySelector('.guided-complete')?.textContent).toContain('1 skipped');
  expect(savedProgress(language)).toMatchObject({skipped:['plan-remember'], attempts:5});

  for (let count = 0; count < 5; count++) navigateStep('Previous step');
  expect(screen.getByRole('heading', {name:'What should we remember?'})).toBeTruthy();
  await correctStructure();
  expect(screen.getByRole('heading', {name:'When should we check the saved values?'})).toBeTruthy();
  expectStageDone('structure', true);
  expect(savedProgress(language).skipped).toEqual([]);
  expect(savedProgress(language).answered).toHaveLength(6);
  expect(savedProgress(language).attempts).toBe(6);
  // Answered count must not force completion while the cursor is on an earlier card.
  expect(screen.queryByRole('region', {name:'Completed test code'})).toBeNull();
  for (let count = 0; count < 4; count++) navigateStep('Next step');
  await screen.findByRole('region', {name:'Completed test code'});
  expect(document.querySelector('.guided-complete')?.textContent).toContain('DECISIONS COMPLETE');
  expect(savedProgress(language).attempts).toBe(6);
 });

 it.each(['python', 'javascript'] as const)('replays the opening after reloading %s gaps, resumes the first unvisited code step, and resets a fully traversed session next visit', async language => {
  const first = show(language);
  await correctPattern();
  navigateStep('Skip step');
  await correctStructure();
  navigateStep('Skip step');
  await correctImplementation();
  expect(screen.getByRole('heading', {name:'How should the final code step work?'})).toBeTruthy();
  expect(savedProgress(language)).toMatchObject({answered:['pattern', 'plan-order', 'code-middle'], skipped:['plan-remember', 'code-first'], attempts:3});
  first.unmount();

  const resumed = show(language);
  await screen.findByRole('heading', {name:'Which approach fits this lesson?'});
  expect(screen.queryByLabelText('Implementation context')).toBeNull();
  await correctPattern();
  expect(screen.getByRole('heading', {name:'What should we remember?'})).toBeTruthy();
  navigateStep('Skip step');
  await correctStructure();
  expect(screen.getByRole('heading', {name:'How should the final code step work?'})).toBeTruthy();
  expect(savedProgress(language).skipped).toEqual(['plan-remember', 'code-first']);
  expect(savedProgress(language).answered).toEqual(['pattern', 'plan-order', 'code-middle']);
  navigateStep('Skip step');
  await screen.findByRole('region', {name:'Completed test code'});
  expect(document.querySelector('.guided-complete')?.textContent).toContain('3 skipped');
  resumed.unmount();

  show(language);
  await screen.findByRole('heading', {name:'Which approach fits this lesson?'});
  expect(savedProgress(language)).toMatchObject({answered:[], skipped:[], attempts:0});
  expect(screen.queryByRole('button', {name:'Next step'})).toBeNull();
  await correctPattern();
  await correctStructure();
  await correctStructure();
  expect(screen.getByRole('heading', {name:'How should the first code step work?'})).toBeTruthy();
 });

 it('persists skipped cards independently for Python and JavaScript', async () => {
  const python = show('python');
  await screen.findByRole('region', {name:'Approach question'});
  navigateStep('Skip step');
  await correctStructure();
  navigateStep('Skip step');
  const pythonProgress = savedProgress('python');
  expect(pythonProgress).toMatchObject({answered:['plan-remember'], skipped:['pattern', 'plan-order'], attempts:1});
  python.unmount();
  const javascript = show('javascript');
  await correctPattern();
  navigateStep('Skip step');
  expect(savedProgress('javascript')).toMatchObject({answered:['pattern'], skipped:['plan-remember'], attempts:1});
  expect(savedProgress('python')).toEqual(pythonProgress);
  javascript.unmount();
  show('python');
  await screen.findByRole('region', {name:'Approach question'});
  expect(savedProgress('python')).toEqual(pythonProgress);
  expect(screen.getByRole('button', {name:'Skip step'})).toBeTruthy();
  expect(screen.queryByRole('button', {name:'Next step'})).toBeNull();
  expect(savedProgress('javascript').skipped).toEqual(['plan-remember']);
 });

 it.each(['python', 'javascript'] as const)('accepts legacy answered-only %s progress and resumes after reviewing every opening card', async language => {
  localStorage.setItem(`lc-guided-progress-1-${language}`, JSON.stringify({revision:'v1', answered:['pattern', 'plan-remember', 'plan-order', 'code-first'], attempts:4}));
  show(language);
  await screen.findByRole('region', {name:'Approach question'});
  expect(savedProgress(language)).toMatchObject({answered:['pattern', 'plan-remember', 'plan-order', 'code-first'], skipped:[], attempts:4});
  await correctPattern();
  await correctStructure();
  await correctStructure();
  expect(screen.getByRole('heading', {name:'How should the middle code step work?'})).toBeTruthy();
  expect(savedProgress(language).answered).toHaveLength(4);
  expect(savedProgress(language).skipped).toEqual([]);
 });

 it.each(['python', 'javascript'] as const)('reloads %s answers added out of order after returning to a skipped card', async language => {
  const first = show(language);
  await correctPattern();
  navigateStep('Skip step');
  await correctStructure();
  await correctImplementation();
  expect(screen.getByRole('heading', {name:'How should the middle code step work?'})).toBeTruthy();
  for (let count = 0; count < 3; count++) navigateStep('Previous step');
  await correctStructure();
  const saved = savedProgress(language);
  expect(saved.answered).toEqual(expect.arrayContaining(['pattern', 'plan-remember', 'plan-order', 'code-first']));
  expect(saved.answered).toHaveLength(4);
  expect(saved.skipped).toEqual([]);
  first.unmount();

  show(language);
  await screen.findByRole('region', {name:'Approach question'});
  expect(savedProgress(language)).toEqual(saved);
  await correctPattern();
  await correctStructure();
  await correctStructure();
  expect(screen.getByRole('heading', {name:'How should the middle code step work?'})).toBeTruthy();
 });

 it.each(['python', 'javascript'] as const)('continues to code after reloading %s progress saved partway through structure', async language => {
  localStorage.setItem(`lc-guided-progress-1-${language}`, JSON.stringify({revision:'v1', answered:['pattern', 'plan-remember'], skipped:[], attempts:2}));
  show(language);
  await correctPattern();
  await correctStructure();
  expect(screen.getByRole('heading', {name:'When should we check the saved values?'})).toBeTruthy();
  await correctStructure();
  expect(screen.getByRole('heading', {name:'How should the first code step work?'})).toBeTruthy();
  expect(savedProgress(language).answered).toEqual(['pattern', 'plan-remember', 'plan-order']);
 });

 it.each([
  {answered:['pattern'], skipped:'plan-remember'},
  {answered:['pattern'], skipped:['unknown-question']},
  {answered:['pattern'], skipped:['pattern']},
 ])('starts fresh for invalid saved skipped data: %j', async saved => {
  localStorage.setItem('lc-guided-progress-1-python', JSON.stringify({revision:'v1', attempts:1, ...saved}));
  show('python');
  await screen.findByRole('region', {name:'Approach question'});
  expect(savedProgress('python')).toMatchObject({answered:[], skipped:[], attempts:0});
  expect(screen.queryByRole('button', {name:'Next step'})).toBeNull();
  expect(screen.getByRole('button', {name:'Skip step'})).toBeTruthy();
 });
});

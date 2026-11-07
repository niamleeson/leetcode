import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogicEditor from './LogicEditor';
import type { LogicProblem } from '../../data/logic/types';

const mocks = vi.hoisted(() => ({ run: vi.fn(), stop: vi.fn(), dispose: vi.fn(), create: vi.fn() }));
vi.mock('./runtime/pythonRunner', () => ({ createPythonRunner: () => { mocks.create(); return { run: mocks.run, stop: mocks.stop, dispose: mocks.dispose }; } }));
const problem: LogicProblem = {
  id: 1, title: 'Two Sum', topic: 'Arrays & Hashing', difficulty: 'Easy', description: 'Return two distinct indices whose values sum to target.',
  examples: [{name:'Example',input:[[2,7],9],expected:[0,1]}],
  starter: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    pass\n',
  parameters: [{name:'nums',type:'list[int]'},{name:'target',type:'int'}],
  interfaces: [{kind:'function',name:'twoSum',signature:'def twoSum(nums: list[int], target: int) -> list[int]:',parameters:[{name:'nums',type:'list[int]'},{name:'target',type:'int'}],returnType:'list[int]'}],
  fixtures: [{name:'Example',entry:'twoSum',args:[[2,7],9],expected:[0,1]}], validation:{kind:'practice-cases',count:1,adversarialCount:0},
};
const failed = {passed:0,total:1,tests:[{name:'Example',input:[[2,7],9],expected:[0,1],actual:null,passed:false,trace:[],traceTruncated:false,executionEvents:2,stdout:''}]};
function show(p = problem) { return render(<MemoryRouter><LogicEditor problem={p}/></MemoryRouter>); }
function statement(code: string) {
  const candidates = Array.from(document.querySelectorAll<HTMLButtonElement>('.logic-action'));
  const button = candidates.find(b => b.querySelector('code')?.textContent === code);
  expect(button, `Statement ${code} available`).toBeTruthy(); fireEvent.click(button!);
}
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); Element.prototype.scrollIntoView = vi.fn(); mocks.run.mockResolvedValue(failed); });
afterEach(cleanup);

describe('logic practice learner interactions', () => {
  it('starts empty with competing operations and only creates Python on Run', async () => {
    show();
    expect(document.querySelectorAll('.logic-source-line').length).toBe(0);
    expect(document.querySelectorAll('.logic-action').length).toBeGreaterThan(1);
    expect(mocks.create).not.toHaveBeenCalled();
    statement('seen = {}');
    expect(mocks.create).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Run tests'}));
    await screen.findByText('0 / 1 practice tests passed');
    expect(mocks.run.mock.calls[0][0].code).toContain('    seen = {}');
    expect(mocks.run.mock.calls[0][0].code).not.toContain('return [');
  });
  it('saves each problem separately and restores drafts after reopening', () => {
    const first=show(); statement('seen = {}'); first.unmount();
    const other = show({...problem,id:217,title:'Other'});
    expect(document.querySelectorAll('.logic-source-line').length).toBe(0); other.unmount();
    show(); expect(document.querySelector('.logic-source-line')?.textContent).toContain('seen = {}');
  });
  it('clears stale test results when code changes and makes Clear undoable', async () => {
    show(); statement('seen = {}'); fireEvent.click(screen.getByRole('button',{name:'Run tests'}));
    await screen.findByText('0 / 1 practice tests passed');
    statement('seen = set()'); expect(screen.queryByRole('region',{name:'Test results'})).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:'Clear'})); expect(document.querySelectorAll('.logic-source-line').length).toBe(0);
    fireEvent.click(screen.getByRole('button',{name:'Undo'})); expect(document.querySelectorAll('.logic-source-line').length).toBe(2);
    fireEvent.click(screen.getByRole('button',{name:'Redo'})); expect(document.querySelectorAll('.logic-source-line').length).toBe(0);
  });
  it('changes operators by tapping and stops a pending run on unmount', async () => {
    const view=show(); fireEvent.click(screen.getByRole('button',{name:'Check'}));
    statement('if nums[0] == target:');
    fireEvent.click(screen.getByRole('button',{name:/^Line \d+: if nums\[0\] == target:/}));
    fireEvent.click(screen.getByRole('button',{name:/^Change == at position/}));
    fireEvent.click(screen.getByRole('button',{name:'!='}));
    expect(document.querySelector('.logic-source-line')?.textContent).toContain('if nums[0] != target:');
    fireEvent.click(screen.getByRole('button',{name:'Done'}));
    mocks.run.mockImplementation(() => new Promise(() => {}));
    fireEvent.click(screen.getByRole('button',{name:'Run tests'}));
    fireEvent.click(await screen.findByRole('button',{name:'Stop'})); expect(mocks.stop).toHaveBeenCalledOnce();
    view.unmount(); expect(mocks.dispose).toHaveBeenCalledOnce();
  });
  it('recovers from invalid saved data and retryable runner errors', async () => {
    localStorage.setItem('lc-logic-draft-1','{invalid');
    mocks.run.mockRejectedValueOnce(new Error('Connection interrupted. Retry.'));
    show(); fireEvent.click(screen.getByRole('button',{name:'Run tests'}));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button',{name:'Run tests'}));
    await waitFor(() => expect(mocks.run).toHaveBeenCalledTimes(2));
    await screen.findByText('0 / 1 practice tests passed');
  });
  it('keeps the actual executed line beside its variables on a small screen', async () => {
    mocks.run.mockResolvedValue({...failed, tests:[{...failed.tests[0],trace:[{line:4,kind:'statement',functionName:'twoSum',locals:{seen:'{}'},stack:['twoSum']}]}]});
    show(); statement('seen = {}'); fireEvent.click(screen.getByRole('button',{name:'Run tests'}));
    fireEvent.click(await screen.findByRole('button',{name:'Step through'}));
    expect(screen.getByLabelText('Current executed statement').textContent).toBe('seen = {}');
    expect(document.querySelector('.logic-locals')?.textContent).toContain('seen{}');
  });
  it('shows design-operation inputs alongside expected outputs', async () => {
    show({...problem,fixtures:[{...problem.fixtures[0],operations:[['push',[5]],['getMin',[]]]}]});
    fireEvent.click(screen.getByRole('button',{name:'Run tests'}));
    await screen.findByText('Calls in order');
    expect(document.querySelector('.logic-operation-list')?.textContent).toContain('1. push(5)');
    expect(document.querySelector('.logic-operation-list')?.textContent).toContain('2. getMin()');
  });
});

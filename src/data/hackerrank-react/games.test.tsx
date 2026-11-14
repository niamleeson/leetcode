import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { gameChallenges } from './games';
import { loadSolution } from './greatfrontend/testUtils';

const code = (slug: string) => loadSolution(gameChallenges.find(game => game.slug === slug)!.code);
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('the five published game solutions', () => {
  it('compiles all complete snippets', () => {
    expect(gameChallenges).toHaveLength(5);
    for (const game of gameChallenges) expect(loadSolution(game.code).default).toBeTypeOf('function');
  });
  it('plays Tic-tac-toe, stops a win, detects a draw, and resets', () => {
    const { default: Game, winner } = code('tic-tac-toe');
    render(<Game />);
    for (const square of [1,4,2,5,3]) fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Square ${square}:`) }));
    expect(screen.getByRole('status')).toHaveTextContent('X wins');
    expect(screen.getByRole('button', { name: 'Square 9: empty' })).toBeDisabled();
    expect(winner(['X','O','X','X','O','O','O','X','X'])).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Reset game' }));
    for (const square of [1,2,3,5,4,6,8,7,9]) fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Square ${square}:`) }));
    expect(screen.getByRole('status')).toHaveTextContent('Draw');
    fireEvent.click(screen.getByRole('button', { name: 'Reset game' }));
    expect(screen.getByRole('status')).toHaveTextContent('X to play');
  });
  it('blocks third memory flips, hides mismatches, and cancels a timer on reset', () => {
    vi.useFakeTimers();
    const { default: Game } = code('memory-matching');
    render(<Game initialCards={[{id:0,value:'A'},{id:1,value:'B'},{id:2,value:'A'},{id:3,value:'B'}]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Card 1: hidden' }));
    fireEvent.click(screen.getByRole('button', { name: 'Card 2: hidden' }));
    expect(screen.getByRole('button', { name: 'Card 3: hidden' })).toBeDisabled();
    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByRole('button', { name: 'Card 1: hidden' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Card 1: hidden' }));
    fireEvent.click(screen.getByRole('button', { name: 'Card 2: hidden' }));
    fireEvent.click(screen.getByRole('button', { name: 'New game' }));
    fireEvent.click(screen.getByRole('button', { name: 'Card 1: hidden' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('button', { name: /^Card 1:/ })).not.toHaveTextContent('?');
    expect(screen.getByRole('status')).toHaveTextContent('Moves: 0');
  });
  it('keeps memory matches visible and announces completion', () => {
    const { default: Game, makeDeck, memoryReducer } = code('memory-matching');
    expect(makeDeck(() => 0).map((c: any) => c.value).sort()).toEqual('AABBCCDDEEFF'.split(''));
    const cards = [{id:0,value:'A'},{id:1,value:'A'}];
    let state = { cards, flipped: [], matched: [], moves: 0 };
    state = memoryReducer(state, {type:'flip',id:0});
    expect(memoryReducer(state, {type:'flip',id:0})).toBe(state);
    render(<Game initialCards={cards} />);
    fireEvent.click(screen.getByRole('button', {name:'Card 1: hidden'}));
    fireEvent.click(screen.getByRole('button', {name:'Card 2: hidden'}));
    expect(screen.getByRole('status')).toHaveTextContent('All pairs found! Moves: 1');
  });
  it('uses Connect Four gravity, rejects full columns, and detects every direction without wrapping', () => {
    const { default: Game, drop, winner } = code('connect-four');
    let state = {board:Array(42).fill(null),turn:'Red'};
    for (let i=0;i<6;i++) state = drop(state, 0);
    expect(state.board[35]).toBe('Red');
    expect(drop(state,0)).toBe(state);
    for (const cells of [[35,36,37,38],[0,7,14,21],[0,8,16,24],[6,12,18,24]]) {
      const board = Array(42).fill(null); cells.forEach(i=>board[i]='Red');
      expect(winner(board)).toBe('Red');
    }
    const wrapped = Array(42).fill(null); [5,6,7,8].forEach(i=>wrapped[i]='Red');
    expect(winner(wrapped)).toBeNull();
    render(<Game />);
    for (const col of [1,2,1,2,1,2,1]) fireEvent.click(screen.getByRole('button',{name:`Drop in column ${col}`}));
    expect(screen.getByRole('status')).toHaveTextContent('Red wins');
    expect(screen.getByRole('button',{name:'Drop in column 7'})).toBeDisabled();
  });
  it('generates distinct mines with a safe first reveal and correct edge counts', () => {
    const {createBoard,neighbors} = code('minesweeper');
    for(let safe=0;safe<64;safe++) {
      const board = createBoard(safe,()=>0.37);
      expect(board[safe]).not.toBe(-1);
      expect(board.filter((v:number)=>v===-1)).toHaveLength(10);
      for(let i=0;i<64;i++) if(board[i]!==-1) expect(board[i]).toBe(neighbors(i).filter((n:number)=>board[n]===-1).length);
    }
    expect(neighbors(0).sort((a:number,b:number)=>a-b)).toEqual([1,8,9]);
  });
  it('flood fills safely, protects flags, stops on loss, and wins by revealing safe cells', () => {
    const {fresh,minesReducer,neighbors} = code('minesweeper');
    const board = Array(64).fill(0); board[63]=-1; neighbors(63).forEach((i:number)=>board[i]=1);
    let state = minesReducer(fresh(),{type:'flag',index:0});
    state = minesReducer(state,{type:'reveal',index:1,board});
    expect(state.revealed[0]).toBe(false);
    expect(state.phase).toBe('playing');
    state = minesReducer(state,{type:'flag',index:0});
    state = minesReducer(state,{type:'reveal',index:0});
    expect(state.phase).toBe('won');
    expect(minesReducer(state,{type:'reveal',index:63})).toBe(state);
    const lost = minesReducer({...fresh(),board,phase:'playing'},{type:'reveal',index:63});
    expect(lost.phase).toBe('lost');
    expect(minesReducer(lost,{type:'flag',index:0})).toBe(lost);
    expect(minesReducer(lost,{type:'reset'}).board).toBeNull();
  });
  it('supports keyboard-accessible Minesweeper flag mode', () => {
    const {default:Game} = code('minesweeper'); render(<Game />);
    fireEvent.click(screen.getByRole('button',{name:'Flag mode'}));
    fireEvent.click(screen.getByRole('button',{name:'Row 1 column 1: hidden'}));
    expect(screen.getByRole('button',{name:'Row 1 column 1: flagged'})).toHaveTextContent('F');
    fireEvent.click(screen.getByRole('button',{name:'New game'}));
    expect(screen.getByRole('button',{name:'Flag mode'})).toHaveAttribute('aria-pressed','false');
  });
  it('solves Sudoku without mutating clues and rejects invalid input', () => {
    const {PUZZLE,solve,conflicts} = code('sudoku');
    const original=[...PUZZLE], answer=solve(PUZZLE);
    expect(answer).toHaveLength(81); expect(answer.every(Boolean)).toBe(true); expect(conflicts(answer).size).toBe(0);
    expect(PUZZLE).toEqual(original);
    PUZZLE.forEach((n:number,i:number)=>{if(n) expect(answer[i]).toBe(n);});
    const invalid=[...PUZZLE]; invalid[2]=5;
    expect(solve(invalid)).toBeNull(); expect([...conflicts(invalid)]).toEqual(expect.arrayContaining([0,2]));
    expect(solve([0])).toBeNull();
  });
  it('keeps Sudoku clues read-only, highlights edits, solves, and resets', () => {
    const {default:Game} = code('sudoku'); render(<Game />);
    expect(screen.getByLabelText('Row 1 column 1')).toHaveAttribute('readonly');
    const cell=screen.getByLabelText('Row 1 column 3');
    fireEvent.change(cell,{target:{value:'5'}});
    expect(cell).toHaveAttribute('aria-invalid','true');
    fireEvent.click(screen.getByRole('button',{name:'Solve'}));
    expect(screen.getByRole('status')).toHaveTextContent('No solution');
    fireEvent.change(cell,{target:{value:''}});
    fireEvent.change(cell,{target:{value:'x'}});
    expect(cell).toHaveValue('');
    fireEvent.click(screen.getByRole('button',{name:'Solve'}));
    expect(screen.getByRole('status')).toHaveTextContent('Puzzle solved!');
    fireEvent.click(screen.getByRole('button',{name:'Reset puzzle'}));
    expect(screen.getByLabelText('Row 1 column 3')).toHaveValue('');
  });
});

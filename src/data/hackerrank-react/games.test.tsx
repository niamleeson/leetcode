import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { gameChallenges } from './games';
import { loadSolution } from './greatfrontend/testUtils';

const code = (slug: string) => loadSolution(gameChallenges.find(game => game.slug === slug)!.code);
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('the published game solutions', () => {
  it('compiles all complete snippets', () => {
    expect(gameChallenges).toHaveLength(6);
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
    fireEvent.click(screen.getByRole('button', { name: 'Card 3: hidden' }));
    expect(screen.getByRole('button', { name: 'Card 3: hidden' })).toHaveTextContent('?');
    expect(screen.getByRole('status')).toHaveTextContent('Moves: 1');
    act(() => vi.advanceTimersByTime(799));
    expect(screen.getByRole('button', { name: 'Card 1: A' })).toHaveTextContent('A');
    expect(screen.getByRole('button', { name: 'Card 2: B' })).toHaveTextContent('B');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('button', { name: 'Card 1: hidden' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Card 2: hidden' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Card 1: hidden' }));
    fireEvent.click(screen.getByRole('button', { name: 'Card 2: hidden' }));
    fireEvent.click(screen.getByRole('button', { name: 'New game' }));
    expect(screen.getAllByRole('button', {name:/^Card \d+: hidden$/})).toHaveLength(16);
    fireEvent.click(screen.getByRole('button', { name: 'Card 1: hidden' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('button', { name: /^Card 1:/ })).not.toHaveTextContent('?');
    expect(screen.getByRole('status')).toHaveTextContent('Moves: 0');
  });
  it('deals sixteen unique cards, completes all eight pairs, and resets the full deck', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.37);
    const { default: Game, makeDeck } = code('memory-matching');
    const cards = makeDeck(() => 0.37);
    expect(cards).toHaveLength(16);
    expect(new Set(cards.map((card: any) => card.id)).size).toBe(16);
    expect(cards.map((card: any) => card.value).sort()).toEqual('AABBCCDDEEFFGGHH'.split(''));
    render(<Game />);
    expect(screen.getAllByRole('button', {name:/^Card \d+: hidden$/})).toHaveLength(16);
    for (const value of 'ABCDEFGH') {
      cards.forEach((card: any, index: number) => {
        if (card.value === value) {
          fireEvent.click(screen.getByRole('button', {name:`Card ${index + 1}: hidden`}));
        }
      });
    }
    expect(screen.getByRole('status')).toHaveTextContent('All pairs found! Moves: 8');
    for (const card of screen.getAllByRole('button', {name:/^Card /})) expect(card).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name:'New game'}));
    const resetCards = screen.getAllByRole('button', {name:/^Card \d+: hidden$/});
    expect(resetCards).toHaveLength(16);
    for (const card of resetCards) expect(card).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('Moves: 0');
    expect(screen.getByRole('status')).not.toHaveTextContent('All pairs found!');
  });
  it('ignores duplicate memory flips, keeps matches visible, and announces completion', () => {
    const { default: Game } = code('memory-matching');
    const cards = [{id:0,value:'A'},{id:1,value:'A'},{id:2,value:'B'},{id:3,value:'B'}];
    render(<Game initialCards={cards} />);
    fireEvent.click(screen.getByRole('button', {name:'Card 1: hidden'}));
    fireEvent.click(screen.getByRole('button', {name:'Card 1: A'}));
    expect(screen.getByRole('status')).toHaveTextContent('Moves: 0');
    expect(screen.getByRole('button', {name:'Card 2: hidden'})).toBeEnabled();
    fireEvent.click(screen.getByRole('button', {name:'Card 2: hidden'}));
    expect(screen.getByRole('button', {name:'Card 1: A'})).toBeDisabled();
    expect(screen.getByRole('button', {name:'Card 2: A'})).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Moves: 1');
    expect(screen.getByRole('status')).not.toHaveTextContent('All pairs found!');
    fireEvent.click(screen.getByRole('button', {name:'Card 1: A'}));
    fireEvent.click(screen.getByRole('button', {name:'Card 3: hidden'}));
    expect(screen.getByRole('button', {name:'Card 1: A'})).toHaveTextContent('A');
    expect(screen.getByRole('button', {name:'Card 2: A'})).toHaveTextContent('A');
    fireEvent.click(screen.getByRole('button', {name:'Card 4: hidden'}));
    expect(screen.getByRole('status')).toHaveTextContent('All pairs found! Moves: 2');
    for (const card of screen.getAllByRole('button', {name:/^Card /})) expect(card).toBeDisabled();
  });
  it('cancels the pending memory mismatch timer on unmount', () => {
    vi.useFakeTimers();
    const { default: Game } = code('memory-matching');
    const { unmount } = render(<Game initialCards={[{id:0,value:'A'},{id:1,value:'B'}]} />);
    fireEvent.click(screen.getByRole('button', {name:'Card 1: hidden'}));
    fireEvent.click(screen.getByRole('button', {name:'Card 2: hidden'}));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['solution', 'optimized solution'])('uses Connect Four gravity, rejects full columns, detects every direction and a draw, and restarts (%s)', version => {
    const game = gameChallenges.find(item => item.slug === 'connect-four')!;
    const { default: Game } = loadSolution(version === 'solution' ? game.code : game.solutionSections![0].code!);
    render(<Game />);
    const column = (col: number) => screen.getByRole('button', { name: new RegExp(`^Drop \\w+ in column ${col}$`) });
    const play = (cols: number[]) => cols.forEach(col => fireEvent.click(column(col)));
    const restart = () => fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    play([1]);
    expect(screen.getByTitle('Row 6, column 1: Red')).toHaveTextContent('R');
    play([3,3,3,3,3,3]);
    expect(column(3)).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Current player: Yellow');
    play([3]);
    expect(screen.getByRole('status')).toHaveTextContent('Current player: Yellow');
    // Horizontal, a disc filling the middle of a line, vertical, and both diagonals; only the last move completes four.
    for (const cols of [[1,1,2,2,3,3,4],[1,1,2,2,4,4,3],[1,2,1,2,1,2,1],[1,2,2,3,4,3,3,4,5,4,4],[7,6,6,5,4,5,5,4,3,4,4]]) {
      restart();
      play(cols.slice(0, -1));
      expect(screen.getByRole('status')).toHaveTextContent('Current player: Red');
      play(cols.slice(-1));
      expect(screen.getByRole('status')).toHaveTextContent('Red wins!');
      expect(column(7)).toBeDisabled();
    }
    restart();
    play([1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,5,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,7,7]);
    expect(screen.getByRole('status')).toHaveTextContent('Draw!');
    restart();
    expect(screen.getByRole('status')).toHaveTextContent('Current player: Red');
    expect(screen.getAllByTitle(/: empty$/)).toHaveLength(42);
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
  it('protects flags during a safe first reveal and flood fill, then wins by opening every safe cell', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const {default: Game, createBoard} = code('minesweeper');
    const board = createBoard(63, () => 0);
    const cell = (index: number) => screen.getByRole('button', {
      name: new RegExp(`^Row ${Math.floor(index / 8) + 1} column ${index % 8 + 1}:`),
    });
    render(<Game />);
    fireEvent.contextMenu(cell(62));
    fireEvent.click(cell(62));
    expect(cell(62)).toHaveAccessibleName('Row 8 column 7: flagged');
    expect(screen.queryAllByRole('button', {name:/adjacent mines$/})).toHaveLength(0);
    fireEvent.click(cell(63));
    expect(board[63]).toBe(0);
    expect(cell(63)).toHaveAccessibleName('Row 8 column 8: 0 adjacent mines');
    expect(screen.getAllByRole('button', {name:/adjacent mines$/}).length).toBeGreaterThan(1);
    expect(cell(62)).toHaveAccessibleName('Row 8 column 7: flagged');
    board.forEach((value: number, index: number) => {
      if (value === -1) expect(cell(index)).toHaveAccessibleName(/hidden$/);
      else if (index !== 62) fireEvent.click(cell(index));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Find the safe cells');
    fireEvent.contextMenu(cell(62));
    fireEvent.click(cell(62));
    expect(screen.getByRole('status')).toHaveTextContent('You win!');
    for (const button of screen.getAllByRole('button', {name:/^Row /})) expect(button).toBeDisabled();
  });
  it('reveals mines on loss, locks the board, and starts a fresh game on reset', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const {default: Game, createBoard} = code('minesweeper');
    const board = createBoard(0, () => 0);
    const cell = (index: number) => screen.getByRole('button', {
      name: new RegExp(`^Row ${Math.floor(index / 8) + 1} column ${index % 8 + 1}:`),
    });
    render(<Game />);
    fireEvent.click(cell(0));
    expect(cell(0)).toHaveAccessibleName(`Row 1 column 1: ${board[0]} adjacent mines`);
    const mine = board.indexOf(-1);
    fireEvent.click(cell(mine));
    expect(screen.getByRole('status')).toHaveTextContent('Game over');
    expect(screen.getAllByRole('button', {name:/: mine$/})).toHaveLength(10);
    for (const button of screen.getAllByRole('button', {name:/^Row /})) expect(button).toBeDisabled();
    const hidden = screen.getAllByRole('button', {name:/: hidden$/})[0];
    fireEvent.click(hidden);
    fireEvent.contextMenu(hidden);
    expect(hidden).toHaveAccessibleName(/hidden$/);
    expect(screen.getByRole('status')).toHaveTextContent('Flags: 0/10');
    fireEvent.click(screen.getByRole('button', {name:'New game'}));
    expect(screen.getByRole('status')).toHaveTextContent('Find the safe cells');
    expect(screen.getAllByRole('button', {name:/: hidden$/})).toHaveLength(64);
    for (const button of screen.getAllByRole('button', {name:/^Row /})) expect(button).toBeEnabled();
    fireEvent.click(cell(mine));
    expect(cell(mine)).toHaveAccessibleName(/adjacent mines$/);
    expect(screen.getByRole('status')).not.toHaveTextContent('Game over');
  });
  it('supports keyboard-accessible Minesweeper flag mode', () => {
    const {default:Game} = code('minesweeper'); render(<Game />);
    fireEvent.click(screen.getByRole('button',{name:'Flag mode'}));
    fireEvent.click(screen.getByRole('button',{name:'Row 1 column 1: hidden'}));
    expect(screen.getByRole('button',{name:'Row 1 column 1: flagged'})).toHaveTextContent('F');
    fireEvent.click(screen.getByRole('button',{name:'New game'}));
    expect(screen.getByRole('button',{name:'Flag mode'})).toHaveAttribute('aria-pressed','false');
    expect(screen.getByRole('status')).toHaveTextContent('Flags: 0/10');
    expect(screen.getAllByRole('button',{name:/: hidden$/})).toHaveLength(64);
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

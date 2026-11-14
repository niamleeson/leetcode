import { useReducer } from 'react';

export const ROWS = 8, COLS = 8, MINES = 10;
export function neighbors(index) {
  const result = [], row = Math.floor(index / COLS), col = index % COLS;
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const r = row + dr, c = col + dc;
    if ((dr || dc) && r >= 0 && r < ROWS && c >= 0 && c < COLS) result.push(r * COLS + c);
  }
  return result;
}
export function createBoard(safeIndex, random = Math.random) {
  const candidates = Array.from({ length: ROWS * COLS }, (_, i) => i).filter(i => i !== safeIndex);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const board = Array(ROWS * COLS).fill(0);
  candidates.slice(0, MINES).forEach(i => { board[i] = -1; });
  return board.map((value, i) => value === -1 ? -1 : neighbors(i).filter(n => board[n] === -1).length);
}
export const fresh = () => ({ board: null, revealed: Array(64).fill(false), flags: Array(64).fill(false), phase: 'ready', flagMode: false });
export function minesReducer(state, action) {
  if (action.type === 'reset') return fresh();
  if (action.type === 'mode') return { ...state, flagMode: !state.flagMode };
  const i = action.index;
  if (!Number.isInteger(i) || i < 0 || i >= 64 || ['won', 'lost'].includes(state.phase) || state.revealed[i]) return state;
  if (action.type === 'flag') {
    const flags = [...state.flags]; flags[i] = !flags[i];
    return { ...state, flags };
  }
  if (action.type !== 'reveal' || state.flags[i]) return state;
  const board = state.board || action.board;
  if (!board) return state;
  const revealed = [...state.revealed];
  if (board[i] === -1) {
    revealed[i] = true;
    return { ...state, board, revealed, phase: 'lost' };
  }
  const queue = [i];
  revealed[i] = true;
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const cell = queue[cursor];
    if (board[cell] !== 0) continue;
    for (const next of neighbors(cell)) {
      if (!revealed[next] && !state.flags[next] && board[next] !== -1) {
        revealed[next] = true; queue.push(next);
      }
    }
  }
  const won = board.every((value, index) => value === -1 || revealed[index]);
  return { ...state, board, revealed, phase: won ? 'won' : 'playing' };
}

export default function Minesweeper() {
  const [state, dispatch] = useReducer(minesReducer, undefined, fresh);
  function reveal(index) {
    // Randomness stays in the event handler, outside the pure reducer.
    dispatch({ type: 'reveal', index, board: state.board || createBoard(index) });
  }
  return <section aria-label="Minesweeper">
    <p role="status">{state.phase === 'won' ? 'You win!' : state.phase === 'lost' ? 'Game over' : 'Find the safe cells'} · Flags: {state.flags.filter(Boolean).length}/{MINES}</p>
    <button aria-pressed={state.flagMode} onClick={() => dispatch({ type: 'mode' })}>Flag mode</button>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 36px)', gap: 2 }}>
      {state.revealed.map((open, i) => {
        const mine = state.board?.[i] === -1;
        const value = state.phase === 'lost' && mine ? '*' : open ? (state.board[i] || '·') : state.flags[i] ? 'F' : '';
        const label = open || (state.phase === 'lost' && mine) ? (mine ? 'mine' : `${state.board[i]} adjacent mines`) : state.flags[i] ? 'flagged' : 'hidden';
        return <button key={i} aria-label={`Row ${Math.floor(i / COLS) + 1} column ${i % COLS + 1}: ${label}`}
          disabled={open || ['won', 'lost'].includes(state.phase)} style={{ height: 36 }}
          onClick={() => state.flagMode ? dispatch({ type: 'flag', index: i }) : reveal(i)}
          onContextMenu={event => { event.preventDefault(); dispatch({ type: 'flag', index: i }); }}>{value}</button>;
      })}
    </div>
    <button onClick={() => dispatch({ type: 'reset' })}>New game</button>
  </section>;
}

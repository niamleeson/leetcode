import { useState } from 'react';

export const ROWS = 6, COLS = 7;
const fresh = () => ({ board: Array(ROWS * COLS).fill(null), turn: 'Red' });
export function winner(board) {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const color = board[r * COLS + c];
    if (!color) continue;
    for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
      const endR = r + 3 * dr, endC = c + 3 * dc;
      if (endR < 0 || endR >= ROWS || endC < 0 || endC >= COLS) continue;
      if ([1,2,3].every(n => board[(r + n * dr) * COLS + c + n * dc] === color)) return color;
    }
  }
  return null;
}
export function drop(state, column) {
  if (!Number.isInteger(column) || column < 0 || column >= COLS || winner(state.board)) return state;
  for (let row = ROWS - 1; row >= 0; row--) {
    const index = row * COLS + column;
    if (!state.board[index]) {
      const board = [...state.board];
      board[index] = state.turn;
      return { board, turn: state.turn === 'Red' ? 'Yellow' : 'Red' };
    }
  }
  return state; // A full column does not consume a turn.
}

export default function ConnectFour() {
  const [state, setState] = useState(fresh);
  const result = winner(state.board);
  const draw = !result && state.board.every(Boolean);
  return <section aria-label="Connect four">
    <p role="status">{result ? `${result} wins` : draw ? 'Draw' : `${state.turn} to play`}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 40px)', gap: 3 }}>
      {Array.from({ length: COLS }, (_, c) => <button key={c} aria-label={`Drop in column ${c + 1}`}
        disabled={Boolean(state.board[c] || result || draw)} onClick={() => setState(current => drop(current, c))}>↓</button>)}
      {state.board.map((color, i) => <div key={i}
        aria-label={`Row ${Math.floor(i / COLS) + 1} column ${i % COLS + 1}: ${color || 'empty'}`}
        style={{ height: 40, border: '1px solid #64748b', borderRadius: '50%', textAlign: 'center', lineHeight: '40px',
          color: '#111827', background: color === 'Red' ? '#f87171' : color === 'Yellow' ? '#fde047' : '#e2e8f0' }}>
        {color ? color[0] : '·'}
      </div>)}
    </div>
    <button onClick={() => setState(fresh())}>Reset game</button>
  </section>;
}

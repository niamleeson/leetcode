import { useState } from 'react';

export const PUZZLE = [
  '530070000', '600195000', '098000060',
  '800060003', '400803001', '700020006',
  '060000280', '000419005', '000080079',
].join('').split('').map(Number);

export function conflicts(board) {
  const bad = new Set();
  const groups = [];
  for (let n = 0; n < 9; n++) {
    groups.push(Array.from({ length: 9 }, (_, c) => n * 9 + c));
    groups.push(Array.from({ length: 9 }, (_, r) => r * 9 + n));
    const row = Math.floor(n / 3) * 3, col = (n % 3) * 3;
    groups.push(Array.from({ length: 9 }, (_, i) => (row + Math.floor(i / 3)) * 9 + col + i % 3));
  }
  for (const group of groups) {
    const seen = new Map();
    for (const index of group) {
      const value = board[index];
      if (!value) continue;
      if (seen.has(value)) { bad.add(index); bad.add(seen.get(value)); }
      else seen.set(value, index);
    }
  }
  return bad;
}

export function solve(input) {
  if (input.length !== 81 || input.some(n => !Number.isInteger(n) || n < 0 || n > 9) || conflicts(input).size) return null;
  const board = [...input];
  function search() {
    // Pick the empty cell with the fewest legal candidates.
    let best = -1, candidates = [];
    for (let i = 0; i < 81; i++) {
      if (board[i]) continue;
      const options = [];
      for (let value = 1; value <= 9; value++) {
        board[i] = value;
        if (!conflicts(board).size) options.push(value);
      }
      board[i] = 0;
      if (!options.length) return false;
      if (best === -1 || options.length < candidates.length) { best = i; candidates = options; }
    }
    if (best === -1) return true;
    for (const value of candidates) {
      board[best] = value;
      if (search()) return true;
    }
    board[best] = 0;
    return false;
  }
  return search() ? board : null;
}

export default function Sudoku() {
  const [board, setBoard] = useState(() => [...PUZZLE]);
  const [message, setMessage] = useState('');
  const bad = conflicts(board);
  const complete = board.every(Boolean) && bad.size === 0;
  function change(index, text) {
    if (PUZZLE[index] || !/^[1-9]?$/.test(text)) return;
    setBoard(current => current.map((value, i) => i === index ? Number(text) : value));
    setMessage('');
  }
  function solveBoard() {
    const answer = solve(board);
    if (answer) { setBoard(answer); setMessage(''); }
    else setMessage('No solution for these entries. Correct them or reset.');
  }
  return <section aria-label="Sudoku">
    <p role="status">{complete ? 'Puzzle solved!' : message || (bad.size ? 'Conflicting entries' : 'Fill each row, column, and box with 1–9')}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 32px)' }}>
      {board.map((value, i) => <input key={i} aria-label={`Row ${Math.floor(i / 9) + 1} column ${i % 9 + 1}`}
        aria-invalid={bad.has(i)} inputMode="numeric" maxLength={1} readOnly={Boolean(PUZZLE[i])}
        value={value || ''} onChange={event => change(i, event.target.value)}
        style={{ boxSizing: 'border-box', width: 32, height: 36, textAlign: 'center', color: '#111827',
          fontWeight: PUZZLE[i] ? 'bold' : 'normal', background: bad.has(i) ? '#fecaca' : PUZZLE[i] ? '#e2e8f0' : 'white',
          border: '1px solid #94a3b8', borderRightWidth: i % 3 === 2 ? 3 : 1,
          borderBottomWidth: Math.floor(i / 9) % 3 === 2 ? 3 : 1 }} />)}
    </div>
    <button onClick={solveBoard} disabled={complete}>Solve</button>
    <button onClick={() => { setBoard([...PUZZLE]); setMessage(''); }}>Reset puzzle</button>
  </section>;
}

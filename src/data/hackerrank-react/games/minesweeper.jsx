import { useState } from 'react';

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
    // Inclusive range: Math.floor(random() * (max - min + 1)) + min.
    // min = 0; max = i, which starts at candidates.length - 1.
    const j = Math.floor(random() * (i - 0 + 1)) + 0;
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const board = Array(ROWS * COLS).fill(0);
  candidates.slice(0, MINES).forEach(i => { board[i] = -1; });
  return board.map((value, i) => value === -1 ? -1 : neighbors(i).filter(n => board[n] === -1).length);
}
function createInitialState() {
  return {
    board: null,
    revealed: Array(ROWS * COLS).fill(false),
    flags: Array(ROWS * COLS).fill(false),
    phase: 'ready',
    flagMode: false,
  };
}

function canChangeCell(state, index) {
  // Only hidden cells in an unfinished game can change.
  return state.phase !== 'won' && state.phase !== 'lost' &&
    !state.revealed[index];
}

export default function Minesweeper() {
  const [state, setState] = useState(createInitialState);

  function handleReveal(index) {
    // Ignore revealed or flagged cells, and stop accepting moves after the game ends.
    if (!canChangeCell(state, index) || state.flags[index]) return;

    const board = state.board || createBoard(index);
    const revealed = [...state.revealed];

    // Hitting a mine ends the game immediately, without expanding nearby cells.
    if (board[index] === -1) {
      revealed[index] = true;
      setState({ ...state, board, revealed, phase: 'lost' });
      return;
    }

    // Open this cell, then expand through connected empty cells.
    const queue = [index];
    revealed[index] = true;

    for (let cursor = 0; cursor < queue.length; cursor++) {
      const cell = queue[cursor];
      // Reveal numbered cells, but stop the empty-area expansion at their boundary.
      if (board[cell] !== 0) continue;

      for (const next of neighbors(cell)) {
        if (!revealed[next] && !state.flags[next] && board[next] !== -1) {
          revealed[next] = true;
          queue.push(next);
        }
      }
    }

    const won = board.every((value, cell) => value === -1 || revealed[cell]);
    setState({ ...state, board, revealed, phase: won ? 'won' : 'playing' });
  }

  function handleFlag(index) {
    // Only place or remove flags on hidden cells before the game ends.
    if (!canChangeCell(state, index)) return;

    const flags = [...state.flags];
    flags[index] = !flags[index];
    setState({ ...state, flags });
  }

  function handleToggleFlagMode() {
    setState(previous => ({ ...previous, flagMode: !previous.flagMode }));
  }

  function handleNewGame() {
    setState(createInitialState());
  }

  return <section aria-label="Minesweeper">
    <p role="status">{state.phase === 'won' ? 'You win!' : state.phase === 'lost' ? 'Game over' : 'Find the safe cells'} · Flags: {state.flags.filter(Boolean).length}/{MINES}</p>
    <button aria-pressed={state.flagMode} onClick={handleToggleFlagMode}>Flag mode</button>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 36px)', gap: 2 }}>
      {state.revealed.map((open, i) => {
        const mine = state.board?.[i] === -1;
        const value = state.phase === 'lost' && mine ? '*' : open ? (state.board[i] || '·') : state.flags[i] ? 'F' : '';
        const label = open || (state.phase === 'lost' && mine) ? (mine ? 'mine' : `${state.board[i]} adjacent mines`) : state.flags[i] ? 'flagged' : 'hidden';
        return <button key={i} aria-label={`Row ${Math.floor(i / COLS) + 1} column ${i % COLS + 1}: ${label}`}
          disabled={open || ['won', 'lost'].includes(state.phase)} style={{ height: 36 }}
          onClick={() => state.flagMode ? handleFlag(i) : handleReveal(i)}
          onContextMenu={event => { event.preventDefault(); handleFlag(i); }}>{value}</button>;
      })}
    </div>
    <button onClick={handleNewGame}>New game</button>
  </section>;
}

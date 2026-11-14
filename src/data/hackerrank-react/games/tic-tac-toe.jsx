import { useState } from 'react';

export function winner(board) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

export default function TicTacToe() {
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const result = winner(board);
  const draw = !result && board.every(Boolean);
  const next = board.filter(Boolean).length % 2 === 0 ? 'X' : 'O';
  function play(index) {
    setBoard(current => {
      if (current[index] || winner(current)) return current;
      const copy = [...current];
      copy[index] = current.filter(Boolean).length % 2 === 0 ? 'X' : 'O';
      return copy;
    });
  }
  return <section aria-label="Tic-tac-toe">
    <p role="status">{result ? `${result} wins` : draw ? 'Draw' : `${next} to play`}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: 4 }}>
      {board.map((value, index) => <button key={index}
        aria-label={`Square ${index + 1}: ${value || 'empty'}`}
        disabled={Boolean(value || result || draw)} onClick={() => play(index)}
        style={{ height: 64, fontSize: 28 }}>{value || '·'}</button>)}
    </div>
    <button onClick={() => setBoard(Array(9).fill(null))}>Reset game</button>
  </section>;
}

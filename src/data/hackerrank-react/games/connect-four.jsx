import { useState } from "react";

const ROWS = 6;
const COLS = 7;

const DIRECTIONS = [
  [0, 1],  // Right
  [1, 0],  // Down
  [1, 1],  // Down-right
  [1, -1], // Down-left
];

function createBoard() {
  // fill() gives map real slots to visit; map creates a separate array for each row.
  return Array(ROWS).fill().map(() => Array(COLS).fill(null));
}

function getWinner(board) {
  // Treat each occupied cell as a potential start of a winning line.
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const player = board[row][col];

      if (player === null) {
        continue;
      }

      for (const [dr, dc] of DIRECTIONS) {
        let count = 0;

        for (let step = 0; step < 4; step++) {
          const r = row + dr * step;
          const c = col + dc * step;

          // Out-of-bounds positions evaluate to undefined.
          // A different player or an empty cell also breaks the line.
          if (board[r]?.[c] !== player) {
            break;
          }

          count++;
        }

        if (count === 4) {
          return player;
        }
      }
    }
  }

  return null;
}

export default function ConnectFour() {
  const [board, setBoard] = useState(createBoard);
  const [player, setPlayer] = useState("Red");

  const winner = getWinner(board);

  const isDraw =
    !winner &&
    board.every((row) => row.every((cell) => cell !== null));

  const gameOver = Boolean(winner) || isDraw;

  function handleDrop(col) {
    if (gameOver) {
      return;
    }

    // Start at the bottom and move up until we find an empty cell.
    let row = ROWS - 1;

    while (row >= 0 && board[row][col] !== null) {
      row--;
    }

    // The entire column is full.
    if (row < 0) {
      return;
    }

    // Copy every row because the board is a nested array.
    const nextBoard = board.map((currentRow) => [...currentRow]);
    nextBoard[row][col] = player;

    setBoard(nextBoard);
    setPlayer(player === "Red" ? "Yellow" : "Red");
  }

  function resetGame() {
    setBoard(createBoard());
    setPlayer("Red");
  }

  let status = `Current player: ${player}`;

  if (winner) {
    status = `${winner} wins!`;
  } else if (isDraw) {
    status = "Draw!";
  }

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Connect Four</h1>

      <p role="status">{status}</p>
      <p>Choose a column to drop your disc.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 44px)`,
          gap: 4,
          padding: 8,
          width: "fit-content",
          background: "#2563eb",
          borderRadius: 8,
        }}
      >
        {/* One control per column. */}
        {board[0].map((_, col) => (
          <button
            key={`drop-${col}`}
            type="button"
            onClick={() => handleDrop(col)}
            disabled={gameOver || board[0][col] !== null}
            aria-label={`Drop ${player} in column ${col + 1}`}
            style={{ height: 32 }}
          >
            ↓
          </button>
        ))}

        {/* Render the board below the column controls. */}
        {board.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              title={
                `Row ${rowIndex + 1}, column ${colIndex + 1}: ` +
                (cell ?? "empty")
              }
              style={{
                height: 44,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontWeight: "bold",
                color: cell === "Red" ? "#fff" : "#111",
                background:
                  cell === "Red"
                    ? "#dc2626"
                    : cell === "Yellow"
                      ? "#fde047"
                      : "#fff",
              }}
            >
              {cell === "Red" ? "R" : cell === "Yellow" ? "Y" : ""}
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={resetGame}
        style={{ marginTop: 16 }}
      >
        Restart
      </button>
    </main>
  );
}

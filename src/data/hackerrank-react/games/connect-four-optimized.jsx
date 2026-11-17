import { useState } from "react";

const ROWS = 6;
const COLS = 7;

// Each line is a pair of opposite directions to walk from the newest disc.
const LINES = [
  [[0, 1], [0, -1]],   // Horizontal: right + left
  [[1, 0], [-1, 0]],   // Vertical: down + up
  [[1, 1], [-1, -1]],  // "\" diagonal: down-right + up-left
  [[1, -1], [-1, 1]],  // "/" diagonal: down-left + up-right
];

function createBoard() {
  // fill() gives map real slots to visit; map creates a separate array for each row.
  return Array(ROWS).fill().map(() => Array(COLS).fill(null));
}

// Count matching discs walking away from (row, col), not counting the start disc.
function countInDirection(board, row, col, dr, dc) {
  const player = board[row][col];
  let count = 0;
  let r = row + dr;
  let c = col + dc;

  // Out-of-bounds positions evaluate to undefined, which ends the line.
  while (board[r]?.[c] === player) {
    count++;
    r += dr;
    c += dc;
  }

  return count;
}

// Any new line of four must include the disc that was just dropped.
function isWinningMove(board, row, col) {
  for (const [[dr1, dc1], [dr2, dc2]] of LINES) {
    // The new disc can be anywhere in the line, so add both halves together.
    const total =
      1 + // the disc just dropped
      countInDirection(board, row, col, dr1, dc1) +
      countInDirection(board, row, col, dr2, dc2);

    if (total >= 4) {
      return true;
    }
  }

  return false;
}

export default function ConnectFour() {
  const [board, setBoard] = useState(createBoard);
  const [player, setPlayer] = useState("Red");
  const [winner, setWinner] = useState(null);

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

    // Only the disc just dropped can create a new line of four.
    if (isWinningMove(nextBoard, row, col)) {
      setWinner(player);
    }
  }

  function resetGame() {
    setBoard(createBoard());
    setPlayer("Red");
    setWinner(null);
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

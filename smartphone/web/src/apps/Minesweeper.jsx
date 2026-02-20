import { useState, useCallback, useEffect, useRef } from "react";

// ============================================================
// Minesweeper App — Visual V0 pixel-perfect
// Classic 9x9 grid, flags, timer, smiley | Zero backend
// ============================================================

const ROWS = 9;
const COLS = 9;
const MINES = 10;

function createBoard() {
  const board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      isMine: false, revealed: false, flagged: false, adjacentMines: 0,
    }))
  );
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placed++;
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) count++;
        }
      }
      board[r][c].adjacentMines = count;
    }
  }
  return board;
}

const NUMBER_COLORS = {
  1: "#0000FF", 2: "#008000", 3: "#FF0000", 4: "#000080",
  5: "#800000", 6: "#008080", 7: "#000000", 8: "#808080",
};

export default function Minesweeper() {
  const [board, setBoard] = useState(() => createBoard());
  const [gameState, setGameState] = useState("playing");
  const [flagMode, setFlagMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const flagCount = board.flat().filter((c) => c.flagged).length;

  useEffect(() => {
    if (started && gameState === "playing") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    if (gameState !== "playing" && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [started, gameState]);

  const revealCell = useCallback((row, col, currentBoard) => {
    const newBoard = currentBoard.map((r) => r.map((c) => ({ ...c })));
    const stack = [[row, col]];
    while (stack.length > 0) {
      const [r, c] = stack.pop();
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
      if (newBoard[r][c].revealed || newBoard[r][c].flagged) continue;
      newBoard[r][c].revealed = true;
      if (newBoard[r][c].adjacentMines === 0 && !newBoard[r][c].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            stack.push([r + dr, c + dc]);
          }
        }
      }
    }
    return newBoard;
  }, []);

  const handleCellClick = useCallback((row, col) => {
    if (gameState !== "playing") return;
    const cell = board[row][col];
    if (cell.revealed) return;

    if (!started) setStarted(true);

    if (flagMode) {
      setBoard((prev) => {
        const newBoard = prev.map((r) => r.map((c) => ({ ...c })));
        newBoard[row][col].flagged = !newBoard[row][col].flagged;
        return newBoard;
      });
      return;
    }

    if (cell.flagged) return;

    if (cell.isMine) {
      setBoard((prev) => {
        const newBoard = prev.map((r) => r.map((c) => ({ ...c })));
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (newBoard[r][c].isMine) newBoard[r][c].revealed = true;
          }
        }
        return newBoard;
      });
      setGameState("lost");
      return;
    }

    const newBoard = revealCell(row, col, board);
    setBoard(newBoard);

    const unrevealed = newBoard.flat().filter((c) => !c.revealed && !c.isMine).length;
    if (unrevealed === 0) {
      setGameState("won");
    }
  }, [board, gameState, flagMode, started, revealCell]);

  const resetGame = useCallback(() => {
    setBoard(createBoard());
    setGameState("playing");
    setTimer(0);
    setStarted(false);
    setFlagMode(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const smiley = gameState === "won" ? "B)" : gameState === "lost" ? "X(" : ":)";

  return (
    <div style={{
      width: "100%", height: "100%", background: "#C0C0C0",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "8px 16px", background: "#808080",
      }}>
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 800, letterSpacing: 2 }}>MINESWEEPER</span>
      </div>

      {/* Status bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", background: "#C0C0C0",
        borderBottom: "3px solid #808080", borderTop: "3px solid #fff",
      }}>
        <div style={{
          background: "#000", padding: "4px 8px", borderRadius: 2,
          border: "2px inset #808080", minWidth: 50, textAlign: "center",
        }}>
          <span style={{ color: "#FF0000", fontSize: 20, fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
            {String(MINES - flagCount).padStart(3, "0")}
          </span>
        </div>

        <button onClick={resetGame} style={{
          width: 36, height: 36, borderRadius: 4,
          background: "#C0C0C0",
          border: "3px outset #fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700,
        }}>
          {smiley}
        </button>

        <div style={{
          background: "#000", padding: "4px 8px", borderRadius: 2,
          border: "2px inset #808080", minWidth: 50, textAlign: "center",
        }}>
          <span style={{ color: "#FF0000", fontSize: 20, fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
            {formatTime(timer)}
          </span>
        </div>
      </div>

      {/* Flag mode toggle */}
      <div style={{
        display: "flex", justifyContent: "center", padding: "6px",
        background: "#C0C0C0",
      }}>
        <button onClick={() => setFlagMode(!flagMode)} style={{
          padding: "6px 20px", borderRadius: 4,
          background: flagMode ? "#FF4444" : "#808080",
          border: flagMode ? "3px inset #C0C0C0" : "3px outset #fff",
          color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill={flagMode ? "#fff" : "#FF0000"}>
            <path d="M4 2v20M4 2l12 7-12 7"/>
          </svg>
          {flagMode ? "Modo: Bandeira" : "Modo: Revelar"}
        </button>
      </div>

      {/* Game result */}
      {gameState !== "playing" && (
        <div style={{
          textAlign: "center", padding: "6px",
          background: gameState === "won" ? "#4CAF50" : "#F44336",
        }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>
            {gameState === "won" ? "VOCE VENCEU!" : "GAME OVER!"}
          </span>
        </div>
      )}

      {/* Grid */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 8, background: "#C0C0C0",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 1,
          width: "100%",
          maxWidth: 320,
          border: "3px inset #808080",
          background: "#808080",
        }}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                style={{
                  aspectRatio: "1/1",
                  border: cell.revealed
                    ? "1px solid #808080"
                    : "3px outset #fff",
                  background: cell.revealed
                    ? (cell.isMine ? "#FF4444" : "#C0C0C0")
                    : "#C0C0C0",
                  cursor: gameState === "playing" && !cell.revealed ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0,
                  fontSize: 14, fontWeight: 800,
                }}
              >
                {cell.revealed ? (
                  cell.isMine ? (
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="#000">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="2" x2="12" y2="7" stroke="#000" strokeWidth="2"/>
                      <line x1="12" y1="17" x2="12" y2="22" stroke="#000" strokeWidth="2"/>
                      <line x1="2" y1="12" x2="7" y2="12" stroke="#000" strokeWidth="2"/>
                      <line x1="17" y1="12" x2="22" y2="12" stroke="#000" strokeWidth="2"/>
                      <line x1="5" y1="5" x2="8.5" y2="8.5" stroke="#000" strokeWidth="2"/>
                      <line x1="15.5" y1="15.5" x2="19" y2="19" stroke="#000" strokeWidth="2"/>
                      <line x1="5" y1="19" x2="8.5" y2="15.5" stroke="#000" strokeWidth="2"/>
                      <line x1="15.5" y1="8.5" x2="19" y2="5" stroke="#000" strokeWidth="2"/>
                    </svg>
                  ) : cell.adjacentMines > 0 ? (
                    <span style={{ color: NUMBER_COLORS[cell.adjacentMines] || "#000" }}>
                      {cell.adjacentMines}
                    </span>
                  ) : null
                ) : cell.flagged ? (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M4 2v20M4 2l12 7-12 7"/>
                  </svg>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

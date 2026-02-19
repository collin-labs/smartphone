import { useState, useCallback } from 'react';

const C = {
  bg:'#0A0A0A', surface:'#1A1A1A', elevated:'#242424',
  text:'#FFFFFF', textSec:'#A0A0A0',
  sep:'#2A2A2A', green:'#30D158', red:'#FF453A',
  blue:'#0A84FF', yellow:'#FFD60A', purple:'#BF5AF2',
};
const COLS = 9, ROWS = 9, MINES = 10;
const NUM_COLORS = ['','#0A84FF','#30D158','#FF453A','#5856D6','#FF2D55','#00C7BE','#000','#888'];

function createBoard() {
  const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => ({ mine:false, revealed:false, flagged:false, adjacent:0 })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random()*ROWS), c = Math.floor(Math.random()*COLS);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    if (board[r][c].mine) continue;
    let cnt = 0;
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      const nr=r+dr, nc=c+dc;
      if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&board[nr][nc].mine) cnt++;
    }
    board[r][c].adjacent = cnt;
  }
  return board;
}

function reveal(board, r, c) {
  if (r<0||r>=ROWS||c<0||c>=COLS||board[r][c].revealed||board[r][c].flagged) return;
  board[r][c].revealed = true;
  if (board[r][c].adjacent === 0 && !board[r][c].mine) {
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) reveal(board, r+dr, c+dc);
  }
}

export default function Minesweeper() {
  const [board, setBoard] = useState(() => createBoard());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [timerRef, setTimerRef] = useState(null);

  const startTimer = () => {
    if (started) return;
    setStarted(true);
    const ref = setInterval(() => setTime(t => t + 1), 1000);
    setTimerRef(ref);
  };

  const stopTimer = () => { if (timerRef) clearInterval(timerRef); };

  const handleClick = (r, c) => {
    if (gameOver || won || board[r][c].revealed || board[r][c].flagged) return;
    startTimer();
    const newBoard = board.map(row => row.map(cell => ({...cell})));
    if (newBoard[r][c].mine) {
      newBoard.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true; }));
      setBoard(newBoard); setGameOver(true); stopTimer(); return;
    }
    reveal(newBoard, r, c);
    // Check win
    let unrevealed = 0;
    newBoard.forEach(row => row.forEach(cell => { if (!cell.revealed) unrevealed++; }));
    if (unrevealed === MINES) { setWon(true); stopTimer(); }
    setBoard(newBoard);
  };

  const handleFlag = (e, r, c) => {
    e.preventDefault();
    if (gameOver || won || board[r][c].revealed) return;
    const newBoard = board.map(row => row.map(cell => ({...cell})));
    newBoard[r][c].flagged = !newBoard[r][c].flagged;
    setBoard(newBoard);
  };

  const restart = () => {
    stopTimer(); setBoard(createBoard()); setGameOver(false); setWon(false); setTime(0); setStarted(false);
  };

  const flagCount = board.flat().filter(c => c.flagged).length;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:C.text, fontSize:20, fontWeight:700 }}>💣 Minas</span>
        <button onClick={restart} style={{ background:C.elevated, border:'none', cursor:'pointer', padding:'6px 14px', borderRadius:8, color:C.text, fontSize:13, fontWeight:600 }}>
          {gameOver ? '😵 Novo' : won ? '🎉 Novo' : '🔄 Reset'}
        </button>
      </div>
      {/* Stats */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'0 16px 8px' }}>
        <span style={{ color:C.red, fontSize:16, fontFamily:'monospace', fontWeight:700 }}>💣 {MINES - flagCount}</span>
        <span style={{ color:C.text, fontSize:16, fontFamily:'monospace', fontWeight:700 }}>⏱️ {time}s</span>
      </div>
      {/* Board */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:8 }}>
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${COLS},1fr)`, gap:2, width:'100%', maxWidth:320 }}>
          {board.map((row, r) => row.map((cell, c) => (
            <button key={`${r}-${c}`} onClick={()=>handleClick(r,c)} onContextMenu={e=>handleFlag(e,r,c)}
              style={{
                aspectRatio:'1', borderRadius:4, border:'none', cursor:'pointer',
                fontSize:cell.revealed && cell.adjacent > 0 ? 15 : 14, fontWeight:700,
                background: cell.revealed ? (cell.mine ? C.red+'44' : C.surface) : C.elevated,
                color: cell.revealed && cell.adjacent > 0 ? NUM_COLORS[cell.adjacent] : C.text,
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.1s',
              }}>
              {cell.flagged && !cell.revealed ? '🚩' :
               cell.revealed && cell.mine ? '💣' :
               cell.revealed && cell.adjacent > 0 ? cell.adjacent : ''}
            </button>
          )))}
        </div>
      </div>
      {(gameOver || won) && (
        <div style={{ textAlign:'center', padding:'12px 16px', background: won ? C.green+'22' : C.red+'22' }}>
          <span style={{ color: won ? C.green : C.red, fontSize:16, fontWeight:700 }}>
            {won ? `🎉 Vitória em ${time}s!` : '💥 BOOM! Game Over'}
          </span>
        </div>
      )}
      <div style={{ padding:'8px 16px 12px', textAlign:'center' }}>
        <span style={{ color:C.textSec, fontSize:11 }}>Toque = revelar • Segure = bandeira</span>
      </div>
    </div>
  );
}

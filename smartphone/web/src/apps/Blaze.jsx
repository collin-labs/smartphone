import React, { useState, useCallback, useEffect, useRef } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Blaze/Casino App — Double/Crash/Mines/Coinflip
// Vermelho accent, dark mode, saldo, apostas
// Handlers: blaze_init, blaze_double_bet, blaze_double_history,
//   blaze_crash_bet, blaze_crash_cashout, blaze_crash_history,
//   blaze_mines_start, blaze_mines_reveal, blaze_mines_cashout,
//   blaze_coinflip_bet
// ============================================================

const DOUBLE_HISTORY = [
  { id: 1, color: "red", number: 3 },
  { id: 2, color: "black", number: 11 },
  { id: 3, color: "red", number: 7 },
  { id: 4, color: "white", number: 0 },
  { id: 5, color: "black", number: 9 },
  { id: 6, color: "red", number: 1 },
  { id: 7, color: "black", number: 13 },
  { id: 8, color: "red", number: 5 },
  { id: 9, color: "black", number: 10 },
  { id: 10, color: "red", number: 2 },
  { id: 11, color: "black", number: 8 },
  { id: 12, color: "red", number: 4 },
];

const CRASH_HISTORY = [
  { id: 1, multiplier: 2.34 },
  { id: 2, multiplier: 1.12 },
  { id: 3, multiplier: 5.67 },
  { id: 4, multiplier: 1.45 },
  { id: 5, multiplier: 15.2 },
  { id: 6, multiplier: 1.03 },
  { id: 7, multiplier: 3.89 },
  { id: 8, multiplier: 1.78 },
];

export default function BlazeApp({ onNavigate }) {
  const [view, setView] = useState("double");
  const [balance, setBalance] = useState(2450.0);
  const [betAmount, setBetAmount] = useState("10");
  const [isPlaying, setIsPlaying] = useState(false);

  // Double state
  const [doubleColor, setDoubleColor] = useState(null);
  const [doubleResult, setDoubleResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [doubleHistory, setDoubleHistory] = useState(DOUBLE_HISTORY);

  // Crash state
  const [crashMultiplier, setCrashMultiplier] = useState(1.0);
  const [crashRunning, setCrashRunning] = useState(false);
  const [crashBet, setCrashBet] = useState(false);
  const [crashCashed, setCrashCashed] = useState(false);
  const [crashHistory, setCrashHistory] = useState(CRASH_HISTORY);
  const crashRef = useRef(null);

  // Mines state
  const [minesGrid, setMinesGrid] = useState([]);
  const [minesStarted, setMinesStarted] = useState(false);
  const [minesMultiplier, setMinesMultiplier] = useState(1.0);

  // Coinflip state
  const [coinResult, setCoinResult] = useState(null);
  const [coinChoice, setCoinChoice] = useState("cara");
  const [flipping, setFlipping] = useState(false);

  // ── blaze_init ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("blaze_init");
      if (res?.balance != null) setBalance(res.balance);
    })();
  }, []);

  // Crash game loop
  useEffect(() => {
    if (!crashRunning) return;
    crashRef.current = setInterval(() => {
      setCrashMultiplier((prev) => {
        const next = prev + (Math.random() * 0.05 + 0.01);
        if (Math.random() < 0.02 || next > 20) {
          setCrashRunning(false);
          setCrashBet(false);
          if (!crashCashed) {
            // Lost
          }
          return 1.0;
        }
        return parseFloat(next.toFixed(2));
      });
    }, 100);
    return () => { if (crashRef.current) clearInterval(crashRef.current); };
  }, [crashRunning, crashCashed]);

  // ── blaze_double_bet ──
  const playDouble = useCallback(async () => {
    if (!doubleColor || spinning) return;
    const bet = parseFloat(betAmount) || 0;
    if (bet <= 0 || bet > balance) return;
    setSpinning(true);
    setBalance((b) => b - bet);
    const res = await fetchBackend("blaze_double_bet", { color: doubleColor, amount: bet });
    setTimeout(() => {
      const colors = ["red", "red", "red", "red", "red", "red", "red", "black", "black", "black", "black", "black", "black", "black", "white"];
      const resultColor = res?.color || colors[Math.floor(Math.random() * colors.length)];
      const num = res?.number != null ? res.number : (resultColor === "white" ? 0 : Math.floor(Math.random() * 14) + 1);
      setDoubleResult({ id: 0, color: resultColor, number: num });
      if (resultColor === doubleColor) {
        const mult = resultColor === "white" ? 14 : 2;
        setBalance((b) => b + bet * mult);
      }
      if (res?.balance != null) setBalance(res.balance);
      setSpinning(false);
    }, 2000);
  }, [doubleColor, betAmount, balance, spinning]);

  // ── blaze_double_history ──
  const loadDoubleHistory = useCallback(async () => {
    const res = await fetchBackend("blaze_double_history");
    if (res?.history?.length) setDoubleHistory(res.history);
  }, []);

  // ── blaze_crash_bet ──
  const startCrash = useCallback(async () => {
    if (crashRunning) return;
    const bet = parseFloat(betAmount) || 0;
    if (bet <= 0 || bet > balance) return;
    setCrashMultiplier(1.0);
    setCrashRunning(true);
    setCrashBet(true);
    setCrashCashed(false);
    setBalance((b) => b - bet);
    await fetchBackend("blaze_crash_bet", { amount: bet });
  }, [crashRunning, betAmount, balance]);

  // ── blaze_crash_cashout ──
  const cashoutCrash = useCallback(async () => {
    setCrashCashed(true);
    const bet = parseFloat(betAmount) || 0;
    setBalance((b) => b + bet * crashMultiplier);
    const res = await fetchBackend("blaze_crash_cashout", { multiplier: crashMultiplier, amount: bet });
    if (res?.balance != null) setBalance(res.balance);
  }, [betAmount, crashMultiplier]);

  // ── blaze_crash_history ──
  const loadCrashHistory = useCallback(async () => {
    const res = await fetchBackend("blaze_crash_history");
    if (res?.history?.length) setCrashHistory(res.history);
  }, []);

  // ── blaze_mines_start ──
  const initMines = useCallback(async () => {
    const grid = Array.from({ length: 25 }, () => ({ revealed: false, isMine: false, gem: true }));
    const minePositions = new Set();
    while (minePositions.size < 5) {
      minePositions.add(Math.floor(Math.random() * 25));
    }
    minePositions.forEach((pos) => { grid[pos].isMine = true; grid[pos].gem = false; });
    setMinesGrid(grid);
    setMinesStarted(true);
    setMinesMultiplier(1.0);
    const bet = parseFloat(betAmount) || 0;
    if (bet > 0 && bet <= balance) setBalance((b) => b - bet);
    const res = await fetchBackend("blaze_mines_start", { amount: bet, mines: 5 });
    if (res?.grid) {
      setMinesGrid(res.grid.map((cell) => ({ revealed: false, isMine: !!cell.isMine, gem: !cell.isMine })));
    }
  }, [betAmount, balance]);

  // ── blaze_mines_reveal ──
  const revealMine = useCallback(async (index) => {
    if (!minesStarted) return;
    const res = await fetchBackend("blaze_mines_reveal", { index });
    setMinesGrid((prev) => {
      const next = [...prev];
      if (next[index].revealed) return next;
      next[index] = { ...next[index], revealed: true };
      if (res?.isMine || next[index].isMine) {
        next[index].isMine = true;
        setMinesStarted(false);
        return next.map((cell) => ({ ...cell, revealed: true }));
      } else {
        setMinesMultiplier((m) => parseFloat((m * 1.2).toFixed(2)));
      }
      return next;
    });
    if (res?.multiplier) setMinesMultiplier(res.multiplier);
  }, [minesStarted]);

  // ── blaze_mines_cashout ──
  const cashoutMines = useCallback(async () => {
    const bet = parseFloat(betAmount) || 0;
    setBalance((b) => b + bet * minesMultiplier);
    setMinesStarted(false);
    const res = await fetchBackend("blaze_mines_cashout", { multiplier: minesMultiplier, amount: bet });
    if (res?.balance != null) setBalance(res.balance);
  }, [betAmount, minesMultiplier]);

  // ── blaze_coinflip_bet ──
  const flipCoin = useCallback(async () => {
    if (flipping) return;
    const bet = parseFloat(betAmount) || 0;
    if (bet <= 0 || bet > balance) return;
    setFlipping(true);
    setBalance((b) => b - bet);
    setCoinResult(null);
    const res = await fetchBackend("blaze_coinflip_bet", { choice: coinChoice, amount: bet });
    setTimeout(() => {
      const result = res?.result || (Math.random() > 0.5 ? "cara" : "coroa");
      setCoinResult(result);
      if (result === coinChoice) {
        setBalance((b) => b + bet * 1.95);
      }
      if (res?.balance != null) setBalance(res.balance);
      setFlipping(false);
    }, 1500);
  }, [flipping, betAmount, balance, coinChoice]);

  const tabs = [
    { key: "double", label: "Double" },
    { key: "crash", label: "Crash" },
    { key: "mines", label: "Mines" },
    { key: "coinflip", label: "Flip" },
  ];

  return (
    <div style={{ width: "100%", height: "100%", background: "#0E0E12", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderBottom: "1px solid #1C1C24", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 4, background: "#FF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="#fff"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/></svg>
          </div>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>BLAZE</span>
        </div>
        <div style={{
          padding: "6px 14px", borderRadius: 20, background: "#1C1C24",
          border: "1px solid #2A2A35",
        }}>
          <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 700 }}>R$ {balance.toFixed(2)}</span>
        </div>
      </div>

      {/* Game tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1C1C24", flexShrink: 0 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setView(t.key)} style={{
            flex: 1, padding: "10px 0", background: "none", border: "none",
            color: view === t.key ? "#FF4444" : "#666",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            borderBottom: view === t.key ? "2px solid #FF4444" : "2px solid transparent",
            textTransform: "uppercase",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Game area */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* ======== DOUBLE ======== */}
        {view === "double" && (
          <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
            {/* History */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, overflowX: "auto", flexShrink: 0 }}>
              {doubleHistory.map((h) => (
                <div key={h.id} style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: h.color === "red" ? "#FF4444" : h.color === "black" ? "#2A2A35" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: h.color === "white" ? "#000" : "#fff",
                }}>
                  {h.number}
                </div>
              ))}
            </div>

            {/* Roulette visual */}
            <div style={{
              height: 100, borderRadius: 8, background: "#1C1C24",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16, overflow: "hidden", position: "relative",
            }}>
              {spinning ? (
                <div style={{ color: "#FF4444", fontSize: 24, fontWeight: 800 }}>Girando...</div>
              ) : doubleResult ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", margin: "0 auto 8px",
                    background: doubleResult.color === "red" ? "#FF4444" : doubleResult.color === "black" ? "#2A2A35" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: doubleResult.color === "white" ? "#000" : "#fff",
                  }}>
                    {doubleResult.number}
                  </div>
                  <div style={{ color: "#888", fontSize: 12 }}>
                    {doubleResult.color === doubleColor ? "Voce ganhou!" : "Voce perdeu!"}
                  </div>
                </div>
              ) : (
                <div style={{ color: "#666", fontSize: 14 }}>Escolha uma cor e aposte</div>
              )}
            </div>

            {/* Color selection */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[{ c: "red", bg: "#FF4444", label: "Vermelho 2x" }, { c: "white", bg: "#fff", label: "Branco 14x" }, { c: "black", bg: "#2A2A35", label: "Preto 2x" }].map((opt) => (
                <button key={opt.c} onClick={() => setDoubleColor(opt.c)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 8,
                  background: opt.bg, border: doubleColor === opt.c ? "2px solid #FFD700" : "2px solid transparent",
                  color: opt.c === "white" ? "#000" : "#fff",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Bet input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 8,
                  background: "#1C1C24", border: "1px solid #2A2A35",
                  color: "#fff", fontSize: 14, outline: "none",
                }}
              />
              {[10, 50, 100].map((v) => (
                <button key={v} onClick={() => setBetAmount(String(v))} style={{
                  padding: "10px 12px", borderRadius: 8,
                  background: "#1C1C24", border: "1px solid #2A2A35",
                  color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  {v}
                </button>
              ))}
            </div>

            <button onClick={playDouble} style={{
              width: "100%", padding: "14px", borderRadius: 8,
              background: spinning ? "#333" : "#FF4444",
              border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: spinning ? "default" : "pointer",
            }}>
              {spinning ? "Girando..." : "Apostar"}
            </button>
          </div>
        )}

        {/* ======== CRASH ======== */}
        {view === "crash" && (
          <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
            {/* History */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", flexShrink: 0 }}>
              {crashHistory.map((h) => (
                <span key={h.id} style={{
                  padding: "4px 8px", borderRadius: 4, flexShrink: 0,
                  background: h.multiplier >= 2 ? "rgba(0,200,83,0.15)" : "rgba(255,68,68,0.15)",
                  color: h.multiplier >= 2 ? "#00C853" : "#FF4444",
                  fontSize: 12, fontWeight: 700,
                }}>
                  {h.multiplier}x
                </span>
              ))}
            </div>

            {/* Crash display */}
            <div style={{
              flex: 1, minHeight: 160, borderRadius: 8, background: "#1C1C24",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16, position: "relative",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  color: crashRunning ? (crashMultiplier >= 2 ? "#00C853" : "#FF4444") : "#666",
                  fontSize: 48, fontWeight: 900,
                }}>
                  {crashRunning ? `${crashMultiplier.toFixed(2)}x` : "1.00x"}
                </div>
                {!crashRunning && !crashBet && (
                  <div style={{ color: "#666", fontSize: 13, marginTop: 8 }}>Aguardando proxima rodada...</div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 8,
                  background: "#1C1C24", border: "1px solid #2A2A35",
                  color: "#fff", fontSize: 14, outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={startCrash} style={{
                flex: 1, padding: "14px", borderRadius: 8,
                background: crashRunning ? "#333" : "#FF4444",
                border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: crashRunning ? "default" : "pointer",
              }}>
                Apostar
              </button>
              {crashRunning && crashBet && !crashCashed && (
                <button onClick={cashoutCrash} style={{
                  flex: 1, padding: "14px", borderRadius: 8,
                  background: "#00C853", border: "none",
                  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}>
                  Retirar {crashMultiplier.toFixed(2)}x
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======== MINES ======== */}
        {view === "mines" && (
          <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
            {minesStarted && (
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: "#1C1C24",
              }}>
                <span style={{ color: "#888", fontSize: 13 }}>Multiplicador:</span>
                <span style={{ color: "#FFD700", fontSize: 16, fontWeight: 700 }}>{minesMultiplier}x</span>
              </div>
            )}

            {/* Grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
              gap: 6, marginBottom: 16,
            }}>
              {(minesGrid.length > 0 ? minesGrid : Array.from({ length: 25 }, () => ({ revealed: false, isMine: false, gem: true }))).map((cell, i) => (
                <button
                  key={i}
                  onClick={() => minesStarted && revealMine(i)}
                  style={{
                    aspectRatio: "1/1", borderRadius: 8,
                    background: cell.revealed
                      ? (cell.isMine ? "#FF4444" : "#00C853")
                      : "#1C1C24",
                    border: "1px solid #2A2A35",
                    cursor: minesStarted && !cell.revealed ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {cell.revealed ? (cell.isMine ? (
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff">
                      <circle cx="12" cy="12" r="6"/><line x1="12" y1="2" x2="12" y2="6" stroke="#fff" strokeWidth="2"/>
                      <line x1="12" y1="18" x2="12" y2="22" stroke="#fff" strokeWidth="2"/>
                      <line x1="2" y1="12" x2="6" y2="12" stroke="#fff" strokeWidth="2"/>
                      <line x1="18" y1="12" x2="22" y2="12" stroke="#fff" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff">
                      <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8"/>
                    </svg>
                  )) : null}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {!minesStarted ? (
                <button onClick={initMines} style={{
                  flex: 1, padding: "14px", borderRadius: 8,
                  background: "#FF4444", border: "none",
                  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}>
                  Iniciar Jogo
                </button>
              ) : (
                <button onClick={cashoutMines} style={{
                  flex: 1, padding: "14px", borderRadius: 8,
                  background: "#00C853", border: "none",
                  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}>
                  Retirar {minesMultiplier}x
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======== COINFLIP ======== */}
        {view === "coinflip" && (
          <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Coin */}
            <div style={{
              width: 120, height: 120, borderRadius: "50%", marginTop: 24, marginBottom: 24,
              background: coinResult
                ? (coinResult === coinChoice ? "linear-gradient(135deg, #FFD700, #FFA500)" : "linear-gradient(135deg, #FF4444, #CC0000)")
                : "linear-gradient(135deg, #FFD700, #FFA500)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "4px solid #333",
              animation: flipping ? "spin 0.5s linear infinite" : "none",
            }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#000" }}>
                {flipping ? "?" : coinResult ? (coinResult === "cara" ? "C" : "K") : "?"}
              </span>
            </div>
            <style>{`@keyframes spin { 0% { transform: rotateY(0deg) } 100% { transform: rotateY(360deg) } }`}</style>

            {coinResult && !flipping && (
              <div style={{
                color: coinResult === coinChoice ? "#00C853" : "#FF4444",
                fontSize: 18, fontWeight: 700, marginBottom: 16,
              }}>
                {coinResult === coinChoice ? "Voce ganhou!" : "Voce perdeu!"}
              </div>
            )}

            {/* Choice */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, width: "100%" }}>
              {["cara", "coroa"].map((side) => (
                <button key={side} onClick={() => setCoinChoice(side)} style={{
                  flex: 1, padding: "12px", borderRadius: 8,
                  background: coinChoice === side ? "#FFD700" : "#1C1C24",
                  border: coinChoice === side ? "2px solid #FFD700" : "2px solid #2A2A35",
                  color: coinChoice === side ? "#000" : "#fff",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  textTransform: "capitalize",
                }}>
                  {side} {side === "cara" ? "(C)" : "(K)"}
                </button>
              ))}
            </div>

            {/* Bet */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, width: "100%" }}>
              <input
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 8,
                  background: "#1C1C24", border: "1px solid #2A2A35",
                  color: "#fff", fontSize: 14, outline: "none",
                }}
              />
              <span style={{ color: "#888", fontSize: 12, alignSelf: "center" }}>x1.95</span>
            </div>

            <button onClick={flipCoin} style={{
              width: "100%", padding: "14px", borderRadius: 8,
              background: flipping ? "#333" : "#FF4444",
              border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: flipping ? "default" : "pointer",
            }}>
              {flipping ? "Girando..." : "Apostar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

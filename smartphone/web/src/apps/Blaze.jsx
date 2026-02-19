import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// Blaze colors
const C = {
  bg:'#0E0E12', surface:'#16161D', elevated:'#1E1E28',
  text:'#FFFFFF', textSec:'#9CA3AF', textTer:'#6B7280',
  sep:'#2A2A35', red:'#F12C4C', redDark:'#DC143C',
  accent:'#F12C4C', green:'#00C74D', gold:'#FFB800',
  black:'#2D2D3A', white:'#E5E7EB', input:'#1A1A24',
  crashBg:'#0D1117',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };
const fmtMoney = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

const GAMES = [
  { id:'crash', name:'Crash', emoji:'📈', color:'#00C74D', desc:'Saia antes de quebrar' },
  { id:'double', name:'Double', emoji:'🎡', color:'#F12C4C', desc:'Vermelho, preto ou branco' },
  { id:'mines', name:'Mines', emoji:'💣', color:'#FFB800', desc:'Evite as bombas' },
  { id:'coinflip', name:'Coinflip', emoji:'🪙', color:'#9333EA', desc:'Cara ou coroa' },
];

// ===== CRASH GAME =====
function CrashGame({ balance, onBalanceChange, onBack }) {
  const [betAmount, setBetAmount] = useState(100);
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashed, setCrashed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const animRef = useRef(null);

  useEffect(() => {
    fetchBackend('blaze_crash_history').then(r => { if(r?.history) setHistory(r.history); });
  }, []);

  const startGame = async () => {
    if (playing || betAmount > balance || betAmount <= 0) return;
    setCrashed(false); setCashedOut(false); setResult(null); setMultiplier(1.00);
    const r = await fetchBackend('blaze_crash_bet', { amount: betAmount });
    if (r?.error) { alert(r.error); return; }
    onBalanceChange(r.balance);
    setPlaying(true);
    // Animate multiplier up to crash point (result comes from server)
    const crashAt = r.crashAt || 1.5;
    let m = 1.00;
    const tick = () => {
      m += 0.01 + (m * 0.003);
      if (m >= crashAt) { setMultiplier(crashAt); setCrashed(true); setPlaying(false); setHistory(p=>[crashAt,...p].slice(0,15)); return; }
      setMultiplier(parseFloat(m.toFixed(2)));
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const cashOut = async () => {
    if (!playing || cashedOut) return;
    cancelAnimationFrame(animRef.current);
    setCashedOut(true); setPlaying(false);
    const payout = Math.round(betAmount * multiplier);
    const r = await fetchBackend('blaze_crash_cashout', { multiplier, payout });
    if (r?.ok) { onBalanceChange(r.balance); setResult({ won: true, payout, mult: multiplier }); }
  };

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.crashBg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px' }}>
        <button onClick={onBack} style={B}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Crash</span>
        <span style={{ color:C.textSec, fontSize:13, marginLeft:'auto' }}>{fmtMoney(balance)}</span>
      </div>
      {/* Chart area */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{
            fontSize:56, fontWeight:900,
            color: crashed ? C.red : cashedOut ? C.green : C.text,
            textShadow: crashed ? `0 0 30px ${C.red}55` : cashedOut ? `0 0 30px ${C.green}55` : 'none',
          }}>{multiplier.toFixed(2)}x</div>
          {crashed && <div style={{ color:C.red, fontSize:16, fontWeight:600, marginTop:4 }}>CRASHED!</div>}
          {cashedOut && result && <div style={{ color:C.green, fontSize:16, fontWeight:600, marginTop:4 }}>+{fmtMoney(result.payout)}</div>}
        </div>
        {/* History bar */}
        <div style={{ position:'absolute', bottom:8, left:8, right:8, display:'flex', gap:4, overflow:'hidden' }}>
          {history.slice(0,12).map((h,i) => (
            <span key={i} style={{ fontSize:11, fontWeight:600, padding:'2px 6px', borderRadius:4,
              background: h >= 2 ? C.green+'22' : C.red+'22', color: h >= 2 ? C.green : C.red,
            }}>{Number(h).toFixed(2)}x</span>
          ))}
        </div>
      </div>
      {/* Controls */}
      <div style={{ padding:'12px 14px 16px', background:C.surface }}>
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          {[50,100,500,1000].map(v => (
            <button key={v} onClick={()=>setBetAmount(v)} style={{
              flex:1, padding:'8px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
              background: betAmount===v ? C.accent+'33' : C.elevated, color: betAmount===v ? C.accent : C.textSec,
            }}>{v}</button>
          ))}
        </div>
        {!playing ? (
          <button onClick={startGame} disabled={betAmount>balance} style={{
            width:'100%', padding:'14px', borderRadius:8, border:'none', cursor:'pointer',
            background:C.green, color:'#fff', fontSize:16, fontWeight:700, opacity:betAmount>balance?0.5:1,
          }}>Apostar {fmtMoney(betAmount)}</button>
        ) : (
          <button onClick={cashOut} style={{
            width:'100%', padding:'14px', borderRadius:8, border:'none', cursor:'pointer',
            background:C.accent, color:'#fff', fontSize:16, fontWeight:700,
            animation:'pulse 0.5s infinite alternate',
          }}>RETIRAR {fmtMoney(Math.round(betAmount*multiplier))}</button>
        )}
      </div>
      <style>{`@keyframes pulse{from{opacity:0.85}to{opacity:1}}`}</style>
    </div>
  );
}

// ===== DOUBLE GAME =====
function DoubleGame({ balance, onBalanceChange, onBack }) {
  const [betAmount, setBetAmount] = useState(100);
  const [choice, setChoice] = useState(null); // 'red','black','white'
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchBackend('blaze_double_history').then(r => { if(r?.history) setHistory(r.history); });
  }, []);

  const play = async () => {
    if (!choice || spinning || betAmount > balance || betAmount <= 0) return;
    setSpinning(true); setResult(null);
    const r = await fetchBackend('blaze_double_bet', { amount: betAmount, choice });
    if (r?.error) { alert(r.error); setSpinning(false); return; }
    // Animate delay
    await new Promise(res => setTimeout(res, 1500));
    setResult(r); onBalanceChange(r.balance);
    setHistory(p => [r.color, ...p].slice(0,20));
    setSpinning(false);
  };

  const colors = { red:C.red, black:'#333', white:'#E5E7EB' };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px' }}>
        <button onClick={onBack} style={B}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Double</span>
        <span style={{ color:C.textSec, fontSize:13, marginLeft:'auto' }}>{fmtMoney(balance)}</span>
      </div>
      {/* History */}
      <div style={{ display:'flex', gap:3, padding:'8px 14px', overflow:'hidden' }}>
        {history.slice(0,15).map((h,i) => (
          <div key={i} style={{ width:24, height:24, borderRadius:4, background:colors[h]||'#333', border:h==='white'?'1px solid #666':'none', flexShrink:0 }}/>
        ))}
      </div>
      {/* Result area */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {spinning ? (
          <div style={{ width:80, height:80, border:`4px solid ${C.sep}`, borderTopColor:C.accent, borderRadius:'50%', animation:'spin 0.6s linear infinite' }}/>
        ) : result ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:80, height:80, borderRadius:40, background:colors[result.color], margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center',
              border:result.color==='white'?'2px solid #999':'none', boxShadow:`0 0 30px ${colors[result.color]}44`,
            }}><span style={{ fontSize:30 }}>{result.color==='red'?'🔴':result.color==='black'?'⚫':'⚪'}</span></div>
            <div style={{ color:result.won?C.green:C.red, fontSize:20, fontWeight:700 }}>{result.won?`+${fmtMoney(result.payout)}`:'Perdeu!'}</div>
          </div>
        ) : (
          <div style={{ color:C.textTer, fontSize:15 }}>Escolha uma cor e aposte</div>
        )}
      </div>
      {/* Color choice */}
      <div style={{ padding:'12px 14px 6px' }}>
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          {[{id:'red',label:'Vermelho',color:C.red,mult:'2x'},{id:'black',label:'Preto',color:'#444',mult:'2x'},{id:'white',label:'Branco',color:'#E5E7EB',mult:'14x'}].map(c => (
            <button key={c.id} onClick={()=>setChoice(c.id)} style={{
              flex:1, padding:'12px 8px', borderRadius:10, border: choice===c.id?`2px solid ${c.color}`:`2px solid transparent`,
              background:c.id==='white'?'#2A2A35':c.color+'22', cursor:'pointer', textAlign:'center',
            }}>
              <div style={{ width:28, height:28, borderRadius:14, background:c.color, margin:'0 auto 4px', border:c.id==='white'?'1px solid #666':'none' }}/>
              <div style={{ color:C.text, fontSize:12, fontWeight:500 }}>{c.label}</div>
              <div style={{ color:C.gold, fontSize:11 }}>{c.mult}</div>
            </button>
          ))}
        </div>
      </div>
      {/* Bet controls */}
      <div style={{ padding:'0 14px 16px' }}>
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          {[50,100,500,1000].map(v => (
            <button key={v} onClick={()=>setBetAmount(v)} style={{
              flex:1, padding:'8px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
              background: betAmount===v ? C.accent+'33' : C.elevated, color: betAmount===v ? C.accent : C.textSec,
            }}>{v}</button>
          ))}
        </div>
        <button onClick={play} disabled={!choice||spinning||betAmount>balance} style={{
          width:'100%', padding:'14px', borderRadius:8, border:'none', cursor:'pointer',
          background:choice?colors[choice]||C.accent:C.elevated, color:choice==='white'?'#000':'#fff',
          fontSize:16, fontWeight:700, opacity:(!choice||spinning||betAmount>balance)?0.5:1,
        }}>{spinning?'Girando...':choice?`Apostar ${fmtMoney(betAmount)} no ${choice==='red'?'Vermelho':choice==='black'?'Preto':'Branco'}`:'Selecione uma cor'}</button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ===== MINES GAME =====
function MinesGame({ balance, onBalanceChange, onBack }) {
  const [betAmount, setBetAmount] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [grid, setGrid] = useState(null); // 5x5, null=not started
  const [revealed, setRevealed] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [payout, setPayout] = useState(0);
  const [gameId, setGameId] = useState(null);

  const startGame = async () => {
    if (betAmount > balance || betAmount <= 0) return;
    const r = await fetchBackend('blaze_mines_start', { amount: betAmount, mines: mineCount });
    if (r?.error) { alert(r.error); return; }
    setGameId(r.gameId); setGrid(r.grid || Array(25).fill('hidden'));
    setRevealed([]); setGameOver(false); setWon(false); setPayout(0);
    onBalanceChange(r.balance);
  };

  const revealTile = async (idx) => {
    if (!gameId || revealed.includes(idx) || gameOver) return;
    const r = await fetchBackend('blaze_mines_reveal', { gameId, tile: idx });
    if (r?.error) return;
    if (r.mine) {
      setGrid(r.fullGrid || grid); setRevealed(r.allRevealed || [...revealed, idx]);
      setGameOver(true); setWon(false);
    } else {
      setRevealed(p => [...p, idx]); setPayout(r.currentPayout || 0);
      if (r.fullGrid) setGrid(r.fullGrid);
    }
    if (r.balance !== undefined) onBalanceChange(r.balance);
  };

  const cashOutMines = async () => {
    if (!gameId || gameOver) return;
    const r = await fetchBackend('blaze_mines_cashout', { gameId });
    if (r?.ok) { setGameOver(true); setWon(true); setPayout(r.payout); onBalanceChange(r.balance); if(r.fullGrid)setGrid(r.fullGrid); }
  };

  const mult = revealed.length > 0 ? (1 + revealed.length * (mineCount * 0.15)) : 1;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px' }}>
        <button onClick={onBack} style={B}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Mines</span>
        <span style={{ color:C.textSec, fontSize:13, marginLeft:'auto' }}>{fmtMoney(balance)}</span>
      </div>
      {/* Grid 5x5 */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:12 }}>
        {!grid ? (
          <div style={{ textAlign:'center', color:C.textTer }}>
            <span style={{ fontSize:48 }}>💣</span>
            <div style={{ marginTop:8, fontSize:15 }}>Configure e aposte</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, width:'100%', maxWidth:300 }}>
            {Array.from({length:25}).map((_,i) => {
              const isRevealed = revealed.includes(i);
              const isMine = grid[i] === 'mine';
              const isGem = grid[i] === 'gem' || (isRevealed && !isMine);
              const showContent = isRevealed || (gameOver && (isMine || isGem));
              return (
                <button key={i} onClick={()=>revealTile(i)} disabled={isRevealed||gameOver} style={{
                  aspectRatio:'1', borderRadius:8, border:'none', cursor:isRevealed||gameOver?'default':'pointer',
                  background: showContent ? (isMine ? C.red+'33' : C.green+'33') : C.elevated,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
                  transition:'all 0.15s', transform: isRevealed ? 'scale(0.95)' : 'scale(1)',
                }}>
                  {showContent ? (isMine ? '💣' : '💎') : ''}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {/* Controls */}
      <div style={{ padding:'12px 14px 16px', background:C.surface }}>
        {!grid || gameOver ? (
          <>
            {gameOver && (
              <div style={{ textAlign:'center', marginBottom:10, color: won ? C.green : C.red, fontSize:16, fontWeight:700 }}>
                {won ? `Ganhou ${fmtMoney(payout)}!` : 'BOOM! 💥'}
              </div>
            )}
            <div style={{ display:'flex', gap:6, marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ color:C.textTer, fontSize:11, marginBottom:4 }}>Minas</div>
                <div style={{ display:'flex', gap:4 }}>
                  {[1,3,5,8].map(m => (
                    <button key={m} onClick={()=>setMineCount(m)} style={{
                      flex:1, padding:'6px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
                      background:mineCount===m?C.gold+'33':C.elevated, color:mineCount===m?C.gold:C.textSec,
                    }}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6, marginBottom:10 }}>
              {[50,100,500,1000].map(v => (
                <button key={v} onClick={()=>setBetAmount(v)} style={{
                  flex:1, padding:'8px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
                  background:betAmount===v?C.accent+'33':C.elevated, color:betAmount===v?C.accent:C.textSec,
                }}>{v}</button>
              ))}
            </div>
            <button onClick={startGame} disabled={betAmount>balance} style={{
              width:'100%', padding:'14px', borderRadius:8, border:'none', cursor:'pointer',
              background:C.green, color:'#fff', fontSize:16, fontWeight:700, opacity:betAmount>balance?0.5:1,
            }}>Apostar {fmtMoney(betAmount)}</button>
          </>
        ) : (
          <button onClick={cashOutMines} style={{
            width:'100%', padding:'14px', borderRadius:8, border:'none', cursor:'pointer',
            background:C.gold, color:'#000', fontSize:16, fontWeight:700,
          }}>Retirar {fmtMoney(Math.round(betAmount * mult))} ({mult.toFixed(2)}x)</button>
        )}
      </div>
    </div>
  );
}

// ===== COINFLIP =====
function CoinflipGame({ balance, onBalanceChange, onBack }) {
  const [betAmount, setBetAmount] = useState(100);
  const [choice, setChoice] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);

  const play = async () => {
    if (!choice || flipping || betAmount > balance || betAmount <= 0) return;
    setFlipping(true); setResult(null);
    const r = await fetchBackend('blaze_coinflip_bet', { amount: betAmount, choice });
    if (r?.error) { alert(r.error); setFlipping(false); return; }
    await new Promise(res => setTimeout(res, 1200));
    setResult(r); onBalanceChange(r.balance); setFlipping(false);
  };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px' }}>
        <button onClick={onBack} style={B}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Coinflip</span>
        <span style={{ color:C.textSec, fontSize:13, marginLeft:'auto' }}>{fmtMoney(balance)}</span>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{
          width:120, height:120, borderRadius:60,
          background: flipping ? `linear-gradient(45deg, ${C.gold}, #B8860B)` : result ? (result.result==='cara'?C.gold:'#C0C0C0') : C.elevated,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:50,
          animation: flipping ? 'coinflip 0.3s linear infinite' : 'none',
          boxShadow: `0 4px 20px ${flipping ? C.gold+'44' : 'rgba(0,0,0,0.3)'}`,
        }}>
          {flipping ? '🪙' : result ? (result.result==='cara'?'👑':'🌙') : '🪙'}
        </div>
        {result && !flipping && (
          <div style={{ marginTop:16, textAlign:'center' }}>
            <div style={{ color:C.text, fontSize:18, fontWeight:600, marginBottom:4 }}>
              {result.result === 'cara' ? '👑 Cara' : '🌙 Coroa'}
            </div>
            <div style={{ color:result.won?C.green:C.red, fontSize:20, fontWeight:700 }}>
              {result.won ? `+${fmtMoney(result.payout)}` : 'Perdeu!'}
            </div>
          </div>
        )}
      </div>
      <div style={{ padding:'12px 14px 16px', background:C.surface }}>
        <div style={{ display:'flex', gap:10, marginBottom:12 }}>
          {[{id:'cara',label:'👑 Cara'},{id:'coroa',label:'🌙 Coroa'}].map(c => (
            <button key={c.id} onClick={()=>setChoice(c.id)} style={{
              flex:1, padding:'14px', borderRadius:10, cursor:'pointer', fontSize:16, fontWeight:600,
              border: choice===c.id ? `2px solid ${C.gold}` : `2px solid ${C.sep}`, background:C.elevated, color:C.text,
            }}>{c.label}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          {[50,100,500,1000].map(v => (
            <button key={v} onClick={()=>setBetAmount(v)} style={{
              flex:1, padding:'8px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
              background:betAmount===v?C.accent+'33':C.elevated, color:betAmount===v?C.accent:C.textSec,
            }}>{v}</button>
          ))}
        </div>
        <button onClick={play} disabled={!choice||flipping||betAmount>balance} style={{
          width:'100%', padding:'14px', borderRadius:8, border:'none', cursor:'pointer',
          background:C.gold, color:'#000', fontSize:16, fontWeight:700,
          opacity:(!choice||flipping||betAmount>balance)?0.5:1,
        }}>{flipping?'Girando...':'Apostar'}</button>
      </div>
      <style>{`@keyframes coinflip{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}`}</style>
    </div>
  );
}

// ===== MAIN LOBBY =====
export default function Blaze({ onNavigate }) {
  const [activeGame, setActiveGame] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackend('blaze_init').then(r => {
      if (r?.balance !== undefined) setBalance(r.balance);
      setLoading(false);
    });
  }, []);

  const onBalanceChange = useCallback((b) => setBalance(b), []);

  if (activeGame === 'crash') return <CrashGame balance={balance} onBalanceChange={onBalanceChange} onBack={()=>setActiveGame(null)} />;
  if (activeGame === 'double') return <DoubleGame balance={balance} onBalanceChange={onBalanceChange} onBack={()=>setActiveGame(null)} />;
  if (activeGame === 'mines') return <MinesGame balance={balance} onBalanceChange={onBalanceChange} onBack={()=>setActiveGame(null)} />;
  if (activeGame === 'coinflip') return <CoinflipGame balance={balance} onBalanceChange={onBalanceChange} onBack={()=>setActiveGame(null)} />;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'16px', background:`linear-gradient(135deg, ${C.red}, #8B0000)`, borderRadius:'0 0 20px 20px' }}>
        <div style={{ color:'#fff', fontSize:24, fontWeight:900, letterSpacing:1, marginBottom:4 }}>BLAZE</div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13, marginBottom:8 }}>Aposte e ganhe</div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>Saldo</div>
        <div style={{ color:'#fff', fontSize:28, fontWeight:700 }}>{loading ? '...' : fmtMoney(balance)}</div>
      </div>

      {/* Games grid */}
      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        <div style={{ color:C.textSec, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Jogos</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {GAMES.map(g => (
            <button key={g.id} onClick={()=>setActiveGame(g.id)} style={{
              padding:'20px 14px', borderRadius:14, border:'none', cursor:'pointer',
              background:C.surface, display:'flex', flexDirection:'column', alignItems:'center', gap:8,
              transition:'transform 0.15s',
            }}>
              <div style={{
                width:52, height:52, borderRadius:14, background:g.color+'22',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
              }}>{g.emoji}</div>
              <div style={{ color:C.text, fontSize:15, fontWeight:600 }}>{g.name}</div>
              <div style={{ color:C.textTer, fontSize:11 }}>{g.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

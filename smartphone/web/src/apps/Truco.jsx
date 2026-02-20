import { useState, useCallback } from 'react';

const C = {
  bg:'#1B5E20', felt:'#2E7D32', feltLight:'#388E3C',
  text:'#fff', textSec:'#A5D6A7', gold:'#FFD700',
  card:'#FAFAFA', cardShadow:'rgba(0,0,0,0.3)',
  red:'#C62828', black:'#212121', accent:'#FFD54F',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

// Naipes: ♠♥♦♣
const NAIPES = ['♠','♥','♦','♣'];
const VALORES = ['4','5','6','7','Q','J','K','A','2','3'];
// Truco ranking (manilhas depend on vira, but simplified)
const FORCA = {'4':1,'5':2,'6':3,'7':4,'Q':5,'J':6,'K':7,'A':8,'2':9,'3':10};

const shuffleDeck = () => {
  const deck = [];
  for (const n of NAIPES) for (const v of VALORES) deck.push({ naipe: n, valor: v });
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
};

const cardColor = (naipe) => (naipe === '♥' || naipe === '♦') ? C.red : C.black;
const cardKey = (c) => `${c.valor}${c.naipe}`;

const Card = ({ card, faceDown, small, onClick, played, highlight }) => {
  const w = small ? 42 : 60;
  const h = small ? 62 : 88;
  if (faceDown) return (
    <div style={{ width:w, height:h, borderRadius:6, background:'linear-gradient(135deg, #1565C0, #0D47A1)', border:'2px solid #1976D2', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 2px 6px ${C.cardShadow}` }}>
      <div style={{ width:w-12, height:h-12, borderRadius:3, border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:small?14:20 }}>🂠</span>
      </div>
    </div>
  );
  return (
    <button onClick={onClick} style={{
      ...B, width:w, height:h, borderRadius:6, background:C.card, flexDirection:'column',
      border: highlight ? `2px solid ${C.gold}` : '1px solid #ddd', cursor: onClick ? 'pointer' : 'default',
      boxShadow: played ? '0 0 12px rgba(255,215,0,0.4)' : `0 2px 6px ${C.cardShadow}`,
      transform: played ? 'scale(1.05)' : onClick ? 'translateY(0)' : 'none',
      transition:'transform 0.15s, box-shadow 0.15s',
      position:'relative',
    }}>
      <span style={{ color:cardColor(card.naipe), fontSize:small?14:18, fontWeight:700, position:'absolute', top:small?2:4, left:small?4:6 }}>{card.valor}</span>
      <span style={{ color:cardColor(card.naipe), fontSize:small?18:28, marginTop:small?4:8 }}>{card.naipe}</span>
      <span style={{ color:cardColor(card.naipe), fontSize:small?14:18, fontWeight:700, position:'absolute', bottom:small?2:4, right:small?4:6, transform:'rotate(180deg)' }}>{card.valor}</span>
    </button>
  );
};

export default function Truco() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, result
  const [myHand, setMyHand] = useState([]);
  const [cpuHand, setCpuHand] = useState([]);
  const [vira, setVira] = useState(null);
  const [myPlayed, setMyPlayed] = useState([]);
  const [cpuPlayed, setCpuPlayed] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [myRounds, setMyRounds] = useState(0);
  const [cpuRounds, setCpuRounds] = useState(0);
  const [roundValue, setRoundValue] = useState(1);
  const [trucoState, setTrucoState] = useState(null); // null, 'asked', 'accepted'
  const [message, setMessage] = useState('');
  const [turn, setTurn] = useState('player'); // player, cpu
  const [roundNum, setRoundNum] = useState(0);

  // Get manilha based on vira
  const getManilha = useCallback((v) => {
    if (!v) return null;
    const idx = VALORES.indexOf(v.valor);
    return VALORES[(idx + 1) % VALORES.length];
  }, []);

  const getCardForce = useCallback((card) => {
    const manilha = getManilha(vira);
    if (card.valor === manilha) {
      // Manilha order: ♦ < ♠ < ♥ < ♣ (paus é zap)
      const manilhaOrder = {'♦':11,'♠':12,'♥':13,'♣':14};
      return manilhaOrder[card.naipe] || 11;
    }
    return FORCA[card.valor] || 0;
  }, [vira, getManilha]);

  const startGame = () => {
    const deck = shuffleDeck();
    setMyHand([deck[0], deck[1], deck[2]]);
    setCpuHand([deck[3], deck[4], deck[5]]);
    setVira(deck[6]);
    setMyPlayed([]); setCpuPlayed([]);
    setMyRounds(0); setCpuRounds(0);
    setRoundValue(1); setTrucoState(null);
    setMessage('Sua vez! Jogue uma carta.');
    setTurn('player'); setRoundNum(0);
    setGameState('playing');
  };

  const playCard = (card, idx) => {
    if (turn !== 'player') return;
    const newHand = myHand.filter((_, i) => i !== idx);
    setMyHand(newHand);
    setMyPlayed(p => [...p, card]);
    setTurn('cpu');
    setMessage('CPU pensando...');

    // CPU plays after delay
    setTimeout(() => {
      // CPU AI: play lowest card that wins, or lowest card
      const myForce = getCardForce(card);
      let cpuCard = null;
      let cpuIdx = -1;

      // Try to find a card that beats player's
      const sorted = cpuHand.map((c, i) => ({ card: c, idx: i, force: getCardForce(c) })).sort((a, b) => a.force - b.force);
      const winner = sorted.find(c => c.force > myForce);
      if (winner) { cpuCard = winner.card; cpuIdx = winner.idx; }
      else { cpuCard = sorted[0]?.card; cpuIdx = sorted[0]?.idx; }

      if (cpuCard === null || cpuIdx === -1) return;
      const newCpuHand = cpuHand.filter((_, i) => i !== cpuIdx);
      setCpuHand(newCpuHand);
      setCpuPlayed(p => [...p, cpuCard]);

      // Determine round winner
      const cpuForce = getCardForce(cpuCard);
      setTimeout(() => {
        let mr = myRounds, cr = cpuRounds;
        if (myForce > cpuForce) { mr++; setMyRounds(mr); setMessage('Você ganhou a rodada!'); }
        else if (cpuForce > myForce) { cr++; setCpuRounds(cr); setMessage('CPU ganhou a rodada!'); }
        else { setMessage('Empate na rodada!'); mr++; cr++; setMyRounds(mr); setCpuRounds(cr); }

        const rn = roundNum + 1;
        setRoundNum(rn);

        // Check if hand is over (best of 3)
        if (mr >= 2 || cr >= 2 || rn >= 3) {
          setTimeout(() => {
            if (mr > cr) {
              const ns = myScore + roundValue;
              setMyScore(ns);
              if (ns >= 12) { setMessage('🏆 Você venceu o jogo!'); setGameState('result'); }
              else { setMessage(`+${roundValue} ponto${roundValue>1?'s':''} pra você!`); setTimeout(startGame, 1500); }
            } else if (cr > mr) {
              const ns = cpuScore + roundValue;
              setCpuScore(ns);
              if (ns >= 12) { setMessage('😢 CPU venceu o jogo!'); setGameState('result'); }
              else { setMessage(`+${roundValue} ponto${roundValue>1?'s':''} pra CPU!`); setTimeout(startGame, 1500); }
            } else {
              setMessage('Mão empatada!'); setTimeout(startGame, 1500);
            }
          }, 1000);
        } else {
          setTimeout(() => { setTurn('player'); setMessage('Sua vez!'); }, 800);
        }
      }, 600);
    }, 800);
  };

  const callTruco = () => {
    const next = roundValue === 1 ? 3 : roundValue === 3 ? 6 : roundValue === 6 ? 9 : 12;
    if (next > 12) return;
    // CPU decides (50% accept for now, higher if good hand)
    const avgForce = cpuHand.reduce((s, c) => s + getCardForce(c), 0) / Math.max(cpuHand.length, 1);
    const accepts = avgForce > 5 || Math.random() > 0.4;
    if (accepts) {
      setRoundValue(next);
      setTrucoState('accepted');
      setMessage(`CPU aceitou! Vale ${next}!`);
      setTimeout(() => setTrucoState(null), 1500);
    } else {
      // CPU runs
      const pts = roundValue;
      setMyScore(s => s + pts);
      setMessage(`CPU correu! +${pts} pra você`);
      setTimeout(startGame, 1500);
    }
  };

  // ===== MENU =====
  if (gameState === 'menu') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:`linear-gradient(180deg, ${C.bg}, #0D3311)`, alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ fontSize:64, marginBottom:8 }}>🃏</div>
      <div style={{ color:C.gold, fontSize:28, fontWeight:900, textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>TRUCO</div>
      <div style={{ color:C.textSec, fontSize:14, marginBottom:16 }}>Truco Paulista • Melhor de 12</div>
      <button onClick={() => { setMyScore(0); setCpuScore(0); startGame(); }} style={{
        padding:'16px 48px', borderRadius:12, border:'none', cursor:'pointer',
        background:`linear-gradient(135deg, ${C.gold}, #FFA000)`, color:'#000', fontSize:18, fontWeight:800,
        boxShadow:'0 4px 16px rgba(255,215,0,0.4)',
      }}>JOGAR</button>
    </div>
  );

  // ===== RESULT =====
  if (gameState === 'result') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:`linear-gradient(180deg, ${C.bg}, #0D3311)`, alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ fontSize:64 }}>{myScore >= 12 ? '🏆' : '😢'}</div>
      <div style={{ color:C.gold, fontSize:24, fontWeight:800 }}>{myScore >= 12 ? 'VITÓRIA!' : 'DERROTA'}</div>
      <div style={{ color:C.text, fontSize:16 }}>Você {myScore} x {cpuScore} CPU</div>
      <button onClick={() => { setMyScore(0); setCpuScore(0); startGame(); }} style={{
        marginTop:16, padding:'14px 40px', borderRadius:12, border:'none', cursor:'pointer',
        background:C.gold, color:'#000', fontSize:16, fontWeight:700,
      }}>Jogar novamente</button>
      <button onClick={() => setGameState('menu')} style={{
        padding:'10px 32px', borderRadius:8, border:`1px solid ${C.textSec}`, cursor:'pointer',
        background:'transparent', color:C.textSec, fontSize:14,
      }}>Menu</button>
    </div>
  );

  // ===== PLAYING =====
  const manilha = getManilha(vira);
  const nextTrucoValue = roundValue === 1 ? 3 : roundValue === 3 ? 6 : roundValue === 6 ? 9 : 12;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:`radial-gradient(ellipse at center, ${C.feltLight}, ${C.bg})`, position:'relative' }}>
      {/* Score bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', background:'rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:C.gold, fontSize:13, fontWeight:700 }}>Você: {myScore}</span>
          <span style={{ color:C.textSec, fontSize:11 }}>({myRounds} de 2)</span>
        </div>
        <div style={{ background:'rgba(255,255,255,0.1)', padding:'3px 10px', borderRadius:8 }}>
          <span style={{ color:C.gold, fontSize:12, fontWeight:700 }}>Vale {roundValue}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:C.textSec, fontSize:11 }}>({cpuRounds} de 2)</span>
          <span style={{ color:'#EF5350', fontSize:13, fontWeight:700 }}>CPU: {cpuScore}</span>
        </div>
      </div>

      {/* Vira */}
      {vira && (
        <div style={{ position:'absolute', top:42, right:10, display:'flex', flexDirection:'column', alignItems:'center', gap:2, zIndex:1 }}>
          <span style={{ color:C.textSec, fontSize:9, fontWeight:600 }}>VIRA</span>
          <Card card={vira} small />
          <span style={{ color:C.gold, fontSize:9, fontWeight:600 }}>Manilha: {manilha}</span>
        </div>
      )}

      {/* CPU hand */}
      <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'10px 10px 4px' }}>
        {cpuHand.map((_, i) => <Card key={i} faceDown />)}
      </div>

      {/* CPU played */}
      <div style={{ display:'flex', justifyContent:'center', gap:8, minHeight:52, padding:'4px 0' }}>
        {cpuPlayed.map((c, i) => <Card key={cardKey(c)+i} card={c} small played />)}
      </div>

      {/* Message */}
      <div style={{ textAlign:'center', padding:'6px 16px', flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{
          color:C.text, fontSize:15, fontWeight:600,
          background:'rgba(0,0,0,0.3)', padding:'8px 20px', borderRadius:20,
          textShadow:'0 1px 2px rgba(0,0,0,0.3)',
        }}>{message}</div>
      </div>

      {/* My played */}
      <div style={{ display:'flex', justifyContent:'center', gap:8, minHeight:52, padding:'4px 0' }}>
        {myPlayed.map((c, i) => <Card key={cardKey(c)+i} card={c} small played />)}
      </div>

      {/* My hand */}
      <div style={{ display:'flex', justifyContent:'center', gap:8, padding:'4px 10px 8px' }}>
        {myHand.map((c, i) => (
          <Card key={cardKey(c)} card={c} onClick={turn === 'player' ? () => playCard(c, i) : undefined}
            highlight={c.valor === manilha} />
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:8, padding:'4px 16px 14px', justifyContent:'center' }}>
        {turn === 'player' && nextTrucoValue <= 12 && (
          <button onClick={callTruco} style={{
            padding:'10px 24px', borderRadius:8, border:'none', cursor:'pointer',
            background:`linear-gradient(135deg, ${C.gold}, #FFA000)`, color:'#000', fontSize:14, fontWeight:800,
            boxShadow:'0 2px 8px rgba(255,215,0,0.3)',
          }}>{roundValue === 1 ? 'TRUCO!' : roundValue === 3 ? 'SEIS!' : roundValue === 6 ? 'NOVE!' : 'DOZE!'}</button>
        )}
        <button onClick={() => { setCpuScore(s => s + roundValue); if (cpuScore + roundValue >= 12) { setMessage('CPU venceu!'); setGameState('result'); } else { setMessage('Você correu!'); setTimeout(startGame, 1000); } }} style={{
          padding:'10px 20px', borderRadius:8, border:`1px solid rgba(255,255,255,0.2)`, cursor:'pointer',
          background:'rgba(0,0,0,0.3)', color:C.textSec, fontSize:13, fontWeight:600,
        }}>Correr</button>
      </div>
    </div>
  );
}

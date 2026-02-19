import { useState, useEffect, useCallback } from 'react';

const C = { text:'#fff', textSec:'rgba(255,255,255,0.6)', dot:'rgba(255,255,255,0.25)', dotFilled:'#fff', error:'#FF453A' };

export default function LockScreen({ onUnlock, wallpaper, pin }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }));
      setDate(now.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' }));
    };
    update(); const i = setInterval(update, 1000); return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (input.length === (pin?.length || 4)) {
      if (!pin || input === pin) { onUnlock(); }
      else { setError(true); setTimeout(() => { setError(false); setInput(''); }, 600); }
    }
  }, [input, pin, onUnlock]);

  const handleKey = (k) => {
    if (k === 'del') setInput(p => p.slice(0, -1));
    else if (input.length < 6) setInput(p => p + k);
  };

  const pinLen = pin?.length || 4;

  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, bottom:0, zIndex:9999,
      background: wallpaper ? `url(${wallpaper}) center/cover` : 'linear-gradient(135deg,#0f0f23,#1a1a3e,#0d1b2a)',
      display:'flex', flexDirection:'column', alignItems:'center',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)' }}/>
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', width:'100%', height:'100%', paddingTop:60 }}>
        {/* Clock */}
        <div style={{ color:C.text, fontSize:56, fontWeight:200, letterSpacing:-2, lineHeight:1 }}>{time}</div>
        <div style={{ color:C.textSec, fontSize:16, fontWeight:300, marginTop:4, textTransform:'capitalize' }}>{date}</div>

        <div style={{ flex:1 }}/>

        {/* PIN dots */}
        <div style={{ display:'flex', gap:14, marginBottom:24 }}>
          {Array.from({length:pinLen}).map((_,i) => (
            <div key={i} style={{
              width:14, height:14, borderRadius:7,
              background: i < input.length ? (error ? C.error : C.dotFilled) : 'transparent',
              border: `2px solid ${error ? C.error : (i < input.length ? C.dotFilled : C.dot)}`,
              transition:'all 0.15s',
              animation: error ? `shake 0.4s ease-in-out` : 'none',
            }}/>
          ))}
        </div>

        {/* Numpad */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,80px)', gap:12, marginBottom:30 }}>
          {['1','2','3','4','5','6','7','8','9','','0','del'].map(k => (
            k === '' ? <div key="empty"/> :
            <button key={k} onClick={()=>handleKey(k)} style={{
              width:80, height:80, borderRadius:40, border:'none', cursor:'pointer',
              background: k === 'del' ? 'transparent' : 'rgba(255,255,255,0.12)',
              color:C.text, fontSize: k === 'del' ? 14 : 28, fontWeight:300,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'background 0.1s',
            }}>
              {k === 'del' ? '⌫' : k}
              {k !== 'del' && k !== '' && (
                <span style={{ position:'absolute', marginTop:32, fontSize:8, color:C.textSec, letterSpacing:2 }}>
                  {{'2':'ABC','3':'DEF','4':'GHI','5':'JKL','6':'MNO','7':'PQRS','8':'TUV','9':'WXYZ'}[k]||''}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Emergency / Cancel */}
        <div style={{ display:'flex', gap:60, marginBottom:30 }}>
          <button onClick={onUnlock} style={{ background:'none', border:'none', color:C.textSec, fontSize:14, cursor:'pointer' }}>
            Emergência
          </button>
          <button onClick={()=>setInput('')} style={{ background:'none', border:'none', color:C.textSec, fontSize:14, cursor:'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBackend } from '../hooks/useNui';

const C = {
  bg:'#121212', surface:'#1A1A1A', elevated:'#282828', card:'#181818',
  text:'#FFFFFF', textSec:'#B3B3B3', textTer:'#6A6A6A',
  green:'#1DB954', greenBright:'#1ED760', sep:'#282828',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

const Ic = {
  back: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={C.textSec} strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke={C.textSec} strokeWidth="2" strokeLinecap="round"/></svg>,
  home: (a) => <svg width="24" height="24" viewBox="0 0 24 24" fill={a?'#fff':'none'} stroke={a?'#fff':C.textSec} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>{!a&&<polyline points="9 22 9 12 15 12 15 22"/>}</svg>,
  lib: (a) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a?'#fff':C.textSec} strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  play: <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg>,
  pause: <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  playW: <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>,
  pauseW: <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  shuffle: (a) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?C.green:C.textSec} strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
  prev: <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M19 20L9 12l10-8v16zM5 4h2v16H5V4z"/></svg>,
  next: <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M5 4l10 8-10 8V4zm12 0h2v16h-2V4z"/></svg>,
  repeat: (a) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?C.green:C.textSec} strokeWidth="2" strokeLinecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  heart: (a) => <svg width="20" height="20" viewBox="0 0 24 24" fill={a?C.green:'none'} stroke={a?C.green:C.textSec} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  dots: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.textSec}><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>,
  down: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const emojiColors = {
  '🎤':'#8B5CF6','🔥':'#EF4444','🎧':'#6366F1','💃':'#EC4899',
  '🎸':'#F59E0B','🎵':'#3B82F6','🎶':'#10B981','🎹':'#8B5CF6',
  '⚡':'#EAB308','🌙':'#6366F1','🎺':'#F97316','🥁':'#DC2626',
  '🎻':'#A855F7','💀':'#6B7280','🌊':'#0EA5E9','☀️':'#FBBF24',
};
const getGradient = (emoji) => {
  const c = emojiColors[emoji] || '#1DB954';
  return `linear-gradient(180deg, ${c}CC 0%, ${c}44 40%, ${C.bg} 100%)`;
};
const getGreeting = () => { const h=new Date().getHours(); if(h<12)return'Bom dia'; if(h<18)return'Boa tarde'; return'Boa noite'; };

export default function Spotify() {
  const [view, setView] = useState('home');
  const [tab, setTab] = useState('home');
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIdx, setQueueIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState({});
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(true);

  const playing = queue[queueIdx] || null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await fetchBackend('spotify_init');
      if (r?.playlists) setPlaylists(r.playlists);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!isPlaying || !playing) return;
    const iv = setInterval(() => {
      setProgress(p => { if (p >= 100) { nextTrack(); return 0; } return p + 0.5; });
    }, 150);
    return () => clearInterval(iv);
  }, [isPlaying, playing]);

  const playSong = (song, pl, idx) => { setQueue(pl.songs); setQueueIdx(idx||0); setActivePlaylist(pl); setIsPlaying(true); setProgress(0); };
  const nextTrack = () => { if(shuffle){setQueueIdx(Math.floor(Math.random()*queue.length));}else if(queueIdx<queue.length-1)setQueueIdx(i=>i+1);else if(repeat)setQueueIdx(0);else setIsPlaying(false); setProgress(0); };
  const prevTrack = () => { if(progress>10){setProgress(0);return;} if(queueIdx>0)setQueueIdx(i=>i-1);else if(repeat)setQueueIdx(queue.length-1); setProgress(0); };
  const toggleLike = (id) => setLiked(p => ({...p,[id]:!p[id]}));
  const parseDur = (dur) => { if(!dur)return 180; const[m,s]=dur.split(':').map(Number); return m*60+s; };
  const fmtTime = (pct, dur) => { const t=parseDur(dur); const c=Math.floor(t*pct/100); return `${Math.floor(c/60)}:${(c%60).toString().padStart(2,'0')}`; };
  const openPlaylist = (pl) => { setActivePlaylist(pl); setView('playlist'); };

  const searchResults = searchQ.trim() ? playlists.filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.songs?.some(s=>s.name.toLowerCase().includes(searchQ.toLowerCase())||s.artist.toLowerCase().includes(searchQ.toLowerCase()))) : [];

  // ===== FULL PLAYER =====
  if (view === 'player' && playing) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:getGradient(activePlaylist?.cover||'🎵'), padding:'0 24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0' }}>
        <button onClick={()=>setView(activePlaylist?'playlist':'home')} style={B}>{Ic.down}</button>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:C.textSec, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>Tocando da playlist</div>
          <div style={{ color:C.text, fontSize:13, fontWeight:600 }}>{activePlaylist?.name||'Fila'}</div>
        </div>
        <button style={B}>{Ic.dots}</button>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px 0' }}>
        <div style={{
          width:'100%', maxWidth:280, aspectRatio:'1', borderRadius:8,
          background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:96, boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          transition:'transform 0.3s', transform:isPlaying?'scale(1)':'scale(0.95)',
        }}>{activePlaylist?.cover||'🎵'}</div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ flex:1, overflow:'hidden' }}>
          <div style={{ color:C.text, fontSize:20, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{playing.name}</div>
          <div style={{ color:C.textSec, fontSize:14, marginTop:2 }}>{playing.artist}</div>
        </div>
        <button onClick={()=>toggleLike(playing.id)} style={{...B,padding:8}}>{Ic.heart(liked[playing.id])}</button>
      </div>
      <div style={{ marginBottom:4 }}>
        <div onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();setProgress((e.clientX-r.left)/r.width*100);}}
          style={{ height:12, display:'flex', alignItems:'center', cursor:'pointer', padding:'4px 0' }}>
          <div style={{ width:'100%', height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, position:'relative' }}>
            <div style={{ width:`${progress}%`, height:'100%', background:C.text, borderRadius:2, transition:'width 0.15s linear', position:'relative' }}>
              <div style={{ position:'absolute', right:-6, top:-4, width:12, height:12, borderRadius:6, background:'#fff', boxShadow:'0 2px 4px rgba(0,0,0,0.3)' }}/>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ color:C.textSec, fontSize:11 }}>{fmtTime(progress,playing.dur)}</span>
          <span style={{ color:C.textSec, fontSize:11 }}>{playing.dur}</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 8px 20px' }}>
        <button onClick={()=>setShuffle(!shuffle)} style={{...B,padding:8}}>{Ic.shuffle(shuffle)}</button>
        <button onClick={prevTrack} style={{...B,padding:8}}>{Ic.prev}</button>
        <button onClick={()=>setIsPlaying(!isPlaying)} style={{...B,width:56,height:56,borderRadius:28,background:'#fff',boxShadow:'0 4px 12px rgba(0,0,0,0.3)'}}>{isPlaying?Ic.pause:Ic.play}</button>
        <button onClick={nextTrack} style={{...B,padding:8}}>{Ic.next}</button>
        <button onClick={()=>setRepeat(!repeat)} style={{...B,padding:8}}>{Ic.repeat(repeat)}</button>
      </div>
    </div>
  );

  // ===== PLAYLIST VIEW =====
  if (view === 'playlist' && activePlaylist) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ background:getGradient(activePlaylist.cover), padding:'14px 16px 20px' }}>
        <button onClick={()=>setView('home')} style={{...B,marginBottom:12}}>{Ic.back}</button>
        <div style={{ display:'flex', alignItems:'flex-end', gap:16 }}>
          <div style={{ width:120, height:120, borderRadius:4, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, boxShadow:'0 4px 24px rgba(0,0,0,0.5)', flexShrink:0 }}>{activePlaylist.cover}</div>
          <div style={{ paddingBottom:4 }}>
            <div style={{ color:C.text, fontSize:22, fontWeight:800, lineHeight:1.1 }}>{activePlaylist.name}</div>
            <div style={{ color:C.textSec, fontSize:13, marginTop:6 }}>{activePlaylist.songs.length} músicas</div>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px' }}>
        <div style={{ display:'flex', gap:16 }}>
          <button onClick={()=>toggleLike('pl_'+activePlaylist.id)} style={{...B,padding:4}}>{Ic.heart(liked['pl_'+activePlaylist.id])}</button>
          <button style={{...B,padding:4}}>{Ic.dots}</button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>setShuffle(!shuffle)} style={{...B,padding:4}}>{Ic.shuffle(shuffle)}</button>
          <button onClick={()=>playSong(activePlaylist.songs[0],activePlaylist,0)} style={{...B,width:48,height:48,borderRadius:24,background:C.green,boxShadow:'0 4px 12px rgba(29,185,84,0.4)'}}>{Ic.play}</button>
        </div>
      </div>
      <div style={{ flex:1, overflow:'auto', paddingBottom:playing?72:16 }}>
        {activePlaylist.songs.map((s,i) => {
          const active = playing?.id===s.id && activePlaylist?.name===queue[0]?.playlist;
          return (
            <div key={`${s.id}-${i}`} onClick={()=>playSong(s,activePlaylist,i)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer' }}>
              <span style={{ color:active?C.green:C.textTer, fontSize:14, width:20, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{i+1}</span>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ color:active?C.green:C.text, fontSize:15, fontWeight:active?600:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                <div style={{ color:C.textSec, fontSize:12 }}>{s.artist}</div>
              </div>
              <span style={{ color:C.textTer, fontSize:12, fontVariantNumeric:'tabular-nums' }}>{s.dur}</span>
            </div>
          );
        })}
      </div>
      {playing && <MiniPlayer playing={playing} playlist={activePlaylist} isPlaying={isPlaying} progress={progress} onToggle={()=>setIsPlaying(!isPlaying)} onOpen={()=>setView('player')}/>}
    </div>
  );

  // ===== MAIN (HOME/SEARCH/LIBRARY) =====
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ flex:1, overflow:'auto', paddingBottom:playing?120:70 }}>
        {tab === 'home' && <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px 4px' }}>
            <span style={{ color:C.text, fontSize:24, fontWeight:800 }}>{getGreeting()}</span>
            <div style={{ display:'flex', gap:12 }}>
              <button style={{...B,padding:6}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></button>
              <button style={{...B,padding:6}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.73 12.73l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></button>
            </div>
          </div>
          {playlists.length > 0 && <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'12px 16px 8px' }}>
            {playlists.slice(0,6).map(p => (
              <button key={p.id} onClick={()=>openPlaylist(p)}
                style={{ display:'flex', alignItems:'center', gap:0, background:'rgba(255,255,255,0.07)', borderRadius:6, border:'none', cursor:'pointer', overflow:'hidden', height:56 }}>
                <div style={{ width:56, height:56, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{p.cover}</div>
                <span style={{ color:C.text, fontSize:13, fontWeight:600, padding:'0 10px', textAlign:'left', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
              </button>
            ))}
          </div>}
          {playlists.length > 0 && <div style={{ padding:'20px 0 0' }}>
            <div style={{ color:C.text, fontSize:18, fontWeight:700, padding:'0 16px 12px' }}>Feito para você</div>
            <div style={{ display:'flex', gap:12, overflow:'auto', padding:'0 16px', scrollbarWidth:'none' }}>
              {playlists.map(p => (
                <button key={p.id} onClick={()=>openPlaylist(p)}
                  style={{ background:'transparent', border:'none', cursor:'pointer', textAlign:'left', minWidth:140, maxWidth:140, flexShrink:0 }}>
                  <div style={{ width:140, height:140, borderRadius:8, background:C.card, display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, boxShadow:'0 4px 16px rgba(0,0,0,0.25)', marginBottom:8 }}>{p.cover}</div>
                  <div style={{ color:C.text, fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                  <div style={{ color:C.textTer, fontSize:12, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.songs?.slice(0,3).map(s=>s.artist).join(', ')}</div>
                </button>
              ))}
            </div>
          </div>}
          {playlists.length > 2 && <div style={{ padding:'24px 0 0' }}>
            <div style={{ color:C.text, fontSize:18, fontWeight:700, padding:'0 16px 12px' }}>Populares no Brasil</div>
            <div style={{ display:'flex', gap:12, overflow:'auto', padding:'0 16px', scrollbarWidth:'none' }}>
              {[...playlists].reverse().map(p => (
                <button key={'pop_'+p.id} onClick={()=>openPlaylist(p)}
                  style={{ background:'transparent', border:'none', cursor:'pointer', textAlign:'left', minWidth:140, maxWidth:140, flexShrink:0 }}>
                  <div style={{ width:140, height:140, borderRadius:8, background:C.card, display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, boxShadow:'0 4px 16px rgba(0,0,0,0.25)', marginBottom:8 }}>{p.cover}</div>
                  <div style={{ color:C.text, fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                  <div style={{ color:C.textTer, fontSize:12, marginTop:2 }}>Playlist</div>
                </button>
              ))}
            </div>
          </div>}
          {loading && <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div style={{ width:24, height:24, border:`2px solid ${C.sep}`, borderTopColor:C.green, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/></div>}
          {!loading && playlists.length===0 && <div style={{ textAlign:'center', padding:40, color:C.textSec }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎵</div>
            <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:4 }}>Nenhuma playlist</div>
            <div style={{ fontSize:14 }}>As playlists do servidor aparecerão aqui</div>
          </div>}
        </>}

        {tab === 'search' && <div style={{ flex:1, overflow:'auto', padding:'0 16px' }}>
          <div style={{ padding:'14px 0 8px' }}><span style={{ color:C.text, fontSize:22, fontWeight:700 }}>Buscar</span></div>
          <div style={{ display:'flex', alignItems:'center', background:'#fff', borderRadius:6, padding:'10px 12px', gap:8, marginBottom:16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#000" strokeWidth="2.5"/><path d="M21 21l-4.35-4.35" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/></svg>
            <input type="text" placeholder="O que você quer ouvir?" value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#000', fontSize:15, fontWeight:500, fontFamily:'inherit' }}/>
          </div>
          {searchQ.trim() ? (
            searchResults.length===0 ? <div style={{ textAlign:'center', padding:40, color:C.textSec }}>Nenhum resultado para "{searchQ}"</div>
            : searchResults.map(p => (
              <div key={p.id} onClick={()=>openPlaylist(p)} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', cursor:'pointer' }}>
                <div style={{ width:56, height:56, borderRadius:4, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{p.cover}</div>
                <div><div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{p.name}</div><div style={{ color:C.textSec, fontSize:13 }}>Playlist · {p.songs.length} músicas</div></div>
              </div>
            ))
          ) : <div>
            <div style={{ color:C.text, fontSize:16, fontWeight:700, marginBottom:12 }}>Navegar em tudo</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[{name:'Música',color:'#E13300',e:'🎵'},{name:'Podcasts',color:'#056952',e:'🎙️'},{name:'Ao vivo',color:'#8400E7',e:'📡'},{name:'Feito pra você',color:'#1E3264',e:'✨'},{name:'Novidades',color:'#E8115B',e:'🆕'},{name:'Brasileira',color:'#148A08',e:'🇧🇷'}].map(c => (
                <div key={c.name} style={{ background:c.color, borderRadius:8, padding:'14px 12px', position:'relative', overflow:'hidden', minHeight:90, cursor:'pointer' }}>
                  <span style={{ color:'#fff', fontSize:15, fontWeight:700 }}>{c.name}</span>
                  <span style={{ position:'absolute', bottom:-4, right:-4, fontSize:40, transform:'rotate(25deg)', opacity:0.4 }}>{c.e}</span>
                </div>
              ))}
            </div>
          </div>}
        </div>}

        {tab === 'library' && <div style={{ flex:1, overflow:'auto', padding:'0 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0 12px' }}>
            <span style={{ color:C.text, fontSize:22, fontWeight:700 }}>Sua Biblioteca</span>
            <button style={B}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:16, overflow:'auto' }}>
            {['Playlists','Artistas','Álbuns'].map((f,i) => (
              <span key={f} style={{ padding:'6px 16px', borderRadius:16, fontSize:13, fontWeight:500, whiteSpace:'nowrap', background:i===0?C.green:'transparent', color:i===0?'#000':C.text, border:i===0?'none':`1px solid ${C.sep}` }}>{f}</span>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', cursor:'pointer', marginBottom:4 }}>
            <div style={{ width:56, height:56, borderRadius:4, background:'linear-gradient(135deg, #450AF5, #C4EFD9)', display:'flex', alignItems:'center', justifyContent:'center' }}>{Ic.heart(true)}</div>
            <div><div style={{ color:C.text, fontSize:15, fontWeight:500 }}>Músicas Curtidas</div><div style={{ color:C.textSec, fontSize:13 }}>Playlist · {Object.values(liked).filter(Boolean).length} músicas</div></div>
          </div>
          {playlists.map(p => (
            <div key={p.id} onClick={()=>openPlaylist(p)} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', cursor:'pointer' }}>
              <div style={{ width:56, height:56, borderRadius:4, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{p.cover}</div>
              <div><div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{p.name}</div><div style={{ color:C.textSec, fontSize:13 }}>Playlist · {p.songs?.length||0} músicas</div></div>
            </div>
          ))}
        </div>}
      </div>

      {playing && <MiniPlayer playing={playing} playlist={activePlaylist} isPlaying={isPlaying} progress={progress} onToggle={()=>setIsPlaying(!isPlaying)} onOpen={()=>setView('player')}/>}

      <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', justifyContent:'space-around', padding:'8px 0 10px', background:`linear-gradient(transparent, ${C.bg} 20%)` }}>
        {[{id:'home',label:'Início',icon:Ic.home},{id:'search',label:'Buscar',icon:(a)=><div style={{opacity:a?1:0.6}}>{Ic.search}</div>},{id:'library',label:'Biblioteca',icon:Ic.lib}].map(t => (
          <button key={t.id} onClick={()=>{setTab(t.id);if(view!=='player')setView('home');}} style={{...B,flexDirection:'column',gap:4,padding:'4px 16px'}}>
            {t.icon(tab===t.id)}
            <span style={{ color:tab===t.id?'#fff':C.textSec, fontSize:10, fontWeight:tab===t.id?600:400 }}>{t.label}</span>
          </button>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function MiniPlayer({ playing, playlist, isPlaying, progress, onToggle, onOpen }) {
  return (
    <div style={{ position:'absolute', bottom:52, left:8, right:8, zIndex:10 }}>
      <div style={{ height:2, background:'rgba(255,255,255,0.1)', borderRadius:1, overflow:'hidden' }}>
        <div style={{ width:`${progress}%`, height:'100%', background:C.green, transition:'width 0.15s linear' }}/>
      </div>
      <div onClick={onOpen} style={{
        background:(emojiColors[playlist?.cover]||'#1A3A1A')+'E6',
        backdropFilter:'blur(12px)', borderRadius:'0 0 8px 8px',
        padding:'10px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer',
      }}>
        <div style={{ width:40, height:40, borderRadius:4, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{playlist?.cover||'🎵'}</div>
        <div style={{ flex:1, overflow:'hidden' }}>
          <div style={{ color:'#fff', fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{playing.name}</div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>{playing.artist}</div>
        </div>
        <button onClick={(e)=>{e.stopPropagation();}} style={{...B,padding:6}}>{Ic.heart(false)}</button>
        <button onClick={(e)=>{e.stopPropagation();onToggle();}} style={{...B,padding:6}}>{isPlaying?Ic.pauseW:Ic.playW}</button>
      </div>
    </div>
  );
}

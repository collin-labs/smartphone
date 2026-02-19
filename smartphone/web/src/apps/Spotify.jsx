import { useState, useCallback } from 'react';

const C = {
  bg:'#121212', surface:'#1A1A1A', elevated:'#282828',
  text:'#FFFFFF', textSec:'#B3B3B3', textTer:'#6B6B6B',
  sep:'#333', green:'#1DB954', greenDark:'#1ED760',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

const PLAYLISTS = [
  { id:1, name:'Rap Nacional', cover:'🎤', songs:[
    {id:1,name:'Vida Loka Pt.2',artist:'Racionais',dur:'5:42'},{id:2,name:'Diário de um Detento',artist:'Racionais',dur:'8:18'},
    {id:3,name:'Negro Drama',artist:'Racionais',dur:'6:32'},{id:4,name:'A Vida é Desafio',artist:'Racionais',dur:'3:47'},
    {id:5,name:'Isso Aqui é uma Guerra',artist:'Facção Central',dur:'4:15'},{id:6,name:'Aqui é Selva',artist:'MV Bill',dur:'3:55'},
  ]},
  { id:2, name:'Trap BR', cover:'🔥', songs:[
    {id:1,name:'Type Beat',artist:'Matuê',dur:'3:12'},{id:2,name:'Kenny G',artist:'MC IG',dur:'2:48'},
    {id:3,name:'M4',artist:'MC Poze',dur:'2:55'},{id:4,name:'Eu Comprei um Carro',artist:'Orochi',dur:'3:22'},
  ]},
  { id:3, name:'Lo-Fi Beats', cover:'🎧', songs:[
    {id:1,name:'Coffee Shop Vibes',artist:'Lo-Fi Girl',dur:'3:05'},{id:2,name:'Rainy Day',artist:'Chillhop',dur:'2:45'},
    {id:3,name:'Midnight Study',artist:'Lofi Fruits',dur:'3:30'},{id:4,name:'Sunset Drive',artist:'Sleepy Fish',dur:'2:58'},
  ]},
  { id:4, name:'Funk', cover:'💃', songs:[
    {id:1,name:'Ah Lelek',artist:'MC Lelek',dur:'3:10'},{id:2,name:'Bum Bum Tam Tam',artist:'MC Fioti',dur:'2:42'},
    {id:3,name:'Envolvimento',artist:'MC Loma',dur:'2:30'},{id:4,name:'Vai Malandra',artist:'Anitta',dur:'3:01'},
  ]},
  { id:5, name:'Rock Clássico', cover:'🎸', songs:[
    {id:1,name:'Bohemian Rhapsody',artist:'Queen',dur:'5:55'},{id:2,name:'Stairway to Heaven',artist:'Led Zeppelin',dur:'8:02'},
    {id:3,name:'Hotel California',artist:'Eagles',dur:'6:30'},{id:4,name:'Comfortably Numb',artist:'Pink Floyd',dur:'6:23'},
  ]},
];

export default function Spotify() {
  const [view, setView] = useState('home');
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song, playlist) => {
    setPlaying({ ...song, playlist: playlist.name, cover: playlist.cover });
    setIsPlaying(true);
  };

  // PLAYLIST
  if (view === 'playlist' && activePlaylist) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={()=>setView('home')} style={B}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
      </div>
      <div style={{ padding:'0 16px 16px', display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:100, height:100, borderRadius:8, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>{activePlaylist.cover}</div>
        <div>
          <div style={{ color:C.text, fontSize:20, fontWeight:700 }}>{activePlaylist.name}</div>
          <div style={{ color:C.textSec, fontSize:13, marginTop:2 }}>{activePlaylist.songs.length} músicas</div>
          <button onClick={()=>playSong(activePlaylist.songs[0], activePlaylist)} style={{
            marginTop:8, padding:'8px 24px', borderRadius:20, border:'none', cursor:'pointer',
            background:C.green, color:'#000', fontSize:14, fontWeight:700,
          }}>▶ Reproduzir</button>
        </div>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'0 16px', paddingBottom: playing ? 80 : 16 }}>
        {activePlaylist.songs.map((s,i) => (
          <div key={s.id} onClick={()=>playSong(s, activePlaylist)}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
            <span style={{ color:playing?.id===s.id&&playing?.playlist===activePlaylist.name?C.green:C.textTer, fontSize:14, width:20, textAlign:'right' }}>{i+1}</span>
            <div style={{ flex:1 }}>
              <div style={{ color:playing?.id===s.id&&playing?.playlist===activePlaylist.name?C.green:C.text, fontSize:15, fontWeight:500 }}>{s.name}</div>
              <div style={{ color:C.textSec, fontSize:12 }}>{s.artist}</div>
            </div>
            <span style={{ color:C.textTer, fontSize:12 }}>{s.dur}</span>
          </div>
        ))}
      </div>
      {playing && <MiniPlayer playing={playing} isPlaying={isPlaying} onToggle={()=>setIsPlaying(!isPlaying)} />}
    </div>
  );

  // HOME
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'14px 16px' }}>
        <span style={{ color:C.text, fontSize:24, fontWeight:700 }}>Boa noite</span>
      </div>
      {/* Quick playlists */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'0 16px 16px' }}>
        {PLAYLISTS.slice(0,4).map(p => (
          <button key={p.id} onClick={()=>{setActivePlaylist(p);setView('playlist');}}
            style={{ display:'flex', alignItems:'center', gap:10, background:C.elevated, borderRadius:6, padding:0, border:'none', cursor:'pointer', overflow:'hidden' }}>
            <div style={{ width:48, height:48, background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{p.cover}</div>
            <span style={{ color:C.text, fontSize:13, fontWeight:600, textAlign:'left' }}>{p.name}</span>
          </button>
        ))}
      </div>
      {/* All playlists */}
      <div style={{ flex:1, overflow:'auto', padding:'0 16px', paddingBottom: playing ? 80 : 16 }}>
        <div style={{ color:C.text, fontSize:18, fontWeight:700, marginBottom:12 }}>Playlists populares</div>
        <div style={{ display:'flex', gap:12, overflow:'auto', paddingBottom:8 }}>
          {PLAYLISTS.map(p => (
            <button key={p.id} onClick={()=>{setActivePlaylist(p);setView('playlist');}}
              style={{ background:'transparent', border:'none', cursor:'pointer', textAlign:'center', minWidth:130, flexShrink:0 }}>
              <div style={{ width:130, height:130, borderRadius:8, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, marginBottom:8 }}>{p.cover}</div>
              <div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{p.name}</div>
              <div style={{ color:C.textSec, fontSize:12 }}>Playlist</div>
            </button>
          ))}
        </div>
      </div>
      {playing && <MiniPlayer playing={playing} isPlaying={isPlaying} onToggle={()=>setIsPlaying(!isPlaying)} />}
    </div>
  );
}

function MiniPlayer({ playing, isPlaying, onToggle }) {
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0, background:`linear-gradient(180deg, ${playing?'#1A3A1A':'#2A2A2A'}, #0A0A0A)`,
      padding:'10px 16px', display:'flex', alignItems:'center', gap:12, borderTop:`1px solid #333`,
    }}>
      <div style={{ width:40, height:40, borderRadius:4, background:'#282828', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{playing.cover}</div>
      <div style={{ flex:1, overflow:'hidden' }}>
        <div style={{ color:'#fff', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{playing.name}</div>
        <div style={{ color:'#B3B3B3', fontSize:11 }}>{playing.artist}</div>
      </div>
      <button onClick={onToggle} style={{ background:'none', border:'none', cursor:'pointer', padding:8 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
          {isPlaying ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></> : <path d="M8 5v14l11-7z"/>}
        </svg>
      </button>
    </div>
  );
}

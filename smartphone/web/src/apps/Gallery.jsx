import { useState, useEffect, useCallback } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';

const C = {
  bg:'#000000', surface:'#1C1C1E', elevated:'#2C2C2E',
  text:'#FFFFFF', textSec:'#8E8E93', sep:'#38383A',
  accent:'#0A84FF',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

// Placeholder photos (in RP, these would be actual screenshots)
const PLACEHOLDER_COLORS = ['#1a3a5c','#5c1a3a','#3a5c1a','#5c3a1a','#1a5c3a','#3a1a5c','#4a2a1a','#1a4a2a','#2a1a4a'];

export default function Gallery({ onNavigate }) {
  const [photos, setPhotos] = useState([]);
  const [view, setView] = useState('grid');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('gallery'); // gallery, albums

  useEffect(() => {
    fetchBackend('gallery_init').then(r => {
      if (r?.photos) setPhotos(r.photos);
      setLoading(false);
    });
  }, []);

  const takePhoto = async () => {
    fetchClient('playSound', { sound: 'photo' });
    const r = await fetchBackend('gallery_capture');
    if (r?.ok && r?.photo) setPhotos(p => [r.photo, ...p]);
  };

  const deletePhoto = async (id) => {
    await fetchBackend('gallery_delete', { id });
    setPhotos(p => p.filter(x => x.id !== id));
    setView('grid');
  };

  // VIEWER
  if (view === 'viewer') {
    const photo = photos[selectedIdx];
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#000' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px' }}>
          <button onClick={()=>setView('grid')} style={{ ...B, color:C.accent, fontSize:15 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span style={{ color:C.text, fontSize:15 }}>{selectedIdx + 1} de {photos.length}</span>
          <button onClick={()=>photo&&deletePhoto(photo.id)} style={{ ...B, color:'#FF453A', fontSize:13 }}>Excluir</button>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:8 }}>
          {photo?.url ? (
            <img src={photo.url} style={{ maxWidth:'100%', maxHeight:'100%', borderRadius:4 }} draggable={false} />
          ) : (
            <div style={{
              width:'100%', height:'100%', maxHeight:400, borderRadius:8,
              background:`linear-gradient(135deg, ${PLACEHOLDER_COLORS[selectedIdx % PLACEHOLDER_COLORS.length]}, ${PLACEHOLDER_COLORS[(selectedIdx+3) % PLACEHOLDER_COLORS.length]})`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontSize:48 }}>📸</span>
            </div>
          )}
        </div>
        <div style={{ padding:'8px 16px 12px', textAlign:'center' }}>
          <div style={{ color:C.textSec, fontSize:12 }}>
            {photo?.created_at ? new Date(photo.created_at).toLocaleString('pt-BR') : 'Foto do jogo'}
          </div>
        </div>
      </div>
    );
  }

  // GRID
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:C.text, fontSize:22, fontWeight:700 }}>Fotos</span>
        <button onClick={takePhoto} style={{
          ...B, background:C.accent, width:34, height:34, borderRadius:17,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 15c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm8-9h-3.17L15 4H9L7.17 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`0.5px solid ${C.sep}` }}>
        {['gallery','albums'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1, padding:'10px', border:'none', cursor:'pointer', background:'transparent',
            color: tab===t ? C.accent : C.textSec, fontSize:14, fontWeight:600,
            borderBottom: tab===t ? `2px solid ${C.accent}` : '2px solid transparent',
          }}>{t === 'gallery' ? 'Biblioteca' : 'Álbuns'}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex:1, overflow:'auto' }}>
        {tab === 'gallery' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, padding:2 }}>
            {loading ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:C.textSec }}>Carregando...</div>
            ) : photos.length === 0 ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40 }}>
                <span style={{ fontSize:48 }}>📷</span>
                <div style={{ color:C.textSec, fontSize:14, marginTop:8 }}>Nenhuma foto</div>
                <div style={{ color:C.textSec, fontSize:12 }}>Toque no 📷 para capturar</div>
              </div>
            ) : photos.map((p, i) => (
              <button key={p.id||i} onClick={()=>{setSelectedIdx(i);setView('viewer');}}
                style={{ aspectRatio:'1', border:'none', cursor:'pointer', padding:0, overflow:'hidden' }}>
                {p.url ? (
                  <img src={p.url} style={{ width:'100%', height:'100%', objectFit:'cover' }} draggable={false} />
                ) : (
                  <div style={{
                    width:'100%', height:'100%',
                    background:`linear-gradient(135deg, ${PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]}, ${PLACEHOLDER_COLORS[(i+3) % PLACEHOLDER_COLORS.length]})`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <span style={{ fontSize:24, opacity:0.5 }}>📸</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[{name:'Todas',count:photos.length,emoji:'📷'},{name:'Favoritas',count:0,emoji:'❤️'},{name:'Screenshots',count:0,emoji:'📱'},{name:'Recentes',count:photos.length,emoji:'🕐'}].map(a => (
                <div key={a.name} style={{
                  background:C.surface, borderRadius:12, padding:12, cursor:'pointer',
                }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{a.emoji}</div>
                  <div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{a.name}</div>
                  <div style={{ color:C.textSec, fontSize:12 }}>{a.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

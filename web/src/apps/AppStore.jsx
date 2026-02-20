import { useState, useEffect, useCallback } from 'react';
import { fetchBackend } from '../hooks/useNui';

const C = {
  bg:'#000000', surface:'#1C1C1E', elevated:'#2C2C2E',
  text:'#FFFFFF', textSec:'#8E8E93', textTer:'#636366',
  sep:'#333', blue:'#0A84FF', red:'#FF453A', green:'#30D158',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

const STORE_APPS = [
  { id:'instagram', name:'Instagram', desc:'Rede social de fotos e stories', category:'Social', icon:'./apps/instagram.webp', size:'52 MB' },
  { id:'twitter', name:'X (Twitter)', desc:'Rede social de microblogging', category:'Social', icon:'./apps/twitter.webp', size:'38 MB' },
  { id:'tinder', name:'Tinder', desc:'Encontre pessoas perto de você', category:'Social', icon:'./apps/tinder.webp', size:'45 MB' },
  { id:'grindr', name:'Grindr', desc:'Rede social LGBTQ+', category:'Social', icon:'./apps/grindr.webp', size:'42 MB' },
  { id:'tiktok', name:'TikTok', desc:'Vídeos curtos virais', category:'Entretenimento', icon:'./apps/tiktok.webp', size:'67 MB' },
  { id:'spotify', name:'Spotify', desc:'Músicas e podcasts', category:'Música', icon:'./apps/spotify.webp', size:'55 MB' },
  { id:'uber', name:'Uber', desc:'Peça corridas ou seja motorista', category:'Transporte', icon:'./apps/uber.webp', size:'48 MB' },
  { id:'waze', name:'Waze', desc:'Navegação GPS comunitária', category:'Navegação', icon:'./apps/waze.webp', size:'35 MB' },
  { id:'ifood', name:'iFood', desc:'Delivery de comida', category:'Comida', icon:'./apps/ifood.webp', size:'44 MB' },
  { id:'paypal', name:'PayPal', desc:'Envie e receba dinheiro', category:'Finanças', icon:'./apps/paypal.webp', size:'30 MB' },
  { id:'marketplace', name:'Mercado Livre', desc:'Compre e venda tudo', category:'Comércio', icon:'./apps/mercadolivre.webp', size:'50 MB' },
  { id:'casino', name:'Blaze', desc:'Jogos e apostas online', category:'Jogos', icon:'./apps/blaze.webp', size:'28 MB' },
  { id:'tor', name:'Tor Browser', desc:'Navegação anônima', category:'Utilidades', icon:'./apps/tor.jpg', size:'22 MB' },
  { id:'weazel', name:'Weazel News', desc:'Notícias da cidade', category:'Notícias', icon:'./apps/weazel.webp', size:'18 MB' },
  { id:'yellowpages', name:'Pág. Amarelas', desc:'Guia de serviços', category:'Utilidades', icon:'./apps/yellowpages.webp', size:'12 MB' },
  { id:'minesweeper', name:'Campo Minado', desc:'Jogo clássico de minas', category:'Jogos', icon:'./apps/minesweeper.webp', size:'5 MB' },
];

const CATEGORIES = ['Todos','Social','Entretenimento','Música','Transporte','Comida','Finanças','Jogos','Utilidades','Notícias','Comércio','Navegação'];

export default function AppStore({ onNavigate }) {
  const [installedApps, setInstalledApps] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [selectedApp, setSelectedApp] = useState(null);
  const [installing, setInstalling] = useState(null);
  const [tab, setTab] = useState('discover');

  useEffect(() => {
    fetchBackend('appstore_init').then(r => {
      if (r?.installed) setInstalledApps(r.installed);
      else setInstalledApps(STORE_APPS.map(a=>a.id)); // all installed by default
    });
  }, []);

  const installApp = async (appId) => {
    setInstalling(appId);
    await fetchBackend('appstore_install', { appId });
    await new Promise(r => setTimeout(r, 1200)); // simulate download
    setInstalledApps(p => [...p, appId]);
    setInstalling(null);
  };

  const uninstallApp = async (appId) => {
    await fetchBackend('appstore_uninstall', { appId });
    setInstalledApps(p => p.filter(id => id !== appId));
  };

  const filtered = STORE_APPS.filter(a => {
    if (searchQ.trim() && !a.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (selectedCat !== 'Todos' && a.category !== selectedCat) return false;
    return true;
  });

  // APP DETAIL
  if (selectedApp) {
    const isInstalled = installedApps.includes(selectedApp.id);
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px' }}>
          <button onClick={()=>setSelectedApp(null)} style={B}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        </div>
        <div style={{ padding:'0 16px' }}>
          <div style={{ display:'flex', gap:14, marginBottom:16 }}>
            <img src={selectedApp.icon} alt="" style={{ width:72, height:72, borderRadius:16 }} onError={e=>{e.target.style.background=C.elevated;e.target.style.fontSize='32px';e.target.src='';}} />
            <div style={{ flex:1 }}>
              <div style={{ color:C.text, fontSize:20, fontWeight:700 }}>{selectedApp.name}</div>
              <div style={{ color:C.textSec, fontSize:13 }}>{selectedApp.category}</div>
              <div style={{ color:C.textTer, fontSize:12, marginTop:2 }}>{selectedApp.size}</div>
            </div>
          </div>
          {isInstalled ? (
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>{ setSelectedApp(null); onNavigate(selectedApp.id); }} style={{
                flex:1, padding:'12px', borderRadius:20, border:'none', cursor:'pointer',
                background:C.blue, color:'#fff', fontSize:15, fontWeight:600,
              }}>Abrir</button>
              <button onClick={()=>uninstallApp(selectedApp.id)} style={{
                padding:'12px 20px', borderRadius:20, border:`1px solid ${C.red}`, cursor:'pointer',
                background:'transparent', color:C.red, fontSize:14, fontWeight:500,
              }}>Remover</button>
            </div>
          ) : (
            <button onClick={()=>installApp(selectedApp.id)} disabled={installing===selectedApp.id} style={{
              width:'100%', padding:'12px', borderRadius:20, border:'none', cursor:'pointer',
              background:C.blue, color:'#fff', fontSize:15, fontWeight:600,
              opacity:installing===selectedApp.id?0.7:1,
            }}>{installing===selectedApp.id?'Instalando...':'Obter'}</button>
          )}
          <div style={{ marginTop:20, padding:'14px', background:C.surface, borderRadius:12 }}>
            <div style={{ color:C.text, fontSize:14, fontWeight:600, marginBottom:6 }}>Descrição</div>
            <div style={{ color:C.textSec, fontSize:14, lineHeight:1.5 }}>{selectedApp.desc}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'14px 16px 8px' }}>
        <div style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:10 }}>
          {tab === 'discover' ? 'Descobrir' : 'Instalados'}
        </div>
        <div style={{ display:'flex', alignItems:'center', background:C.elevated, borderRadius:12, padding:'10px 14px', gap:8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={C.textTer}><circle cx="11" cy="11" r="7" fill="none" stroke={C.textTer} strokeWidth="2"/><path d="M21 21l-4-4" stroke={C.textTer} strokeWidth="2"/></svg>
          <input type="text" placeholder="Buscar apps..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:15, fontFamily:'inherit' }} />
        </div>
      </div>

      {/* Categories */}
      {tab === 'discover' && (
        <div style={{ display:'flex', gap:8, padding:'8px 16px', overflow:'auto' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>setSelectedCat(c)} style={{
              padding:'6px 14px', borderRadius:16, border:'none', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
              background:selectedCat===c?C.blue:C.elevated, color:selectedCat===c?'#fff':C.textSec, fontSize:13, fontWeight:500,
            }}>{c}</button>
          ))}
        </div>
      )}

      {/* App list */}
      <div style={{ flex:1, overflow:'auto', padding:'8px 16px' }}>
        {(tab==='installed' ? STORE_APPS.filter(a=>installedApps.includes(a.id)) : filtered).map(app => {
          const isInstalled = installedApps.includes(app.id);
          return (
            <div key={app.id} onClick={()=>setSelectedApp(app)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
              <img src={app.icon} alt="" style={{ width:52, height:52, borderRadius:12, background:C.elevated }} onError={e=>{e.target.style.background=C.elevated;}} />
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{app.name}</div>
                <div style={{ color:C.textSec, fontSize:12 }}>{app.category} • {app.size}</div>
              </div>
              <button onClick={e=>{e.stopPropagation(); isInstalled?uninstallApp(app.id):installApp(app.id);}}
                disabled={installing===app.id}
                style={{
                  padding:'6px 16px', borderRadius:16, border:'none', cursor:'pointer',
                  background:isInstalled?C.elevated:C.blue, color:isInstalled?C.blue:'#fff',
                  fontSize:13, fontWeight:600, minWidth:70, textAlign:'center',
                  opacity:installing===app.id?0.7:1,
                }}>
                {installing===app.id?'...':(isInstalled?'Abrir':'Obter')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom tabs */}
      <div style={{ display:'flex', borderTop:`0.5px solid ${C.sep}`, background:C.surface }}>
        {[{id:'discover',label:'Descobrir',icon:'🔍'},{id:'installed',label:'Instalados',icon:'📱'}].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, padding:'10px', background:'transparent', border:'none', cursor:'pointer', textAlign:'center',
          }}>
            <div style={{ fontSize:18 }}>{t.icon}</div>
            <div style={{ color:tab===t.id?C.blue:C.textSec, fontSize:10, marginTop:2 }}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

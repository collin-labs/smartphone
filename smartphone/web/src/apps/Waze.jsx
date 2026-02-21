import { useState, useEffect, useCallback } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';

// Waze real colors
const C = {
  bg:'#15151A', map:'#1A1A2E', surface:'#1E1E2E',
  text:'#FFFFFF', textSec:'#B0B0C0', textTer:'#6B6B7B',
  sep:'#2A2A3A', accent:'#33CCFF', waze:'#33CCFF',
  input:'#2A2A3A', purple:'#8B5CF6',
  eta:'#30D158', speed:'#FFFFFF',
  report: { police:'#FF6B6B', crash:'#FFB800', hazard:'#FF6B6B', traffic:'#FF453A', construction:'#FFB800' },
};

const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

const Ic = {
  back: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.textSec}><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  nav: <svg width="28" height="28" viewBox="0 0 24 24" fill={C.accent}><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>,
  pin: <svg width="22" height="22" viewBox="0 0 24 24" fill={C.accent}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textSec}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  work: <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textSec}><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textSec}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  myLoc: <svg width="24" height="24" viewBox="0 0 24 24" fill={C.accent}><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>,
  police: '🚔', crash: '💥', hazard: '⚠️', traffic: '🔴', construction: '🚧',
};

const SAVED_LOCATIONS = [
  { name:'Prefeitura', category:'Governo', emoji:'🏛️' },
  { name:'Hospital Central', category:'Saúde', emoji:'🏥' },
  { name:'Aeroporto', category:'Transporte', emoji:'✈️' },
  { name:'Praia', category:'Lazer', emoji:'🏖️' },
  { name:'Delegacia', category:'Governo', emoji:'👮' },
  { name:'Garagem Central', category:'Serviços', emoji:'🅿️' },
  { name:'Burger Shot', category:'Comida', emoji:'🍔' },
  { name:'Pizza This', category:'Comida', emoji:'🍕' },
  { name:'Vanilla Unicorn', category:'Entretenimento', emoji:'🦄' },
  { name:'Diamond Casino', category:'Entretenimento', emoji:'🎰' },
  { name:'Mecânico', category:'Serviços', emoji:'🔧' },
  { name:'Loja de Armas', category:'Comércio', emoji:'🔫' },
];

const REPORT_TYPES = [
  { id:'police', name:'Polícia', emoji:'🚔', color:'#FF6B6B' },
  { id:'crash', name:'Acidente', emoji:'💥', color:'#FFB800' },
  { id:'hazard', name:'Perigo', emoji:'⚠️', color:'#FF6B6B' },
  { id:'traffic', name:'Trânsito', emoji:'🔴', color:'#FF453A' },
  { id:'construction', name:'Obra', emoji:'🚧', color:'#FFB800' },
];

export default function Waze({ onNavigate }) {
  const [view, setView] = useState('map');
  const [searchQ, setSearchQ] = useState('');
  const [navigating, setNavigating] = useState(null); // { destination, eta }
  const [reports, setReports] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    fetchBackend('waze_init').then(r => {
      if (r?.reports) setReports(r.reports);
      if (r?.saved) setSavedPlaces(r.saved);
      if (r?.recent) setRecentSearches(r.recent);
    });
  }, []);

  const startNav = async (dest) => {
    const r = await fetchBackend('waze_navigate', { destination: dest });
    if (r?.ok) {
      setNavigating({ destination: dest, eta: r.eta || '5 min' });
      setView('map');
      setSearchQ('');
      // FiveM: set waypoint on map
      fetchClient('setWaypoint', { destination: dest });
    }
  };

  const stopNav = async () => {
    await fetchBackend('waze_stop');
    fetchClient('removeWaypoint');
    setNavigating(null);
  };

  const sendReport = async (type) => {
    const r = await fetchBackend('waze_report', { type });
    if (r?.ok && r?.report) setReports(p => [r.report, ...p]);
    setShowReport(false);
  };

  const filteredLocations = searchQ.trim()
    ? SAVED_LOCATIONS.filter(l => l.name.toLowerCase().includes(searchQ.toLowerCase()))
    : SAVED_LOCATIONS;

  // ===== SEARCH =====
  if (view === 'search') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Search bar */}
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={()=>{setView('map');setSearchQ('');}} style={B}>{Ic.back}</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', background:C.input, borderRadius:24, padding:'10px 16px', gap:8 }}>
          {Ic.search}
          <input type="text" placeholder="Buscar endereço" value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&searchQ.trim()&&startNav(searchQ.trim())} autoFocus
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:16, fontFamily:'inherit' }} />
          {searchQ && <button onClick={()=>setSearchQ('')} style={B}>{Ic.close}</button>}
        </div>
      </div>

      {/* Quick access */}
      {!searchQ.trim() && (
        <div style={{ display:'flex', gap:0, padding:'4px 16px 12px' }}>
          {[
            { icon:Ic.home, label:'Casa' },
            { icon:Ic.work, label:'Trabalho' },
            { icon:Ic.star, label:'Salvos' },
          ].map((q,i) => (
            <button key={i} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'12px 8px',
              background:'transparent', border:'none', cursor:'pointer',
            }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:C.surface, display:'flex', alignItems:'center', justifyContent:'center' }}>{q.icon}</div>
              <span style={{ color:C.textSec, fontSize:12 }}>{q.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Recent */}
      {!searchQ.trim() && recentSearches.length > 0 && (
        <div style={{ padding:'0 16px' }}>
          <div style={{ color:C.textTer, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Recentes</div>
          {recentSearches.slice(0,3).map((r,i) => (
            <div key={i} onClick={()=>startNav(r)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🕐</div>
              <span style={{ color:C.text, fontSize:15 }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      <div style={{ flex:1, overflow:'auto', padding:'8px 16px' }}>
        {searchQ.trim() && <div style={{ color:C.textTer, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Resultados</div>}
        {filteredLocations.map((loc,i) => (
          <div key={i} onClick={()=>startNav(loc.name)}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              {loc.emoji}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:C.text, fontSize:15 }}>{loc.name}</div>
              <div style={{ color:C.textTer, fontSize:12 }}>{loc.category}</div>
            </div>
            {Ic.nav}
          </div>
        ))}
      </div>
    </div>
  );

  // ===== MAP (main view) =====
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.map, position:'relative' }}>
      {/* Map background with grid */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
        <div style={{
          width:'100%', height:'100%',
          backgroundImage:`
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize:'40px 40px',
        }}>
          {/* Road lines */}
          <div style={{ position:'absolute', top:'45%', left:0, right:0, height:3, background:'rgba(255,255,255,0.08)' }}/>
          <div style={{ position:'absolute', top:0, bottom:0, left:'35%', width:3, background:'rgba(255,255,255,0.08)' }}/>
          <div style={{ position:'absolute', top:'20%', left:'10%', right:'20%', height:2, background:'rgba(255,255,255,0.05)', transform:'rotate(-15deg)' }}/>

          {/* Reports on map */}
          {reports.slice(0,5).map((r,i) => (
            <div key={i} style={{
              position:'absolute',
              top: `${20 + (i * 15)}%`,
              left: `${15 + (i * 18) % 70}%`,
              background: REPORT_TYPES.find(t=>t.id===r.type)?.color || '#FFB800',
              width:28, height:28, borderRadius:14,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
              boxShadow:'0 2px 8px rgba(0,0,0,0.4)',
            }}>
              {REPORT_TYPES.find(t=>t.id===r.type)?.emoji || '⚠️'}
            </div>
          ))}

          {/* My location indicator */}
          <div style={{
            position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          }}>
            <div style={{
              width:18, height:18, borderRadius:'50%', background:C.accent,
              border:'3px solid #fff', boxShadow:'0 0 12px rgba(51,204,255,0.5)',
            }}/>
            {navigating && (
              <div style={{
                position:'absolute', top:-20, left:'50%', transform:'translateX(-50%) rotate(-45deg)',
                width:0, height:0, borderLeft:'8px solid transparent', borderRight:'8px solid transparent', borderBottom:`14px solid ${C.accent}`,
              }}/>
            )}
          </div>
        </div>
      </div>

      {/* Top: search bar */}
      <div style={{ position:'relative', zIndex:10, padding:'12px 16px', display:'flex', gap:10 }}>
        <button onClick={()=>setView('search')} style={{
          flex:1, display:'flex', alignItems:'center', gap:10,
          background:C.surface+'EE', borderRadius:24, padding:'10px 16px',
          border:'none', cursor:'pointer', backdropFilter:'blur(8px)',
        }}>
          {Ic.search}
          <span style={{ color:C.textSec, fontSize:15, flex:1, textAlign:'left' }}>Buscar endereço</span>
        </button>
      </div>

      {/* Navigating banner */}
      {navigating && (
        <div style={{
          position:'relative', zIndex:10, margin:'0 16px',
          background:C.accent, borderRadius:16, padding:'14px 16px',
          display:'flex', alignItems:'center', gap:12,
        }}>
          {Ic.nav}
          <div style={{ flex:1 }}>
            <div style={{ color:'#000', fontSize:13, fontWeight:500 }}>Navegando para</div>
            <div style={{ color:'#000', fontSize:17, fontWeight:700 }}>{navigating.destination}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ color:'#000', fontSize:20, fontWeight:700 }}>{navigating.eta}</div>
            <div style={{ color:'rgba(0,0,0,0.6)', fontSize:12 }}>ETA</div>
          </div>
          <button onClick={stopNav} style={{
            ...B, width:32, height:32, borderRadius:16, background:'rgba(0,0,0,0.2)', marginLeft:4,
          }}>{Ic.close}</button>
        </div>
      )}

      {/* Bottom controls */}
      <div style={{ position:'absolute', bottom:16, left:16, right:16, zIndex:10, display:'flex', flexDirection:'column', gap:10 }}>
        {/* Reports bar */}
        {reports.length > 0 && (
          <div style={{
            background:C.surface+'EE', borderRadius:12, padding:'8px 12px',
            backdropFilter:'blur(8px)',
          }}>
            <div style={{ color:C.textTer, fontSize:11, fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>Alertas próximos</div>
            <div style={{ display:'flex', gap:6, overflow:'auto' }}>
              {reports.slice(0,4).map((r,i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:4, background:C.input, borderRadius:16, padding:'4px 10px', whiteSpace:'nowrap',
                }}>
                  <span style={{ fontSize:12 }}>{REPORT_TYPES.find(t=>t.id===r.type)?.emoji}</span>
                  <span style={{ color:C.text, fontSize:12 }}>{REPORT_TYPES.find(t=>t.id===r.type)?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display:'flex', gap:10 }}>
          {/* Report button */}
          <button onClick={()=>setShowReport(!showReport)} style={{
            width:52, height:52, borderRadius:26, background:C.surface+'EE', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)',
            boxShadow:'0 2px 10px rgba(0,0,0,0.3)',
          }}>
            <span style={{ fontSize:22 }}>⚠️</span>
          </button>

          {/* My location */}
          <button style={{
            width:52, height:52, borderRadius:26, background:C.surface+'EE', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)',
            boxShadow:'0 2px 10px rgba(0,0,0,0.3)', marginLeft:'auto',
          }}>
            {Ic.myLoc}
          </button>
        </div>

        {/* Report picker */}
        {showReport && (
          <div style={{
            background:C.surface+'F5', borderRadius:16, padding:'14px', backdropFilter:'blur(12px)',
            boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <div style={{ color:C.text, fontSize:15, fontWeight:600, marginBottom:10 }}>Reportar na via</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {REPORT_TYPES.map(rt => (
                <button key={rt.id} onClick={()=>sendReport(rt.id)} style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  background:C.input, borderRadius:12, padding:'10px 14px', border:'none', cursor:'pointer', minWidth:56,
                }}>
                  <span style={{ fontSize:22 }}>{rt.emoji}</span>
                  <span style={{ color:C.text, fontSize:11, fontWeight:500 }}>{rt.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

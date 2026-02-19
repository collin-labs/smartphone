import { useState, useEffect, useCallback } from 'react';
import { fetchBackend } from '../hooks/useNui';

// Yellow Pages dark mode
const C = {
  bg:'#0A0A0A', surface:'#1A1A1A', elevated:'#242424',
  text:'#FFFFFF', textSec:'#A0A0A0', textTer:'#666666',
  sep:'#2A2A2A', yellow:'#FFD60A', yellowDark:'#B89B00',
  accent:'#FFD60A', input:'#1E1E1E', tag:'#333333',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };
const Ic = {
  back: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  phone: <svg width="18" height="18" viewBox="0 0 24 24" fill={C.yellow}><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  add: <svg width="22" height="22" viewBox="0 0 24 24" fill="#000"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
};
const CATS = [
  { id:'all', name:'Todos', emoji:'📋' },
  { id:'mecanico', name:'Mecânico', emoji:'🔧' },
  { id:'taxi', name:'Táxi', emoji:'🚕' },
  { id:'advogado', name:'Advogado', emoji:'⚖️' },
  { id:'medico', name:'Médico', emoji:'🏥' },
  { id:'imoveis', name:'Imóveis', emoji:'🏠' },
  { id:'comida', name:'Comida', emoji:'🍔' },
  { id:'seguranca', name:'Segurança', emoji:'🛡️' },
  { id:'outro', name:'Outros', emoji:'📦' },
];

export default function YellowPages({ onNavigate }) {
  const [view, setView] = useState('list');
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('outro');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchBackend('yp_list').then(r => { if (r?.ads) setAds(r.ads); setLoading(false); });
  }, []);

  const publish = async () => {
    if (!name.trim() || !phone.trim()) return;
    const r = await fetchBackend('yp_create', { name: name.trim(), description: desc.trim(), category: cat, phone: phone.trim() });
    if (r?.ok && r?.ad) { setAds(p => [r.ad, ...p]); setName(''); setDesc(''); setPhone(''); setView('list'); }
  };

  const filtered = ads.filter(a => {
    if (activeCat !== 'all' && a.category !== activeCat) return false;
    if (searchQ.trim() && !a.name.toLowerCase().includes(searchQ.toLowerCase()) && !(a.description||'').toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  if (view === 'create') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>setView('list')} style={{ ...B, color:C.textSec, fontSize:15 }}>Cancelar</button>
        <span style={{ color:C.text, fontSize:16, fontWeight:700 }}>Novo anúncio</span>
        <button onClick={publish} disabled={!name.trim()||!phone.trim()} style={{
          ...B, background:(!name.trim()||!phone.trim())?C.elevated:C.yellow,
          padding:'6px 16px', borderRadius:16, opacity:(!name.trim()||!phone.trim())?0.5:1,
        }}><span style={{ color:'#000', fontSize:14, fontWeight:600 }}>Publicar</span></button>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        <input type="text" placeholder="Nome do serviço" value={name} onChange={e=>setName(e.target.value)}
          style={{ width:'100%', background:C.surface, border:'none', outline:'none', color:C.text, fontSize:16, padding:'12px 14px', borderRadius:8, marginBottom:12, fontFamily:'inherit' }} />
        <input type="text" placeholder="Telefone de contato" value={phone} onChange={e=>setPhone(e.target.value)}
          style={{ width:'100%', background:C.surface, border:'none', outline:'none', color:C.text, fontSize:16, padding:'12px 14px', borderRadius:8, marginBottom:12, fontFamily:'inherit' }} />
        <textarea placeholder="Descrição (opcional)" value={desc} onChange={e=>setDesc(e.target.value)}
          style={{ width:'100%', minHeight:100, background:C.surface, border:'none', outline:'none', color:C.text, fontSize:15, padding:'12px 14px', borderRadius:8, marginBottom:16, fontFamily:'inherit', resize:'vertical' }} />
        <div style={{ color:C.textSec, fontSize:13, marginBottom:8, fontWeight:600 }}>Categoria</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {CATS.filter(c=>c.id!=='all').map(c => (
            <button key={c.id} onClick={()=>setCat(c.id)} style={{
              padding:'8px 14px', borderRadius:16, border:'none', cursor:'pointer', fontSize:13,
              background: cat===c.id ? C.yellow : C.elevated, color: cat===c.id ? '#000' : C.textSec,
            }}>{c.emoji} {c.name}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'14px 16px 8px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <span style={{ color:C.yellow, fontSize:22, fontWeight:800 }}>Páginas</span>
            <span style={{ color:C.text, fontSize:22, fontWeight:300, marginLeft:4 }}>Amarelas</span>
          </div>
          <button onClick={()=>setView('create')} style={{ ...B, background:C.yellow, width:36, height:36, borderRadius:18 }}>{Ic.add}</button>
        </div>
        <div style={{ display:'flex', alignItems:'center', background:C.input, borderRadius:24, padding:'8px 14px', gap:8, marginBottom:10, border:`1px solid ${C.sep}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={C.textTer}><circle cx="11" cy="11" r="7" fill="none" stroke={C.textTer} strokeWidth="2"/><path d="M21 21l-4-4" stroke={C.textTer} strokeWidth="2"/></svg>
          <input type="text" placeholder="Buscar serviço..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:15, fontFamily:'inherit' }} />
        </div>
        <div style={{ display:'flex', gap:6, overflow:'auto', paddingBottom:4 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={()=>setActiveCat(c.id)} style={{
              padding:'5px 12px', borderRadius:14, border:'none', cursor:'pointer', fontSize:12, whiteSpace:'nowrap', flexShrink:0,
              background: activeCat===c.id ? C.yellow : C.elevated, color: activeCat===c.id ? '#000' : C.textSec,
            }}>{c.emoji} {c.name}</button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflow:'auto' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
            <div style={{ width:24, height:24, border:`2px solid ${C.sep}`, borderTopColor:C.yellow, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:C.textSec }}>Nenhum anúncio</div>
        ) : filtered.map(a => (
          <div key={a.id} style={{ padding:'14px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                {CATS.find(c=>c.id===a.category)?.emoji||'📦'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:16, fontWeight:600 }}>{a.name}</div>
                {a.description && <div style={{ color:C.textSec, fontSize:13, marginTop:2, lineHeight:1.3 }}>{a.description}</div>}
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                  <span style={{ background:C.tag, color:C.textSec, fontSize:11, padding:'2px 8px', borderRadius:4 }}>
                    {CATS.find(c=>c.id===a.category)?.name||'Outros'}
                  </span>
                </div>
              </div>
              <button onClick={()=>onNavigate?.('phone',{number:a.phone})} style={{
                ...B, width:40, height:40, borderRadius:20, background:C.yellow+'22',
              }}>{Ic.phone}</button>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

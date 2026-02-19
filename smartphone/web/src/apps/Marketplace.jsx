import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// Mercado Livre real colors
const C = {
  yellow:'#FFF159', blue:'#3483FA', blueDark:'#2968C8', bg:'#1B1B1B', surface:'#2D2D2D',
  card:'#333333', text:'#FAFAFA', textSec:'#999999', green:'#00A650', greenBg:'rgba(0,166,80,0.12)',
  red:'#F23D4F', separator:'#3D3D3D', headerBg:'#FFE600', headerText:'#333333',
};

const CATS = [
  { id:'veiculos', name:'Veículos', emoji:'🚗', color:'#3483FA' },
  { id:'armas', name:'Armas', emoji:'🔫', color:'#A855F7' },
  { id:'itens', name:'Itens', emoji:'📦', color:'#FF7733' },
  { id:'imoveis', name:'Imóveis', emoji:'🏠', color:'#00A650' },
  { id:'servicos', name:'Serviços', emoji:'🔧', color:'#FF5733' },
  { id:'geral', name:'Geral', emoji:'🏷️', color:'#999' },
];

const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center' };
const Back = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.headerText} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const BackW = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;

const fmtMoney = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
const timeAgo = d => { if(!d)return''; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<3600)return Math.floor(s/60)+' min'; if(s<86400)return Math.floor(s/3600)+' h'; return Math.floor(s/86400)+' d'; };

export default function Marketplace({ onNavigate }) {
  const [view, setView] = useState('list');
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [buyError, setBuyError] = useState(null);
  const [buyOk, setBuyOk] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('geral');

  const loadListings = useCallback(async () => { setLoading(true); const r=await fetchBackend('market_listings',{category:activeCat,search:searchQ||undefined}); if(r?.listings)setListings(r.listings); setLoading(false); }, [activeCat, searchQ]);
  useEffect(() => { loadListings(); }, [loadListings]);
  usePusherEvent('MARKET_SOLD', useCallback((d) => { setListings(p=>p.filter(l=>l.id!==d.listingId)); }, []));

  const handleCreate = async () => { const price=parseFloat(newPrice.replace(',','.')); if(!newTitle.trim()||!price||price<=0)return; const r=await fetchBackend('market_create',{title:newTitle,description:newDesc,price,category:newCat}); if(r?.ok){setNewTitle('');setNewDesc('');setNewPrice('');setView('list');loadListings();} };
  const handleBuy = async () => { if(!selected)return; setBuyError(null);setBuyOk(false); const r=await fetchBackend('market_buy',{listingId:selected.id}); if(r?.error){setBuyError(r.error);return;} if(r?.ok){setBuyOk(true);setListings(p=>p.filter(l=>l.id!==selected.id));} };
  const handleContact = async () => { if(!selected)return; const r=await fetchBackend('market_contact',{listingId:selected.id}); if(r?.phone)onNavigate?.('whatsapp',{to:r.phone}); };
  const handleDelete = async (id) => { await fetchBackend('market_delete',{listingId:id}); setMyListings(p=>p.filter(l=>l.id!==id)); };
  const loadMyAds = async () => { const r=await fetchBackend('market_my_listings'); if(r?.listings)setMyListings(r.listings); setView('myAds'); };

  // ===== ML Header =====
  const MLHeader = ({ title, onBack, dark }) => (
    <div style={{ background:dark?C.bg:C.headerBg, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
      <button onClick={onBack} style={B}>{dark?BackW:Back}</button>
      <span style={{ color:dark?C.text:C.headerText, fontSize:16, fontWeight:600 }}>{title}</span>
    </div>
  );

  // ===== DETAIL =====
  if (view === 'detail' && selected) {
    const cat = CATS.find(c => c.id === selected.category) || CATS[5];
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
        <MLHeader title="" onBack={()=>{setView('list');setBuyError(null);setBuyOk(false);}} />
        <div style={{ flex:1, overflow:'auto' }}>
          {/* Image area */}
          <div style={{ background:C.surface, aspectRatio:'16/10', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:56 }}>{cat.emoji}</span>
          </div>

          <div style={{ padding:'16px' }}>
            {/* Condition tag */}
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <span style={{ fontSize:11, color:C.textSec }}>Novo | +10 vendidos</span>
            </div>
            {/* Title */}
            <div style={{ color:C.text, fontSize:18, fontWeight:400, lineHeight:1.3, marginBottom:16 }}>{selected.title}</div>
            {/* Price */}
            <div style={{ marginBottom:20 }}>
              <div style={{ color:C.text, fontSize:32, fontWeight:400 }}>{fmtMoney(selected.price)}</div>
              <div style={{ color:C.green, fontSize:14, marginTop:4 }}>em até 12x de {fmtMoney(selected.price / 12)}</div>
            </div>

            {buyOk ? (
              <div style={{ background:C.greenBg, borderRadius:8, padding:20, textAlign:'center', marginBottom:16 }}>
                <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
                <div style={{ color:C.green, fontSize:18, fontWeight:600 }}>Compra realizada!</div>
              </div>
            ) : (
              <>
                {buyError && (
                  <div style={{ background:'rgba(242,61,79,0.12)', borderRadius:8, padding:'12px 16px', marginBottom:12, color:C.red, fontSize:14 }}>{buyError}</div>
                )}
                {/* Buy button */}
                <button onClick={handleBuy} style={{
                  width:'100%', padding:'14px 0', borderRadius:6, border:'none', cursor:'pointer',
                  background:C.blue, color:'#fff', fontSize:16, fontWeight:600, marginBottom:8,
                }}>Comprar agora</button>
                {/* Contact button */}
                <button onClick={handleContact} style={{
                  width:'100%', padding:'14px 0', borderRadius:6, border:'none', cursor:'pointer',
                  background:'transparent', color:C.blue, fontSize:16, fontWeight:600,
                  border:`1px solid ${C.blue}`, marginBottom:20,
                }}>Contato com vendedor</button>
              </>
            )}

            {/* Description */}
            {selected.description && (
              <div style={{ borderTop:`1px solid ${C.separator}`, paddingTop:16 }}>
                <div style={{ color:C.text, fontSize:16, fontWeight:600, marginBottom:8 }}>Descrição</div>
                <div style={{ color:C.textSec, fontSize:14, lineHeight:1.5 }}>{selected.description}</div>
              </div>
            )}

            {/* Seller */}
            <div style={{ borderTop:`1px solid ${C.separator}`, paddingTop:16, marginTop:16 }}>
              <div style={{ color:C.text, fontSize:14 }}>Vendedor: <span style={{ color:C.blue }}>{selected.seller_name||selected.seller_phone}</span></div>
              <div style={{ color:C.textSec, fontSize:12, marginTop:4 }}>Publicado {timeAgo(selected.created_at)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== CREATE =====
  if (view === 'create') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ background:C.headerBg, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={()=>setView('list')} style={{...B,color:C.headerText,fontSize:15}}>Cancelar</button>
        <span style={{ color:C.headerText, fontSize:16, fontWeight:700 }}>Vender</span>
        <button onClick={handleCreate} style={{...B,color:C.blueDark,fontWeight:700,fontSize:15}}>Publicar</button>
      </div>
      <div style={{ flex:1, padding:'20px 16px', overflow:'auto' }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ color:C.textSec, fontSize:12, marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Título do anúncio</div>
          <input type="text" value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Ex: Elegy RH8 tunado"
            style={{ width:'100%', padding:'12px 14px', background:C.surface, border:`1px solid ${C.separator}`, borderRadius:6, color:C.text, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ color:C.textSec, fontSize:12, marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Preço</div>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:C.textSec, fontSize:16 }}>R$</span>
            <input type="text" value={newPrice} onChange={e=>setNewPrice(e.target.value.replace(/[^0-9,.]/g,''))} placeholder="0,00"
              style={{ width:'100%', padding:'12px 14px 12px 44px', background:C.surface, border:`1px solid ${C.separator}`, borderRadius:6, color:C.text, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ color:C.textSec, fontSize:12, marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Categoria</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {CATS.map(cat => (
              <button key={cat.id} onClick={()=>setNewCat(cat.id)} style={{
                padding:'12px 6px', borderRadius:8, border: newCat===cat.id ? `2px solid ${C.blue}` : `1px solid ${C.separator}`,
                cursor:'pointer', textAlign:'center', background: newCat===cat.id ? 'rgba(52,131,250,0.1)' : C.surface, color:C.text, fontSize:12,
              }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{cat.emoji}</div>
                <div>{cat.name}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ color:C.textSec, fontSize:12, marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Descrição</div>
          <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Descreva o que está vendendo..."
            style={{ width:'100%', minHeight:100, padding:'12px 14px', background:C.surface, border:`1px solid ${C.separator}`, borderRadius:6, color:C.text, fontSize:15, fontFamily:'inherit', outline:'none', resize:'none', boxSizing:'border-box' }} />
        </div>
      </div>
    </div>
  );

  // ===== MY ADS =====
  if (view === 'myAds') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <MLHeader title="Meus anúncios" onBack={()=>setView('list')} />
      <div style={{ flex:1, overflow:'auto' }}>
        {myListings.length===0 ? (
          <div style={{ textAlign:'center', padding:40, color:C.textSec }}>
            <div style={{ fontSize:40, marginBottom:8 }}>📋</div>
            <div>Nenhum anúncio</div>
          </div>
        ) : myListings.map(l => {
          const cat = CATS.find(c=>c.id===l.category)||CATS[5];
          return (
            <div key={l.id} style={{ display:'flex', gap:12, padding:'14px 16px', borderBottom:`1px solid ${C.separator}` }}>
              <div style={{ width:64, height:64, borderRadius:8, background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:28 }}>{cat.emoji}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:14 }}>{l.title}</div>
                <div style={{ color:C.text, fontSize:16, fontWeight:600, marginTop:2 }}>{fmtMoney(l.price)}</div>
                <div style={{ fontSize:12, marginTop:4, color:l.status==='sold'?C.green:C.textSec }}>{l.status==='sold'?'✅ Vendido':'Ativo'}</div>
              </div>
              {l.status!=='sold' && <button onClick={()=>handleDelete(l.id)} style={{...B,color:C.red,fontSize:13,fontWeight:600,alignSelf:'center'}}>Remover</button>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ===== LIST (HOME) =====
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Yellow header */}
      <div style={{ background:C.headerBg, padding:'10px 16px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', background:'#fff', borderRadius:20, padding:'8px 14px', gap:8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            <input type="text" placeholder="Buscar no Mercado Livre" value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&loadListings()}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#333', fontSize:15, fontFamily:'inherit' }} />
          </div>
        </div>
        {/* Categories */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
          <button onClick={()=>setActiveCat(null)} style={{
            padding:'5px 14px', borderRadius:16, border:'none', cursor:'pointer', flexShrink:0, fontSize:13, fontWeight:500,
            background:!activeCat?C.blue:'rgba(0,0,0,0.08)', color:!activeCat?'#fff':'#333',
          }}>Todos</button>
          {CATS.map(cat => (
            <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{
              padding:'5px 14px', borderRadius:16, border:'none', cursor:'pointer', flexShrink:0, fontSize:13, fontWeight:500, whiteSpace:'nowrap',
              background:activeCat===cat.id?C.blue:'rgba(0,0,0,0.08)', color:activeCat===cat.id?'#fff':'#333',
            }}>{cat.emoji} {cat.name}</button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:8, padding:'10px 16px', borderBottom:`1px solid ${C.separator}` }}>
        <button onClick={()=>{setNewTitle('');setNewDesc('');setNewPrice('');setNewCat('geral');setView('create');}} style={{
          flex:1, padding:'10px', borderRadius:6, border:'none', cursor:'pointer',
          background:C.blue, color:'#fff', fontSize:14, fontWeight:600,
        }}>+ Vender</button>
        <button onClick={loadMyAds} style={{
          flex:1, padding:'10px', borderRadius:6, border:'none', cursor:'pointer',
          background:C.surface, color:C.text, fontSize:14, fontWeight:500,
        }}>Meus anúncios</button>
      </div>

      {/* Listings */}
      <div style={{ flex:1, overflow:'auto', padding:'8px 12px' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
            <div style={{ width:24, height:24, border:`2px solid ${C.separator}`, borderTopColor:C.blue, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : listings.length===0 ? (
          <div style={{ textAlign:'center', padding:40, color:C.textSec }}>
            <div style={{ fontSize:40, marginBottom:8 }}>🔍</div>
            <div>Nenhum anúncio encontrado</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {listings.map(l => {
              const cat = CATS.find(c=>c.id===l.category)||CATS[5];
              return (
                <div key={l.id} onClick={()=>{setSelected(l);setBuyError(null);setBuyOk(false);setView('detail');}}
                  style={{ display:'flex', background:C.card, borderRadius:8, overflow:'hidden', cursor:'pointer' }}>
                  {/* Thumbnail */}
                  <div style={{ width:120, minHeight:120, background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:36 }}>{cat.emoji}</span>
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, padding:'12px 14px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                    <div style={{ color:C.text, fontSize:14, lineHeight:1.3, marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{l.title}</div>
                    <div style={{ color:C.text, fontSize:20, fontWeight:600 }}>{fmtMoney(l.price)}</div>
                    <div style={{ color:C.green, fontSize:12, marginTop:4 }}>Envio grátis</div>
                    <div style={{ color:C.textSec, fontSize:11, marginTop:4 }}>{timeAgo(l.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ height:20 }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

const C = {
  bg: '#000', card: '#1C1C1E', text: '#fff', textSec: '#8E8E93',
  separator: '#2C2C2E', green: '#34C759', orange: '#FF9500', blue: '#0A84FF', red: '#FF3B30',
};

const CATEGORIES = [
  { id: 'veiculos', name: 'Veículos', emoji: '🚗' },
  { id: 'armas', name: 'Armas', emoji: '🔫' },
  { id: 'itens', name: 'Itens', emoji: '📦' },
  { id: 'imoveis', name: 'Imóveis', emoji: '🏠' },
  { id: 'servicos', name: 'Serviços', emoji: '🔧' },
  { id: 'geral', name: 'Geral', emoji: '🏷️' },
];

export default function Marketplace({ onNavigate }) {
  const [view, setView] = useState('list'); // list | detail | create | myAds
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [buyError, setBuyError] = useState(null);
  const [buySuccess, setBuySuccess] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('geral');

  const loadListings = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('market_listings', { category: activeCategory, search: searchQuery || undefined });
    if (res?.listings) setListings(res.listings);
    setLoading(false);
  }, [activeCategory, searchQuery]);

  useEffect(() => { loadListings(); }, [loadListings]);

  usePusherEvent('MARKET_SOLD', useCallback((data) => {
    setListings(prev => prev.filter(l => l.id !== data.listingId));
  }, []));

  const handleCreate = async () => {
    const price = parseFloat(newPrice.replace(',', '.'));
    if (!newTitle.trim()) return;
    if (!price || price <= 0) return;
    const res = await fetchBackend('market_create', {
      title: newTitle, description: newDesc, price, category: newCategory,
    });
    if (res?.ok) {
      setNewTitle(''); setNewDesc(''); setNewPrice(''); setView('list');
      loadListings();
    }
  };

  const handleBuy = async () => {
    if (!selectedListing) return;
    setBuyError(null);
    setBuySuccess(false);
    const res = await fetchBackend('market_buy', { listingId: selectedListing.id });
    if (res?.error) { setBuyError(res.error); return; }
    if (res?.ok) {
      setBuySuccess(true);
      setListings(prev => prev.filter(l => l.id !== selectedListing.id));
    }
  };

  const handleContact = async () => {
    if (!selectedListing) return;
    const res = await fetchBackend('market_contact', { listingId: selectedListing.id });
    if (res?.phone) onNavigate?.('whatsapp', { to: res.phone });
  };

  const handleDelete = async (id) => {
    await fetchBackend('market_delete', { listingId: id });
    setMyListings(prev => prev.filter(l => l.id !== id));
  };

  const loadMyAds = async () => {
    const res = await fetchBackend('market_my_listings');
    if (res?.listings) setMyListings(res.listings);
    setView('myAds');
  };

  const formatMoney = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const timeAgo = (d) => {
    if (!d) return '';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 3600) return `${Math.floor(s/60)}min`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return `${Math.floor(s/86400)}d atrás`;
  };

  // ============================================
  // Detail
  // ============================================
  if (view === 'detail' && selectedListing) {
    const cat = CATEGORIES.find(c => c.id === selectedListing.category) || CATEGORIES[5];
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => { setView('list'); setBuyError(null); setBuySuccess(false); }} style={btnS}>
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>Detalhes</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {/* Image placeholder */}
          <div style={{ background: C.card, borderRadius: 12, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 48 }}>{cat.emoji}</span>
          </div>

          <div style={{ color: C.text, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{selectedListing.title}</div>
          <div style={{ color: C.green, fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{formatMoney(selectedListing.price)}</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span style={{ background: C.card, borderRadius: 12, padding: '4px 10px', color: C.textSec, fontSize: 12 }}>{cat.emoji} {cat.name}</span>
            <span style={{ background: C.card, borderRadius: 12, padding: '4px 10px', color: C.textSec, fontSize: 12 }}>{timeAgo(selectedListing.created_at)}</span>
          </div>

          {selectedListing.description && (
            <div style={{ color: C.text, fontSize: 15, lineHeight: 1.5, marginBottom: 16 }}>{selectedListing.description}</div>
          )}

          <div style={{ color: C.textSec, fontSize: 13, marginBottom: 20 }}>
            Vendedor: {selectedListing.seller_name || selectedListing.seller_phone}
          </div>

          {buySuccess ? (
            <div style={{ background: 'rgba(52,199,89,0.15)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: 32 }}>✅</span>
              <div style={{ color: C.green, fontSize: 16, fontWeight: 600, marginTop: 8 }}>Compra realizada!</div>
            </div>
          ) : (
            <>
              {buyError && (
                <div style={{ background: 'rgba(255,59,48,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                  <span style={{ color: C.red, fontSize: 14 }}>{buyError}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleBuy} style={{
                  flex: 1, padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: C.green, color: '#fff', fontSize: 16, fontWeight: 600,
                }}>Comprar</button>
                <button onClick={handleContact} style={{
                  flex: 1, padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: C.blue, color: '#fff', fontSize: 16, fontWeight: 600,
                }}>Chat</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // Create
  // ============================================
  if (view === 'create') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('list')} style={{ ...btnS, color: C.text, fontSize: 15 }}>Cancelar</button>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>Novo anúncio</span>
          <button onClick={handleCreate} style={{ ...btnS, color: C.green, fontWeight: 600, fontSize: 15 }}>Publicar</button>
        </div>
        <div style={{ flex: 1, padding: '16px 20px', overflow: 'auto' }}>
          <label style={labelStyle}>Título</label>
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Elegy RH8 tunado" style={inputStyle} />

          <label style={labelStyle}>Preço</label>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.textSec }}>R$</span>
            <input type="text" value={newPrice} onChange={e => setNewPrice(e.target.value.replace(/[^0-9,.]/g, ''))} placeholder="0,00" style={{ ...inputStyle, paddingLeft: 42, marginBottom: 0 }} />
          </div>

          <label style={labelStyle}>Categoria</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setNewCategory(cat.id)} style={{
                padding: '10px 6px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'center',
                background: newCategory === cat.id ? C.green : C.card, color: '#fff', fontSize: 12,
              }}>
                <div>{cat.emoji}</div>
                <div style={{ marginTop: 2 }}>{cat.name}</div>
              </button>
            ))}
          </div>

          <label style={labelStyle}>Descrição</label>
          <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descreva o que está vendendo..." style={{ ...inputStyle, minHeight: 80, resize: 'none' }} />
        </div>
      </div>
    );
  }

  // ============================================
  // My Ads
  // ============================================
  if (view === 'myAds') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('list')} style={btnS}>
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>Meus anúncios</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {myListings.length === 0 ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Nenhum anúncio</div>
          ) : myListings.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
              <div style={{ width: 56, height: 56, borderRadius: 8, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 24 }}>{CATEGORIES.find(c => c.id === l.category)?.emoji || '🏷️'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontSize: 14 }}>{l.title}</div>
                <div style={{ color: C.green, fontSize: 14, fontWeight: 600 }}>{formatMoney(l.price)}</div>
                <div style={{ color: l.status === 'sold' ? C.orange : C.textSec, fontSize: 12 }}>{l.status === 'sold' ? 'Vendido' : 'Ativo'}</div>
              </div>
              {l.status !== 'sold' && (
                <button onClick={() => handleDelete(l.id)} style={{ ...btnS, color: C.red, fontSize: 13, fontWeight: 600 }}>Remover</button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================
  // List
  // ============================================
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ color: C.text, fontSize: 20, fontWeight: 700 }}>Marketplace</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={loadMyAds} style={{ ...btnS, color: C.blue, fontSize: 13, fontWeight: 600 }}>Meus</button>
            <button onClick={() => { setNewTitle(''); setNewDesc(''); setNewPrice(''); setNewCategory('geral'); setView('create'); }} style={{ ...btnS, color: C.green, fontSize: 13, fontWeight: 600 }}>+ Vender</button>
          </div>
        </div>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: C.card, borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
          <input type="text" placeholder="Buscar..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadListings()}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 14, fontFamily: 'inherit' }} />
        </div>
        {/* Categories */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          <button onClick={() => setActiveCategory(null)} style={{
            padding: '4px 12px', borderRadius: 14, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: !activeCategory ? C.green : C.card, color: '#fff', fontSize: 12,
          }}>Todos</button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              padding: '4px 12px', borderRadius: 14, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: activeCategory === cat.id ? C.green : C.card, color: '#fff', fontSize: 12, whiteSpace: 'nowrap',
            }}>{cat.emoji} {cat.name}</button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
        {loading ? (
          <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Carregando...</div>
        ) : listings.length === 0 ? (
          <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Nenhum anúncio encontrado</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {listings.map(l => {
              const cat = CATEGORIES.find(c => c.id === l.category) || CATEGORIES[5];
              return (
                <div key={l.id} onClick={() => { setSelectedListing(l); setBuyError(null); setBuySuccess(false); setView('detail'); }}
                  style={{ background: C.card, borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '4/3', background: '#2C2C2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 32 }}>{cat.emoji}</span>
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                    <div style={{ color: C.green, fontSize: 14, fontWeight: 700, marginTop: 2 }}>{formatMoney(l.price)}</div>
                    <div style={{ color: C.textSec, fontSize: 11, marginTop: 2 }}>{timeAgo(l.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

const btnS = { background: 'none', border: 'none', cursor: 'pointer', padding: 0 };
const labelStyle = { color: '#8E8E93', fontSize: 13, display: 'block', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '12px 14px', background: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: 8, color: '#fff', fontSize: 15, fontFamily: 'inherit', outline: 'none', marginBottom: 14, boxSizing: 'border-box' };

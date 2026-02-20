import { useState, useEffect, useCallback } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

const C = {
  bg:'#0A0A0A', surface:'#161616', elevated:'#1E1E1E', card:'#1C1C1C',
  text:'#FFFFFF', textSec:'#A0A0A0', textTer:'#666',
  sep:'#222', red:'#EA1D2C', redDark:'#C8101E', green:'#50A773',
  accent:'#EA1D2C', input:'#1A1A1A', gold:'#FFB800', yellow:'#FFBA00',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };
const fmtMoney = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

const Ic = {
  back: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={C.textTer} strokeWidth="2"/><path d="M21 21l-4-4" stroke={C.textTer} strokeWidth="2" strokeLinecap="round"/></svg>,
  star: <svg width="12" height="12" viewBox="0 0 24 24" fill={C.gold}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  clock: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textSec} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  loc: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  bag: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>,
  minus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

const categories = [
  {id:'all',emoji:'🔥',label:'Destaques'},
  {id:'burger',emoji:'🍔',label:'Hambúrguer'},
  {id:'pizza',emoji:'🍕',label:'Pizza'},
  {id:'frango',emoji:'🍗',label:'Frango'},
  {id:'mexicano',emoji:'🌮',label:'Mexicano'},
  {id:'cafe',emoji:'☕',label:'Café'},
  {id:'japonesa',emoji:'🍣',label:'Japonesa'},
  {id:'doces',emoji:'🍰',label:'Doces'},
];

export default function IFood({ onNavigate }) {
  const [view, setView] = useState('home');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await fetchBackend('ifood_init');
      if (r?.restaurants) setRestaurants(r.restaurants);
      if (r?.orders) setOrders(r.orders);
      setLoading(false);
    };
    load();
  }, []);

  usePusherEvent('IFOOD_STATUS', useCallback((d) => {
    if (order?.id === d.orderId) setOrder(prev => ({ ...prev, status: d.status }));
  }, [order]));

  const addToCart = (item) => {
    const key = `${selectedRest.id}_${item.id}`;
    const ex = cart.find(c => c._key === key);
    if (ex) setCart(cart.map(c => c._key === key ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { ...item, _key: key, restId: selectedRest.id, qty: 1 }]);
  };

  const removeFromCart = (key) => {
    const ex = cart.find(c => c._key === key);
    if (ex && ex.qty > 1) setCart(cart.map(c => c._key === key ? { ...c, qty: c.qty - 1 } : c));
    else setCart(cart.filter(c => c._key !== key));
  };

  const cartQty = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0) + (selectedRest?.fee || 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const r = await fetchBackend('ifood_order', {
      restaurant: selectedRest.name, items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
      total: cartTotal, fee: selectedRest.fee,
    });
    if (r?.ok) { setOrder({ id: r.orderId, restaurant: selectedRest.name, emoji: selectedRest.emoji, total: cartTotal, status: 'preparing', items: cart }); setCart([]); setView('tracking'); }
    if (r?.error) alert(r.error);
  };

  const filtered = restaurants.filter(r => {
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q);
    }
    if (activeCat !== 'all') return r.category?.toLowerCase().includes(activeCat);
    return true;
  });

  // ===== ORDER TRACKING =====
  if (view === 'tracking' && order) {
    const steps = [
      { s:'confirmed', label:'Pedido confirmado', emoji:'✅', sub:'O restaurante recebeu seu pedido' },
      { s:'preparing', label:'Preparando', emoji:'👨‍🍳', sub:'O restaurante está preparando' },
      { s:'delivering', label:'Saiu para entrega', emoji:'🛵', sub:'Entregador a caminho' },
      { s:'delivered', label:'Entregue', emoji:'🎉', sub:'Bom apetite!' },
    ];
    const currentStep = steps.findIndex(st => st.s === order.status);
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:C.surface }}>
          <button onClick={() => { setOrder(null); setView('home'); }} style={B}>{Ic.back}</button>
          <span style={{ color:C.text, fontSize:18, fontWeight:700, flex:1 }}>Acompanhar pedido</span>
        </div>

        {/* Restaurant card */}
        <div style={{ margin:'16px 16px 0', background:C.surface, borderRadius:16, padding:16, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:12, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{order.emoji || '🍽️'}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:C.text, fontSize:17, fontWeight:700 }}>{order.restaurant}</div>
            <div style={{ color:C.green, fontSize:15, fontWeight:600 }}>{fmtMoney(order.total)}</div>
          </div>
        </div>

        {/* ETA */}
        <div style={{ margin:'12px 16px', background:C.red, borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
          <div style={{ color:'#fff', fontSize:14, fontWeight:600 }}>Previsão de entrega</div>
          <div style={{ color:'#fff', fontSize:24, fontWeight:800, marginTop:2 }}>25-35 min</div>
        </div>

        {/* Progress steps */}
        <div style={{ flex:1, padding:'8px 16px', overflow:'auto' }}>
          {steps.map((st, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={st.s} style={{ display:'flex', gap:14, position:'relative' }}>
                {/* Line */}
                {i < steps.length - 1 && (
                  <div style={{ position:'absolute', left:17, top:36, width:2, height:'calc(100% - 24px)', background: i < currentStep ? C.green : C.sep }} />
                )}
                {/* Circle */}
                <div style={{
                  width:36, height:36, borderRadius:18, flexShrink:0, zIndex:1,
                  background: done ? C.green : C.elevated, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:16, border: active ? `2px solid ${C.green}` : 'none',
                  boxShadow: active ? `0 0 12px ${C.green}44` : 'none',
                }}>{done ? st.emoji : <span style={{ color:C.textTer, fontSize:12 }}>{i + 1}</span>}</div>
                {/* Text */}
                <div style={{ paddingBottom:20 }}>
                  <div style={{ color: done ? C.text : C.textTer, fontSize:15, fontWeight: active ? 700 : 400, lineHeight:1.2 }}>{st.label}</div>
                  <div style={{ color: done ? C.textSec : C.textTer, fontSize:12, marginTop:2 }}>{st.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Items summary */}
        <div style={{ padding:'12px 16px 16px', borderTop:`1px solid ${C.sep}` }}>
          <div style={{ color:C.textSec, fontSize:13 }}>
            {order.items?.map(c => `${c.qty}x ${c.name}`).join(' · ')}
          </div>
        </div>
      </div>
    );
  }

  // ===== RESTAURANT MENU =====
  if (view === 'menu' && selectedRest) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header with gradient */}
      <div style={{ background:`linear-gradient(180deg, ${C.red}CC 0%, ${C.bg} 100%)`, padding:'12px 16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <button onClick={() => { setView('home'); setCart([]); }} style={B}>{Ic.back}</button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:64, height:64, borderRadius:16, background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, flexShrink:0, boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }}>
            {selectedRest.emoji}
          </div>
          <div>
            <div style={{ color:C.text, fontSize:20, fontWeight:800 }}>{selectedRest.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4, flexWrap:'wrap' }}>
              <span style={{ display:'flex', alignItems:'center', gap:3 }}>{Ic.star}<span style={{ color:C.gold, fontSize:13, fontWeight:600 }}>{selectedRest.rating}</span></span>
              <span style={{ color:C.textTer }}>•</span>
              <span style={{ display:'flex', alignItems:'center', gap:3 }}>{Ic.clock}<span style={{ color:C.textSec, fontSize:13 }}>{selectedRest.time} min</span></span>
              <span style={{ color:C.textTer }}>•</span>
              <span style={{ color:C.textSec, fontSize:13 }}>Taxa {fmtMoney(selectedRest.fee)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding:'8px 16px 4px' }}>
        <div style={{ color:C.text, fontSize:17, fontWeight:700 }}>Cardápio</div>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'0 16px', paddingBottom: cart.length > 0 ? 80 : 16 }}>
        {(selectedRest.menu || []).map(item => {
          const key = `${selectedRest.id}_${item.id}`;
          const inCart = cart.find(c => c._key === key);
          return (
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 0', borderBottom:`0.5px solid ${C.sep}` }}>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{item.name}</div>
                {item.desc && <div style={{ color:C.textTer, fontSize:12, marginTop:2, lineHeight:1.3 }}>{item.desc}</div>}
                <div style={{ color:C.text, fontSize:15, fontWeight:700, marginTop:4 }}>{fmtMoney(item.price)}</div>
              </div>
              {/* Qty controls */}
              {inCart ? (
                <div style={{ display:'flex', alignItems:'center', gap:0, background:C.surface, borderRadius:8, overflow:'hidden' }}>
                  <button onClick={() => removeFromCart(key)} style={{ ...B, width:32, height:32, background:C.red }}>{Ic.minus}</button>
                  <span style={{ color:C.text, fontSize:15, fontWeight:700, width:28, textAlign:'center' }}>{inCart.qty}</span>
                  <button onClick={() => addToCart(item)} style={{ ...B, width:32, height:32, background:C.surface, border:`1px solid ${C.red}` }}>{Ic.plus}</button>
                </div>
              ) : (
                <button onClick={() => addToCart(item)} style={{
                  padding:'8px 16px', borderRadius:8, border:`1.5px solid ${C.red}`, background:'transparent',
                  color:C.red, fontSize:13, fontWeight:700, cursor:'pointer',
                }}>Adicionar</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Cart footer */}
      {cart.length > 0 && (
        <div style={{ padding:'10px 16px 14px', background:C.surface, borderTop:`1px solid ${C.sep}` }}>
          <button onClick={placeOrder} style={{
            width:'100%', padding:'14px', borderRadius:12, border:'none', cursor:'pointer',
            background:C.red, color:'#fff', fontSize:16, fontWeight:700,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            boxShadow:'0 4px 12px rgba(234,29,44,0.3)',
          }}>
            <span style={{ display:'flex', alignItems:'center', gap:8 }}>{Ic.bag} Ver sacola · {cartQty} {cartQty===1?'item':'itens'}</span>
            <span>{fmtMoney(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );

  // ===== HOME =====
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'12px 16px 8px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ color:C.red, fontSize:26, fontWeight:900, letterSpacing:-0.5 }}>iFood</div>
          </div>
          {orders.length > 0 && (
            <button style={{ ...B, padding:'6px 12px', background:C.surface, borderRadius:8, gap:6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={C.red}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" fill="none" stroke={C.red} strokeWidth="2"/></svg>
              <span style={{ color:C.text, fontSize:12, fontWeight:600 }}>Pedidos</span>
            </button>
          )}
        </div>

        {/* Address bar */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
          {Ic.loc}
          <span style={{ color:C.text, fontSize:14, fontWeight:500 }}>Endereço de entrega</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={C.textSec} strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>

        {/* Search */}
        <div style={{ display:'flex', alignItems:'center', background:C.input, borderRadius:12, padding:'10px 14px', gap:8, border:`1px solid ${C.sep}` }}>
          {Ic.search}
          <input type="text" placeholder="Buscar restaurante ou prato..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:14, fontFamily:'inherit' }} />
        </div>
      </div>

      {/* Categories carousel */}
      <div style={{ display:'flex', gap:8, padding:'4px 16px 12px', overflow:'auto', scrollbarWidth:'none' }}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            padding:'8px 12px', borderRadius:12, border:'none', cursor:'pointer', minWidth:64, flexShrink:0,
            background: activeCat === cat.id ? C.red + '18' : 'transparent',
          }}>
            <span style={{ fontSize:24 }}>{cat.emoji}</span>
            <span style={{
              color: activeCat === cat.id ? C.red : C.textSec, fontSize:11, fontWeight:500, whiteSpace:'nowrap',
            }}>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Promo banner */}
      {!searchQ.trim() && (
        <div style={{ margin:'0 16px 12px', background:'linear-gradient(135deg, #EA1D2C, #FF6B35)', borderRadius:14, padding:'16px 18px', position:'relative', overflow:'hidden' }}>
          <div style={{ color:'#fff', fontSize:20, fontWeight:800, lineHeight:1.2 }}>Frete grátis</div>
          <div style={{ color:'rgba(255,255,255,0.85)', fontSize:13, marginTop:4 }}>em pedidos acima de R$ 30</div>
          <span style={{ position:'absolute', right:12, bottom:-8, fontSize:48, opacity:0.2 }}>🛵</span>
        </div>
      )}

      {/* Restaurant list */}
      <div style={{ flex:1, overflow:'auto', padding:'0 16px' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
            <div style={{ width:24, height:24, border:`2px solid ${C.sep}`, borderTopColor:C.red, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:C.textSec }}>
            <div style={{ fontSize:48, marginBottom:8 }}>🔍</div>
            <div style={{ fontSize:15, fontWeight:500, color:C.text }}>Nenhum restaurante encontrado</div>
            <div style={{ fontSize:13, marginTop:4 }}>Tente buscar outra coisa</div>
          </div>
        ) : filtered.map(r => (
          <div key={r.id} onClick={() => { setSelectedRest(r); setCart([]); setView('menu'); }}
            style={{ display:'flex', gap:14, padding:'14px 0', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
            <div style={{
              width:64, height:64, borderRadius:14, background:C.elevated,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, flexShrink:0,
              boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
            }}>{r.emoji}</div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ color:C.text, fontSize:16, fontWeight:600 }}>{r.name}</div>
              <div style={{ color:C.textSec, fontSize:13, marginTop:1 }}>{r.category}</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                <span style={{ display:'flex', alignItems:'center', gap:3 }}>{Ic.star}<span style={{ color:C.gold, fontSize:12, fontWeight:600 }}>{r.rating}</span></span>
                <span style={{ color:C.sep }}>•</span>
                <span style={{ color:C.textSec, fontSize:12 }}>{r.time} min</span>
                <span style={{ color:C.sep }}>•</span>
                <span style={{ color: r.fee === 0 ? C.green : C.textSec, fontSize:12, fontWeight: r.fee === 0 ? 600 : 400 }}>
                  {r.fee === 0 ? 'Grátis' : fmtMoney(r.fee)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

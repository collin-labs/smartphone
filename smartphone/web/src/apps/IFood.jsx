import { useState, useEffect, useCallback } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

const C = {
  bg:'#0A0A0A', surface:'#1A1A1A', elevated:'#242424',
  text:'#FFFFFF', textSec:'#A0A0A0', textTer:'#666',
  sep:'#2A2A2A', red:'#EA1D2C', green:'#50A773',
  accent:'#EA1D2C', input:'#1E1E1E', gold:'#FFB800',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };
const fmtMoney = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

const RESTAURANTS = [
  { id:1, name:'Burger Shot', emoji:'🍔', category:'Hambúrguer', rating:4.5, time:'20-30', fee:5,
    menu:[{id:1,name:'Burger Clássico',price:25},{id:2,name:'Cheese Bacon',price:32},{id:3,name:'Combo Família',price:55},{id:4,name:'Batata Frita',price:12},{id:5,name:'Milkshake',price:15}] },
  { id:2, name:'Pizza This', emoji:'🍕', category:'Pizza', rating:4.7, time:'30-45', fee:7,
    menu:[{id:1,name:'Margherita',price:35},{id:2,name:'Calabresa',price:38},{id:3,name:'4 Queijos',price:42},{id:4,name:'Pepperoni',price:40},{id:5,name:'Refri 2L',price:10}] },
  { id:3, name:'Cluckin Bell', emoji:'🍗', category:'Frango', rating:4.2, time:'15-25', fee:4,
    menu:[{id:1,name:'Balde de Frango',price:45},{id:2,name:'Frango Grelhado',price:28},{id:3,name:'Wings 12un',price:30},{id:4,name:'Combo Kids',price:20}] },
  { id:4, name:'Taco Bomb', emoji:'🌮', category:'Mexicano', rating:4.0, time:'20-30', fee:6,
    menu:[{id:1,name:'Tacos (3un)',price:22},{id:2,name:'Burrito',price:28},{id:3,name:'Nachos',price:18},{id:4,name:'Quesadilla',price:25}] },
  { id:5, name:'Bean Machine', emoji:'☕', category:'Café', rating:4.8, time:'10-15', fee:3,
    menu:[{id:1,name:'Espresso',price:8},{id:2,name:'Cappuccino',price:12},{id:3,name:'Latte',price:14},{id:4,name:'Brownie',price:10},{id:5,name:'Croissant',price:9}] },
];

export default function IFood({ onNavigate }) {
  const [view, setView] = useState('home');
  const [selectedRest, setSelectedRest] = useState(null);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchBackend('ifood_init').then(r => { if(r?.orders) setOrders(r.orders); });
  }, []);

  usePusherEvent('IFOOD_STATUS', useCallback((d) => {
    if (order?.id === d.orderId) setOrder(prev => ({ ...prev, status: d.status }));
  }, [order]));

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id && c.restId === selectedRest.id);
    if (existing) setCart(cart.map(c => c.id===item.id&&c.restId===selectedRest.id ? {...c,qty:c.qty+1} : c));
    else setCart([...cart, { ...item, restId: selectedRest.id, qty: 1 }]);
  };

  const cartTotal = cart.reduce((s,c) => s + c.price * c.qty, 0) + (selectedRest?.fee || 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const r = await fetchBackend('ifood_order', {
      restaurant: selectedRest.name, items: cart.map(c=>({name:c.name,qty:c.qty,price:c.price})),
      total: cartTotal, fee: selectedRest.fee,
    });
    if (r?.ok) { setOrder({ id: r.orderId, restaurant: selectedRest.name, total: cartTotal, status: 'preparing', items: cart }); setCart([]); setView('tracking'); }
    if (r?.error) alert(r.error);
  };

  const filtered = searchQ.trim() ? RESTAURANTS.filter(r=>r.name.toLowerCase().includes(searchQ.toLowerCase())||r.category.toLowerCase().includes(searchQ.toLowerCase())) : RESTAURANTS;

  // TRACKING
  if (view === 'tracking' && order) {
    const steps = ['confirmed','preparing','delivering','delivered'];
    const currentStep = steps.indexOf(order.status);
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
          <button onClick={()=>{setOrder(null);setView('home');}} style={B}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Acompanhar pedido</span>
        </div>
        <div style={{ flex:1, padding:16 }}>
          <div style={{ background:C.surface, borderRadius:14, padding:16, marginBottom:16 }}>
            <div style={{ color:C.text, fontSize:18, fontWeight:700, marginBottom:4 }}>{order.restaurant}</div>
            <div style={{ color:C.green, fontSize:14, fontWeight:600 }}>{fmtMoney(order.total)}</div>
          </div>
          {/* Progress */}
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {[{s:'confirmed',label:'Pedido confirmado',emoji:'✅'},{s:'preparing',label:'Preparando',emoji:'👨‍🍳'},{s:'delivering',label:'Saiu para entrega',emoji:'🛵'},{s:'delivered',label:'Entregue',emoji:'🎉'}].map((st,i) => (
              <div key={st.s} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 0', borderBottom:i<3?`0.5px solid ${C.sep}`:'none' }}>
                <div style={{
                  width:36, height:36, borderRadius:18,
                  background: i <= currentStep ? C.green : C.elevated,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                }}>{i <= currentStep ? st.emoji : '⏳'}</div>
                <span style={{ color: i <= currentStep ? C.text : C.textTer, fontSize:15, fontWeight: i===currentStep ? 600 : 400 }}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RESTAURANT MENU
  if (view === 'menu' && selectedRest) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={()=>{setView('home');setCart([]);}} style={B}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <div style={{ color:C.text, fontSize:18, fontWeight:700 }}>{selectedRest.emoji} {selectedRest.name}</div>
          <div style={{ color:C.textSec, fontSize:12 }}>⭐ {selectedRest.rating} • {selectedRest.time} min • Taxa {fmtMoney(selectedRest.fee)}</div>
        </div>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'0 16px' }}>
        {selectedRest.menu.map(item => {
          const inCart = cart.find(c=>c.id===item.id&&c.restId===selectedRest.id);
          return (
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`0.5px solid ${C.sep}` }}>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{item.name}</div>
                <div style={{ color:C.green, fontSize:14, fontWeight:600 }}>{fmtMoney(item.price)}</div>
              </div>
              <button onClick={()=>addToCart(item)} style={{
                padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer',
                background: inCart ? C.green : C.red, color:'#fff', fontSize:13, fontWeight:600,
              }}>{inCart ? `${inCart.qty}x` : 'Adicionar'}</button>
            </div>
          );
        })}
      </div>
      {cart.length > 0 && (
        <div style={{ padding:'12px 16px 16px' }}>
          <button onClick={placeOrder} style={{
            width:'100%', padding:'16px', borderRadius:12, border:'none', cursor:'pointer',
            background:C.red, color:'#fff', fontSize:16, fontWeight:700,
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span>Fazer pedido ({cart.reduce((s,c)=>s+c.qty,0)} itens)</span>
            <span>{fmtMoney(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );

  // HOME
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'14px 16px' }}>
        <div style={{ color:C.red, fontSize:24, fontWeight:900, marginBottom:10 }}>iFood</div>
        <div style={{ display:'flex', alignItems:'center', background:C.input, borderRadius:24, padding:'10px 16px', gap:8, border:`1px solid ${C.sep}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={C.textTer}><circle cx="11" cy="11" r="7" fill="none" stroke={C.textTer} strokeWidth="2"/><path d="M21 21l-4-4" stroke={C.textTer} strokeWidth="2"/></svg>
          <input type="text" placeholder="Buscar restaurante..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:15, fontFamily:'inherit' }} />
        </div>
      </div>
      {/* Categories */}
      <div style={{ display:'flex', gap:12, padding:'0 16px 12px', overflow:'auto' }}>
        {['🍔 Hambúrguer','🍕 Pizza','🍗 Frango','🌮 Mexicano','☕ Café'].map(c => (
          <button key={c} style={{ padding:'8px 14px', borderRadius:16, border:'none', cursor:'pointer', background:C.elevated, color:C.text, fontSize:12, whiteSpace:'nowrap', flexShrink:0 }}>{c}</button>
        ))}
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'0 16px' }}>
        {filtered.map(r => (
          <div key={r.id} onClick={()=>{setSelectedRest(r);setCart([]);setView('menu');}}
            style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
            <div style={{ width:56, height:56, borderRadius:12, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>{r.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ color:C.text, fontSize:16, fontWeight:600 }}>{r.name}</div>
              <div style={{ color:C.textSec, fontSize:13 }}>{r.category}</div>
              <div style={{ display:'flex', gap:8, marginTop:2 }}>
                <span style={{ color:C.gold, fontSize:12 }}>⭐ {r.rating}</span>
                <span style={{ color:C.textTer, fontSize:12 }}>{r.time} min</span>
                <span style={{ color:C.green, fontSize:12 }}>Taxa {fmtMoney(r.fee)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

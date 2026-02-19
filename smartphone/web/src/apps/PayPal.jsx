import { useState, useEffect, useCallback } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';

// PayPal real dark mode colors
const C = {
  bg:'#0A0A0A', surface:'#1A1A1A', elevated:'#242424',
  text:'#FFFFFF', textSec:'#A0A0A0', textTer:'#666666',
  sep:'#2A2A2A', blue:'#0070BA', blueLight:'#009CDE',
  accent:'#0070BA', input:'#1E1E1E',
  success:'#06C167', error:'#FF453A',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };
const fmtMoney = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
const timeAgo = (d) => { if(!d)return''; const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return'agora'; if(s<3600)return`${Math.floor(s/60)}min`; if(s<86400)return`${Math.floor(s/3600)}h`; return new Date(d).toLocaleDateString('pt-BR'); };

export default function PayPal({ onNavigate }) {
  const [view, setView] = useState('home');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchBackend('paypal_init').then(r => {
      if (r?.balance !== undefined) setBalance(r.balance);
      if (r?.transactions) setTransactions(r.transactions);
      setLoading(false);
    });
  }, []);

  const send = async () => {
    if (!to.trim() || !amount || Number(amount) <= 0) return;
    setSending(true);
    const r = await fetchBackend('paypal_send', { to: to.trim(), amount: Number(amount), note: note.trim() });
    setSending(false);
    if (r?.ok) {
      setBalance(r.newBalance);
      setReceipt({ to: to.trim(), amount: Number(amount), note: note.trim(), date: new Date().toISOString() });
      setView('receipt');
      setTo(''); setAmount(''); setNote('');
    }
    if (r?.error) alert(r.error);
  };

  // RECEIPT
  if (view === 'receipt' && receipt) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg, justifyContent:'center', alignItems:'center', padding:24 }}>
      <div style={{ width:56, height:56, borderRadius:28, background:C.success, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      </div>
      <div style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:4 }}>Enviado!</div>
      <div style={{ color:C.success, fontSize:32, fontWeight:700, marginBottom:8 }}>{fmtMoney(receipt.amount)}</div>
      <div style={{ color:C.textSec, fontSize:15, marginBottom:4 }}>para {receipt.to}</div>
      {receipt.note && <div style={{ color:C.textTer, fontSize:13, marginBottom:20 }}>"{receipt.note}"</div>}
      <button onClick={()=>{setReceipt(null);setView('home');fetchBackend('paypal_init').then(r=>{if(r?.transactions)setTransactions(r.transactions);});}}
        style={{ padding:'14px 40px', borderRadius:24, border:'none', cursor:'pointer', background:C.blue, color:'#fff', fontSize:16, fontWeight:600 }}>Concluir</button>
    </div>
  );

  // SEND
  if (view === 'send') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>setView('home')} style={B}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Enviar dinheiro</span>
      </div>
      <div style={{ flex:1, padding:16 }}>
        <div style={{ marginBottom:16 }}>
          <label style={{ color:C.textSec, fontSize:13, marginBottom:4, display:'block' }}>Número do destinatário</label>
          <input type="text" placeholder="000-000" value={to} onChange={e=>setTo(e.target.value)}
            style={{ width:'100%', background:C.surface, border:'none', outline:'none', color:C.text, fontSize:16, padding:'14px', borderRadius:8, fontFamily:'inherit' }} />
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ color:C.textSec, fontSize:13, marginBottom:4, display:'block' }}>Valor</label>
          <div style={{ display:'flex', alignItems:'center', background:C.surface, borderRadius:8, padding:'14px' }}>
            <span style={{ color:C.textSec, fontSize:16, marginRight:4 }}>R$</span>
            <input type="number" placeholder="0,00" value={amount} onChange={e=>setAmount(e.target.value)}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:24, fontWeight:700, fontFamily:'inherit' }} />
          </div>
          <div style={{ color:C.textTer, fontSize:12, marginTop:4 }}>Saldo disponível: {fmtMoney(balance)}</div>
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ color:C.textSec, fontSize:13, marginBottom:4, display:'block' }}>Nota (opcional)</label>
          <input type="text" placeholder="Ex: Aluguel, pagamento..." value={note} onChange={e=>setNote(e.target.value)}
            style={{ width:'100%', background:C.surface, border:'none', outline:'none', color:C.text, fontSize:15, padding:'14px', borderRadius:8, fontFamily:'inherit' }} />
        </div>
        <button onClick={send} disabled={sending||!to.trim()||!amount||Number(amount)<=0} style={{
          width:'100%', padding:'16px', borderRadius:24, border:'none', cursor:'pointer',
          background:(sending||!to.trim()||!amount)?C.elevated:C.blue, color:'#fff', fontSize:16, fontWeight:600,
          opacity:(sending||!to.trim()||!amount)?0.5:1,
        }}>{sending ? 'Enviando...' : `Enviar ${amount ? fmtMoney(Number(amount)) : ''}`}</button>
      </div>
    </div>
  );

  // HOME
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'16px', background:`linear-gradient(135deg, ${C.blue}, ${C.blueLight})`, borderRadius:'0 0 24px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:16 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M19.5 6.5h-3V5c0-1.1-.9-2-2-2h-5c-1.1 0-2 .9-2 2v1.5h-3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2zm-9.5-1.5h4v1.5h-4V5z"/></svg>
          <span style={{ color:'#fff', fontSize:22, fontWeight:700, marginLeft:8 }}>PayPal</span>
        </div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:14, marginBottom:4 }}>Seu saldo</div>
        <div style={{ color:'#fff', fontSize:34, fontWeight:700 }}>{loading?'...':fmtMoney(balance)}</div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:12, padding:'16px', marginTop:-12 }}>
        <button onClick={()=>setView('send')} style={{
          flex:1, padding:'14px', borderRadius:12, border:'none', cursor:'pointer',
          background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={C.blue}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          <span style={{ color:C.text, fontSize:15, fontWeight:500 }}>Enviar</span>
        </button>
        <button style={{
          flex:1, padding:'14px', borderRadius:12, border:'none', cursor:'pointer',
          background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={C.blue}><path d="M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z"/></svg>
          <span style={{ color:C.text, fontSize:15, fontWeight:500 }}>Solicitar</span>
        </button>
      </div>

      {/* Transactions */}
      <div style={{ flex:1, overflow:'auto', padding:'0 16px' }}>
        <div style={{ color:C.textSec, fontSize:13, fontWeight:600, marginBottom:8 }}>Atividade recente</div>
        {transactions.length === 0 ? (
          <div style={{ textAlign:'center', padding:30, color:C.textTer }}>Nenhuma transação</div>
        ) : transactions.map(t => (
          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`0.5px solid ${C.sep}` }}>
            <div style={{
              width:40, height:40, borderRadius:20,
              background: t.type === 'sent' ? C.error+'22' : C.success+'22',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontSize:16 }}>{t.type === 'sent' ? '↗️' : '↙️'}</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{t.other_name || t.other_phone || '???'}</div>
              <div style={{ color:C.textTer, fontSize:12 }}>{timeAgo(t.created_at)}{t.note ? ` • ${t.note}`:''}</div>
            </div>
            <span style={{ color: t.type==='sent' ? C.error : C.success, fontSize:15, fontWeight:600 }}>
              {t.type==='sent'?'-':'+'}{fmtMoney(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

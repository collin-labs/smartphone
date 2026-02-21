import { useState, useEffect } from 'react';
import { fetchBackend } from '../hooks/useNui';

const C = {
  bg:'#0A1628', surface:'#122240', elevated:'#1A3058', card:'#0D1D35',
  text:'#FFFFFF', textSec:'#7A9CC6', textTer:'#4A6A8F',
  sep:'#1E3A5F', green:'#00D68F', red:'#FF6B6B',
  accent:'#00D68F', gold:'#FFD700', blue:'#3B82F6',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };
const fmtMoney = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

const Ic = {
  back: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  send: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.accent}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  pix: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  qr: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="21" y2="21"/></svg>,
};

export default function FleecaBank({ onNavigate }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [view, setView] = useState('home');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myPhone, setMyPhone] = useState('');

  useEffect(() => {
    fetchBackend('bank_init').then(r => {
      if (r?.balance !== undefined) setBalance(r.balance);
      if (r?.transactions) setTransactions(r.transactions);
      if (r?.phone) setMyPhone(r.phone);
      setLoading(false);
    });
  }, []);

  const send = async () => {
    if (!to.trim() || !amount || Number(amount) <= 0) return;
    setSending(true);
    const r = await fetchBackend('bank_transfer', { to: to.trim(), amount: Number(amount), description: 'Transferência Fleeca' });
    setSending(false);
    if (r?.ok) {
      setBalance(r.newBalance); setSuccess(true);
      setTimeout(() => { setSuccess(false); setTo(''); setAmount(''); setView('home');
        fetchBackend('bank_init').then(r => { if(r?.transactions) setTransactions(r.transactions); });
      }, 2000);
    }
    if (r?.error) alert(r.error);
  };

  // SUCCESS
  if (success) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg, justifyContent:'center', alignItems:'center' }}>
      <div style={{ width:64, height:64, borderRadius:32, background:C.green, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, animation:'pop 0.3s ease' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      </div>
      <div style={{ color:C.text, fontSize:20, fontWeight:700 }}>Transferência enviada!</div>
      <div style={{ color:C.green, fontSize:28, fontWeight:700, marginTop:8 }}>{fmtMoney(Number(amount))}</div>
      <div style={{ color:C.textSec, fontSize:14, marginTop:4 }}>para {to}</div>
    </div>
  );

  // TRANSFER
  if (view === 'transfer') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:C.surface }}>
        <button onClick={() => setView('home')} style={B}>{Ic.back}</button>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Transferir</span>
      </div>
      <div style={{ flex:1, padding:16 }}>
        <div style={{ marginBottom:16 }}>
          <label style={{ color:C.textSec, fontSize:13, marginBottom:6, display:'block' }}>Conta destino (telefone)</label>
          <input type="text" placeholder="000-0000" value={to} onChange={e => setTo(e.target.value)}
            style={{ width:'100%', background:C.surface, border:`1.5px solid ${C.sep}`, borderRadius:12, padding:'14px 16px', color:C.text, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ color:C.textSec, fontSize:13, marginBottom:6, display:'block' }}>Valor</label>
          <div style={{ display:'flex', alignItems:'center', background:C.surface, border:`1.5px solid ${C.sep}`, borderRadius:12, padding:'14px 16px' }}>
            <span style={{ color:C.textSec, fontSize:18, marginRight:6 }}>R$</span>
            <input type="number" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:28, fontWeight:700, fontFamily:'inherit' }} />
          </div>
          <div style={{ color:C.textTer, fontSize:12, marginTop:6, display:'flex', justifyContent:'space-between' }}>
            <span>Saldo: {fmtMoney(balance)}</span>
            {amount && Number(amount) > balance && <span style={{ color:C.red }}>Saldo insuficiente</span>}
          </div>
        </div>
        <button onClick={send} disabled={sending || !to.trim() || !amount || Number(amount) <= 0 || Number(amount) > balance} style={{
          width:'100%', padding:'16px', borderRadius:12, border:'none', cursor:'pointer',
          background: C.accent, color:'#000', fontSize:16, fontWeight:700,
          opacity: (sending || !to.trim() || !amount || Number(amount) <= 0) ? 0.4 : 1,
          boxShadow: `0 4px 12px ${C.accent}33`,
        }}>{sending ? 'Processando...' : 'Confirmar transferência'}</button>
      </div>
    </div>
  );

  // HOME
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Card header */}
      <div style={{ padding:'16px 16px 24px', background:'linear-gradient(135deg, #0D2847 0%, #163A60 50%, #0A1E3D 100%)', position:'relative', overflow:'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:60, background:'rgba(0,214,143,0.06)' }} />
        <div style={{ position:'absolute', bottom:-20, left:-20, width:80, height:80, borderRadius:40, background:'rgba(59,130,246,0.06)' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${C.accent}, #00A870)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#000', fontSize:18, fontWeight:900 }}>F</span>
            </div>
            <span style={{ color:'#fff', fontSize:20, fontWeight:700 }}>Fleeca</span>
          </div>
          <button style={{...B, padding:8}}>{Ic.qr}</button>
        </div>

        {/* Balance card */}
        <div style={{
          background:'rgba(255,255,255,0.04)', borderRadius:16, padding:'18px 20px',
          border:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(8px)',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:500 }}>Saldo disponível</span>
            <button onClick={() => setShowBalance(!showBalance)} style={{...B, padding:4}}>
              {showBalance ? Ic.eye : Ic.eyeOff}
            </button>
          </div>
          <div style={{ color:'#fff', fontSize:32, fontWeight:700, letterSpacing:-0.5 }}>
            {loading ? <span style={{ opacity:0.3 }}>Carregando...</span> : showBalance ? fmtMoney(balance) : 'R$ ••••••'}
          </div>
          {myPhone && <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginTop:6 }}>Conta: {myPhone}</div>}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:'flex', gap:10, padding:'0 16px', marginTop:-12, position:'relative', zIndex:1 }}>
        {[
          { label:'Transferir', icon:Ic.send, action:() => setView('transfer') },
          { label:'PIX', icon:Ic.pix, action:() => setView('transfer') },
          { label:'Extrato', icon:Ic.chart, action:() => {} },
        ].map(a => (
          <button key={a.label} onClick={a.action} style={{
            flex:1, padding:'14px 8px', borderRadius:14, border:'none', cursor:'pointer',
            background:C.surface, display:'flex', flexDirection:'column', alignItems:'center', gap:6,
            boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {a.icon}
            <span style={{ color:C.text, fontSize:12, fontWeight:500 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Transactions */}
      <div style={{ flex:1, overflow:'auto', padding:'20px 16px 16px' }}>
        <div style={{ color:C.textSec, fontSize:13, fontWeight:600, marginBottom:10 }}>Últimas transações</div>
        {transactions.length === 0 ? (
          <div style={{ textAlign:'center', padding:30 }}>
            <div style={{ fontSize:36, marginBottom:8, opacity:0.4 }}>📊</div>
            <div style={{ color:C.textTer, fontSize:14 }}>Nenhuma transação ainda</div>
          </div>
        ) : transactions.map(t => (
          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`0.5px solid ${C.sep}08` }}>
            <div style={{
              width:42, height:42, borderRadius:12,
              background: t.direction === 'received' ? C.green + '15' : C.red + '15',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={t.direction === 'received' ? C.green : C.red} strokeWidth="2.5" strokeLinecap="round">
                {t.direction === 'received' ? <><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></> : <><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></>}
              </svg>
            </div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ color:C.text, fontSize:15, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {t.other_name || t.other_phone || t.description || 'Transação'}
              </div>
              <div style={{ color:C.textTer, fontSize:12, marginTop:1 }}>
                {t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : ''}
              </div>
            </div>
            <span style={{ color: t.direction === 'received' ? C.green : C.red, fontSize:15, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>
              {t.direction === 'received' ? '+' : '-'}{fmtMoney(t.amount)}
            </span>
          </div>
        ))}
      </div>

      <style>{`@keyframes pop{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

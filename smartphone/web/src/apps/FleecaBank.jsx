import { useState, useEffect } from 'react';
import { fetchBackend } from '../hooks/useNui';

const C = {
  bg:'#0A1628', surface:'#122240', elevated:'#1A3058',
  text:'#FFFFFF', textSec:'#7A9CC6', textTer:'#4A6A8F',
  sep:'#1E3A5F', green:'#00D68F', red:'#FF6B6B',
  accent:'#00D68F', gold:'#FFD700', blue:'#3B82F6',
};
const fmtMoney = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

export default function FleecaBank({ onNavigate }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [view, setView] = useState('home');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchBackend('bank_init').then(r => {
      if (r?.balance !== undefined) setBalance(r.balance);
      if (r?.transactions) setTransactions(r.transactions);
      setLoading(false);
    });
  }, []);

  const send = async () => {
    if (!to.trim() || !amount || Number(amount) <= 0) return;
    setSending(true);
    const r = await fetchBackend('bank_transfer', { to: to.trim(), amount: Number(amount), description: 'Transferência Fleeca' });
    setSending(false);
    if (r?.ok) { setBalance(r.newBalance); setTo(''); setAmount(''); setView('home');
      fetchBackend('bank_init').then(r => { if(r?.transactions) setTransactions(r.transactions); });
    }
    if (r?.error) alert(r.error);
  };

  // TRANSFER
  if (view === 'transfer') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>setView('home')} style={{ background:'none',border:'none',cursor:'pointer',padding:0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Transferir</span>
      </div>
      <div style={{ flex:1, padding:16 }}>
        <div style={{ marginBottom:16 }}>
          <label style={{ color:C.textSec, fontSize:13, marginBottom:4, display:'block' }}>Conta destino</label>
          <input type="text" placeholder="000-000" value={to} onChange={e=>setTo(e.target.value)}
            style={{ width:'100%', background:C.surface, border:`1px solid ${C.sep}`, borderRadius:8, padding:'14px', color:C.text, fontSize:16, fontFamily:'inherit', outline:'none' }} />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ color:C.textSec, fontSize:13, marginBottom:4, display:'block' }}>Valor</label>
          <div style={{ display:'flex', alignItems:'center', background:C.surface, border:`1px solid ${C.sep}`, borderRadius:8, padding:'14px' }}>
            <span style={{ color:C.textSec, marginRight:4 }}>R$</span>
            <input type="number" placeholder="0,00" value={amount} onChange={e=>setAmount(e.target.value)}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:24, fontWeight:700, fontFamily:'inherit' }} />
          </div>
        </div>
        <button onClick={send} disabled={sending||!to.trim()||!amount} style={{
          width:'100%', padding:'16px', borderRadius:8, border:'none', cursor:'pointer',
          background:C.accent, color:'#000', fontSize:16, fontWeight:700,
          opacity:(sending||!to.trim()||!amount)?0.5:1,
        }}>{sending ? 'Enviando...' : 'Confirmar transferência'}</button>
      </div>
    </div>
  );

  // HOME
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header with Fleeca logo */}
      <div style={{ padding:'16px', background:'linear-gradient(135deg, #0F2847 0%, #1A4070 100%)', borderRadius:'0 0 24px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <div style={{ width:32, height:32, borderRadius:16, background:C.accent, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'#000', fontSize:16, fontWeight:900 }}>F</span>
          </div>
          <span style={{ color:'#fff', fontSize:20, fontWeight:700 }}>Fleeca Bank</span>
        </div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13, marginBottom:4 }}>Saldo disponível</div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ color:'#fff', fontSize:32, fontWeight:700 }}>
            {loading ? '...' : showBalance ? fmtMoney(balance) : 'R$ ••••••'}
          </span>
          <button onClick={()=>setShowBalance(!showBalance)} style={{
            background:'none', border:'none', cursor:'pointer', fontSize:18, opacity:0.7,
          }}>{showBalance ? '👁️' : '👁️‍🗨️'}</button>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:'flex', gap:10, padding:'16px', marginTop:-10 }}>
        {[{label:'Transferir',emoji:'💸',action:()=>setView('transfer')},{label:'PIX',emoji:'⚡',action:()=>setView('transfer')},{label:'Extrato',emoji:'📊',action:()=>{}}].map(a => (
          <button key={a.label} onClick={a.action} style={{
            flex:1, padding:'14px 8px', borderRadius:12, border:'none', cursor:'pointer',
            background:C.surface, display:'flex', flexDirection:'column', alignItems:'center', gap:4,
          }}>
            <span style={{ fontSize:22 }}>{a.emoji}</span>
            <span style={{ color:C.text, fontSize:12, fontWeight:500 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Transactions */}
      <div style={{ flex:1, overflow:'auto', padding:'0 16px' }}>
        <div style={{ color:C.textSec, fontSize:13, fontWeight:600, marginBottom:8 }}>Últimas transações</div>
        {transactions.length === 0 ? (
          <div style={{ textAlign:'center', padding:30, color:C.textTer }}>Nenhuma transação</div>
        ) : transactions.map(t => (
          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`0.5px solid ${C.sep}` }}>
            <div style={{
              width:40, height:40, borderRadius:20,
              background: t.type === 'credit' ? C.green+'22' : C.red+'22',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
            }}>{t.type === 'credit' ? '↙️' : '↗️'}</div>
            <div style={{ flex:1 }}>
              <div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{t.description || 'Transação'}</div>
              <div style={{ color:C.textTer, fontSize:12 }}>{t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR') : ''}</div>
            </div>
            <span style={{ color: t.type==='credit' ? C.green : C.red, fontSize:15, fontWeight:600 }}>
              {t.type==='credit'?'+':'-'}{fmtMoney(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

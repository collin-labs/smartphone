import { useState, useEffect, useCallback } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

const C = {
  bg:'#0D0D0D', surface:'#141418', elevated:'#1C1C22',
  text:'#C8C8D0', textSec:'#7A7A88', textTer:'#4A4A55',
  sep:'#222230', purple:'#7D4698', purpleLight:'#9B59B6',
  green:'#00FF41', accent:'#7D4698', input:'#1A1A22',
  red:'#FF3333', amber:'#FFB800',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };
const fmtMoney = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

const CHANNELS = [
  { id:'mercado', name:'Mercado Negro', emoji:'🏴', desc:'Compra e venda' },
  { id:'info', name:'Informantes', emoji:'🕵️', desc:'Informações privilegiadas' },
  { id:'armas', name:'Arsenal', emoji:'🔫', desc:'Equipamento pesado' },
  { id:'docs', name:'Documentos', emoji:'📄', desc:'Identidades e papéis' },
  { id:'hack', name:'CyberPunk', emoji:'💻', desc:'Serviços digitais' },
  { id:'geral', name:'Anônimos', emoji:'👤', desc:'Chat livre' },
];

const timeAgo = (d) => { if(!d)return''; const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return'agora'; if(s<3600)return`${Math.floor(s/60)}m`; if(s<86400)return`${Math.floor(s/3600)}h`; return`${Math.floor(s/86400)}d`; };

const randomAlias = () => {
  const adj = ['Shadow','Dark','Ghost','Phantom','Cyber','Void','Null','Anon','Hidden','Silent'];
  const noun = ['Fox','Wolf','Hawk','Raven','Viper','Spider','Cobra','Lynx','Owl','Bear'];
  return adj[Math.floor(Math.random()*adj.length)] + noun[Math.floor(Math.random()*noun.length)] + Math.floor(Math.random()*99);
};

export default function Tor({ onNavigate }) {
  const [view, setView] = useState('channels');
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [alias, setAlias] = useState('');
  const [store, setStore] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setAlias(randomAlias()); }, []);

  usePusherEvent('TOR_MESSAGE', useCallback((d) => {
    if (d.channel === activeChannel?.id) setMessages(p => [...p, d.message]);
  }, [activeChannel]));

  const openChannel = async (ch) => {
    setActiveChannel(ch); setLoading(true);
    const r = await fetchBackend('tor_messages', { channel: ch.id });
    if (r?.messages) setMessages(r.messages);
    if (ch.id === 'mercado') { const s = await fetchBackend('tor_store'); if(s?.items) setStore(s.items); }
    setLoading(false); setView('chat');
  };

  const sendMsg = async () => {
    if (!msg.trim() || !activeChannel) return;
    await fetchBackend('tor_send', { channel: activeChannel.id, message: msg.trim(), alias });
    setMsg('');
  };

  const buyItem = async (item) => {
    const r = await fetchBackend('tor_buy', { itemId: item.id });
    if (r?.ok) alert('Item adquirido via drop');
    if (r?.error) alert(r.error);
  };

  // CHAT
  if (view === 'chat' && activeChannel) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>{setView('channels');setActiveChannel(null);}} style={B}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ fontSize:18 }}>{activeChannel.emoji}</span>
        <div>
          <div style={{ color:C.green, fontSize:15, fontWeight:600, fontFamily:'monospace' }}>{activeChannel.name}</div>
          <div style={{ color:C.textTer, fontSize:11 }}>Criptografado • Anônimo</div>
        </div>
      </div>

      {/* Store (only in mercado) */}
      {activeChannel.id === 'mercado' && store.length > 0 && (
        <div style={{ padding:'8px 14px', borderBottom:`0.5px solid ${C.sep}` }}>
          <div style={{ display:'flex', gap:8, overflow:'auto' }}>
            {store.map(item => (
              <button key={item.id} onClick={()=>buyItem(item)} style={{
                background:C.elevated, borderRadius:8, padding:'8px 12px', border:`1px solid ${C.sep}`,
                cursor:'pointer', minWidth:100, textAlign:'left', flexShrink:0,
              }}>
                <div style={{ color:C.amber, fontSize:12, fontWeight:600 }}>{item.name}</div>
                <div style={{ color:C.green, fontSize:11, fontFamily:'monospace' }}>{fmtMoney(item.price)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflow:'auto', padding:'8px 14px', display:'flex', flexDirection:'column', gap:6 }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:30, color:C.textTer }}>Conectando...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign:'center', padding:30, color:C.textTer, fontFamily:'monospace', fontSize:12 }}>
            Canal vazio. Seja o primeiro.
          </div>
        ) : messages.map((m,i) => (
          <div key={i} style={{ background:C.surface, borderRadius:8, padding:'8px 12px', borderLeft:`2px solid ${C.purple}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
              <span style={{ color:C.purple, fontSize:12, fontWeight:600, fontFamily:'monospace' }}>{m.alias || 'Anon'}</span>
              <span style={{ color:C.textTer, fontSize:10 }}>{timeAgo(m.created_at)}</span>
            </div>
            <div style={{ color:C.text, fontSize:14, fontFamily:'monospace', wordBreak:'break-word' }}>{m.message}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'8px 14px 12px', borderTop:`0.5px solid ${C.sep}`, display:'flex', gap:8 }}>
        <input type="text" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Mensagem criptografada..."
          onKeyDown={e=>e.key==='Enter'&&sendMsg()}
          style={{ flex:1, background:C.input, border:`1px solid ${C.sep}`, borderRadius:20, padding:'10px 16px',
            color:C.green, fontSize:14, fontFamily:'monospace', outline:'none' }} />
        <button onClick={sendMsg} style={{ ...B, width:40, height:40, borderRadius:20, background:C.purple }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  );

  // CHANNELS
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <div style={{ color:C.purple, fontSize:22, fontWeight:700, fontFamily:'monospace', marginBottom:2 }}>🧅 Tor Network</div>
        <div style={{ color:C.textTer, fontSize:12, fontFamily:'monospace' }}>Seu alias: <span style={{ color:C.green }}>{alias}</span></div>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'8px 14px' }}>
        <div style={{ color:C.textTer, fontSize:11, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Canais disponíveis</div>
        {CHANNELS.map(ch => (
          <button key={ch.id} onClick={()=>openChannel(ch)}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 12px', marginBottom:6,
              background:C.surface, borderRadius:10, border:`1px solid ${C.sep}`, cursor:'pointer',
            }}>
            <div style={{ width:44, height:44, borderRadius:10, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{ch.emoji}</div>
            <div style={{ flex:1, textAlign:'left' }}>
              <div style={{ color:C.text, fontSize:15, fontWeight:600, fontFamily:'monospace' }}>{ch.name}</div>
              <div style={{ color:C.textTer, fontSize:12, fontFamily:'monospace' }}>{ch.desc}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={C.textTer}><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        ))}

        {/* Warning */}
        <div style={{ marginTop:16, padding:'12px', background:C.red+'11', borderRadius:8, border:`1px solid ${C.red}33` }}>
          <div style={{ color:C.red, fontSize:11, fontFamily:'monospace', textAlign:'center' }}>
            ⚠️ Atividades ilegais no RP. Tudo é rastreável pela polícia IC.
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

const C = {
  bg:'#313338', sidebar:'#2B2D31', panel:'#1E1F22', chat:'#313338',
  text:'#F2F3F5', textSec:'#B5BAC1', textTer:'#949BA4', textMuted:'#6D6F78',
  accent:'#5865F2', green:'#23A55A', red:'#F23F43', yellow:'#F0B232',
  input:'#383A40', hover:'#35373C', mention:'#5865F233', link:'#00A8FC',
  sep:'#3F4147', bubbleMe:'#5865F2',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

const Ic = {
  hash: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.textMuted}><path d="M5.88 21l1.54-5H2l.59-2h5.42l1.18-4H3.77l.59-2h5.42L11.32 3h2l-1.54 5h4.01l1.54-5h2l-1.54 5H23l-.59 2h-5.42l-1.18 4h5.42l-.59 2h-5.42L13.68 21h-2l1.54-5H9.21L7.68 21h-2zm4.51-7h4.01l1.18-4H11.57l-1.18 4z"/></svg>,
  send: <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  plus: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.textSec}><path d="M12 5v14M5 12h14" stroke={C.textSec} strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>,
  back: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textMuted}><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg>,
  members: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.textMuted}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  leave: <svg width="18" height="18" viewBox="0 0 24 24" fill={C.red}><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 00-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>,
};

const Avatar = ({ name, size=32, color }) => (
  <div style={{ width:size, height:size, borderRadius:'50%', background:color||C.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
    <span style={{ color:'#fff', fontSize:size*0.45, fontWeight:600 }}>{name?.[0]?.toUpperCase()||'?'}</span>
  </div>
);

const ServerIcon = ({ server, active, onClick }) => (
  <button onClick={onClick} style={{
    ...B, width:48, height:48, borderRadius:active?16:24, background:active?C.accent:C.bg,
    fontSize:20, transition:'border-radius 0.2s', position:'relative', marginBottom:4,
  }}>
    <span>{server.icon||server.name?.[0]?.toUpperCase()||'?'}</span>
    {active && <div style={{ position:'absolute', left:-8, width:4, height:32, borderRadius:2, background:'#fff' }}/>}
  </button>
);

export default function Discord({ onNavigate }) {
  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [inputText, setInputText] = useState('');
  const [view, setView] = useState('servers'); // servers, chat, create, members
  const [loading, setLoading] = useState(true);
  const [newServerName, setNewServerName] = useState('');
  const [newServerIcon, setNewServerIcon] = useState('🎮');
  const [inviteCode, setInviteCode] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const msgEnd = useRef(null);

  // Load servers
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await fetchBackend('discord_init');
      if (r?.servers) setServers(r.servers);
      if (r?.profile) setMyProfile(r.profile);
      setLoading(false);
    };
    load();
  }, []);

  // Load server details
  const openServer = async (server) => {
    setActiveServer(server);
    const r = await fetchBackend('discord_server', { serverId: server.id });
    if (r?.channels) { setChannels(r.channels); if (r.channels[0]) openChannel(r.channels[0], server.id); }
    if (r?.members) setMembers(r.members);
  };

  // Load channel messages
  const openChannel = async (channel, serverId) => {
    setActiveChannel(channel);
    setView('chat');
    const r = await fetchBackend('discord_messages', { channelId: channel.id });
    if (r?.messages) setMessages(r.messages);
  };

  // Send message
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !activeChannel) return;
    setInputText('');
    const opt = { id: Date.now(), message: text, username: myProfile?.username || 'Você', role_color: myProfile?.role_color || '#fff', created_at: new Date().toISOString(), _pending: true };
    setMessages(p => [...p, opt]);
    const r = await fetchBackend('discord_send', { channelId: activeChannel.id, message: text });
    if (r?.ok && r?.message) setMessages(p => p.map(m => m.id === opt.id ? { ...r.message, _pending: false } : m));
  };

  // Create server
  const createServer = async () => {
    if (!newServerName.trim()) return;
    const r = await fetchBackend('discord_create_server', { name: newServerName.trim(), icon: newServerIcon });
    if (r?.ok && r?.server) { setServers(p => [...p, r.server]); setNewServerName(''); setView('servers'); openServer(r.server); }
  };

  // Join by invite
  const joinServer = async () => {
    if (!inviteCode.trim()) return;
    const r = await fetchBackend('discord_join', { invite: inviteCode.trim() });
    if (r?.ok && r?.server) { setServers(p => [...p, r.server]); setInviteCode(''); setView('servers'); openServer(r.server); }
    if (r?.error) alert(r.error);
  };

  // Leave server
  const leaveServer = async () => {
    if (!activeServer) return;
    if (!confirm(`Sair de ${activeServer.name}?`)) return;
    const r = await fetchBackend('discord_leave', { serverId: activeServer.id });
    if (r?.ok) { setServers(p => p.filter(s => s.id !== activeServer.id)); setActiveServer(null); setActiveChannel(null); setView('servers'); }
  };

  // Pusher: new messages
  usePusherEvent('DISCORD_MESSAGE', useCallback((d) => {
    if (activeChannel && d.channelId === activeChannel.id) {
      setMessages(p => { if (p.find(m => m.id === d.id)) return p; return [...p, d]; });
    }
  }, [activeChannel]));

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const formatTime = (d) => { if (!d) return ''; return new Date(d).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }); };
  const formatDay = (d) => { if (!d) return ''; const dt = new Date(d); const now = new Date(); const diff = Math.floor((now - dt) / 86400000); if (diff === 0) return 'Hoje'; if (diff === 1) return 'Ontem'; return dt.toLocaleDateString('pt-BR'); };

  // ===== CREATE SERVER =====
  if (view === 'create') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'14px 16px', background:C.panel, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => setView('servers')} style={B}>{Ic.back}</button>
        <span style={{ color:C.text, fontSize:17, fontWeight:600 }}>Criar servidor</span>
      </div>
      <div style={{ flex:1, padding:20, display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <div style={{ color:C.text, fontSize:22, fontWeight:700, marginBottom:4 }}>Personalize seu servidor</div>
          <div style={{ color:C.textSec, fontSize:14 }}>Escolha um ícone e nome para começar</div>
        </div>
        {/* Icon picker */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          {['🎮','⚔️','🏎️','💀','🔥','🌙','👑','🎯','🐉','💎'].map(e => (
            <button key={e} onClick={() => setNewServerIcon(e)} style={{
              ...B, width:44, height:44, borderRadius:22, fontSize:22,
              background: newServerIcon === e ? C.accent : C.input,
              border: newServerIcon === e ? '2px solid #fff' : '2px solid transparent',
            }}>{e}</button>
          ))}
        </div>
        <div>
          <label style={{ color:C.textSec, fontSize:12, fontWeight:600, textTransform:'uppercase', marginBottom:6, display:'block' }}>Nome do servidor</label>
          <input type="text" placeholder="Ex: Facção do Norte" value={newServerName} onChange={e => setNewServerName(e.target.value)}
            style={{ width:'100%', background:C.input, border:'none', borderRadius:4, padding:'12px', color:C.text, fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
        </div>
        <button onClick={createServer} disabled={!newServerName.trim()} style={{
          width:'100%', padding:'14px', borderRadius:4, border:'none', cursor:'pointer',
          background: newServerName.trim() ? C.accent : C.input, color:'#fff', fontSize:15, fontWeight:600,
          opacity: newServerName.trim() ? 1 : 0.4,
        }}>Criar</button>

        <div style={{ borderTop:`1px solid ${C.sep}`, paddingTop:16, marginTop:8 }}>
          <div style={{ color:C.text, fontSize:15, fontWeight:600, marginBottom:8 }}>Ou entrar com convite</div>
          <div style={{ display:'flex', gap:8 }}>
            <input type="text" placeholder="Código de convite" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
              style={{ flex:1, background:C.input, border:'none', borderRadius:4, padding:'10px 12px', color:C.text, fontSize:14, fontFamily:'inherit', outline:'none' }} />
            <button onClick={joinServer} style={{ padding:'10px 16px', borderRadius:4, border:'none', cursor:'pointer', background:C.green, color:'#fff', fontSize:14, fontWeight:600 }}>Entrar</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== MEMBERS VIEW =====
  if (view === 'members' && activeServer) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'14px 16px', background:C.panel, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => setView('chat')} style={B}>{Ic.back}</button>
        <span style={{ color:C.text, fontSize:17, fontWeight:600 }}>Membros — {members.length}</span>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'8px 0' }}>
        {/* Group by role */}
        {['dono','admin','moderador','membro'].map(role => {
          const roleMembers = members.filter(m => m.role === role);
          if (roleMembers.length === 0) return null;
          return (
            <div key={role}>
              <div style={{ color:C.textMuted, fontSize:11, fontWeight:700, textTransform:'uppercase', padding:'12px 16px 4px', letterSpacing:0.5 }}>
                {role} — {roleMembers.length}
              </div>
              {roleMembers.map(m => (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 16px' }}>
                  <div style={{ position:'relative' }}>
                    <Avatar name={m.username} size={32} color={m.role_color || C.accent} />
                    <div style={{ position:'absolute', bottom:-1, right:-1, width:10, height:10, borderRadius:5, background: m.online ? C.green : C.textMuted, border:`2px solid ${C.bg}` }} />
                  </div>
                  <span style={{ color:m.role_color || C.text, fontSize:14, fontWeight:500 }}>{m.username}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ===== CHAT VIEW =====
  if (view === 'chat' && activeServer && activeChannel) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:C.bg, borderBottom:`1px solid ${C.panel}`, zIndex:2 }}>
        <button onClick={() => { setActiveChannel(null); setView('servers'); }} style={B}>{Ic.back}</button>
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
          {Ic.hash}
          <span style={{ color:C.text, fontSize:16, fontWeight:600 }}>{activeChannel.name}</span>
        </div>
        <button onClick={() => setView('members')} style={{...B, padding:6}}>{Ic.members}</button>
        <button onClick={leaveServer} style={{...B, padding:6}}>{Ic.leave}</button>
      </div>

      {/* Channel sidebar (horizontal) */}
      {channels.length > 1 && (
        <div style={{ display:'flex', gap:2, padding:'4px 8px', background:C.panel, overflow:'auto', scrollbarWidth:'none' }}>
          {channels.map(ch => (
            <button key={ch.id} onClick={() => openChannel(ch, activeServer.id)} style={{
              ...B, gap:4, padding:'4px 10px', borderRadius:4,
              background: activeChannel.id === ch.id ? C.hover : 'transparent',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={activeChannel.id === ch.id ? C.text : C.textMuted}><path d="M5.88 21l1.54-5H2l.59-2h5.42l1.18-4H3.77l.59-2h5.42L11.32 3h2l-1.54 5h4.01l1.54-5h2l-1.54 5H23l-.59 2h-5.42l-1.18 4h5.42l-.59 2h-5.42L13.68 21h-2l1.54-5H9.21L7.68 21h-2zm4.51-7h4.01l1.18-4H11.57l-1.18 4z"/></svg>
              <span style={{ color: activeChannel.id === ch.id ? C.text : C.textSec, fontSize:13, fontWeight:500, whiteSpace:'nowrap' }}>{ch.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflow:'auto', padding:'8px 16px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ fontSize:40, marginBottom:8 }}>👋</div>
            <div style={{ color:C.text, fontSize:18, fontWeight:700 }}>Bem-vindo a #{activeChannel.name}</div>
            <div style={{ color:C.textSec, fontSize:14, marginTop:4 }}>Este é o início do canal.</div>
          </div>
        )}
        {messages.map((msg, i) => {
          const showHeader = i === 0 || messages[i-1]?.username !== msg.username || (new Date(msg.created_at) - new Date(messages[i-1]?.created_at)) > 420000;
          const showDay = i === 0 || formatDay(msg.created_at) !== formatDay(messages[i-1]?.created_at);
          return (
            <div key={msg.id}>
              {showDay && (
                <div style={{ display:'flex', alignItems:'center', gap:8, margin:'12px 0 8px' }}>
                  <div style={{ flex:1, height:1, background:C.sep }} />
                  <span style={{ color:C.textMuted, fontSize:11, fontWeight:600 }}>{formatDay(msg.created_at)}</span>
                  <div style={{ flex:1, height:1, background:C.sep }} />
                </div>
              )}
              <div style={{ padding: showHeader ? '4px 0' : '1px 0', opacity: msg._pending ? 0.5 : 1, marginTop: showHeader ? 8 : 0 }}>
                {showHeader && (
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:1 }}>
                    <Avatar name={msg.username} size={36} color={msg.role_color || C.accent} />
                    <div>
                      <span style={{ color:msg.role_color || C.text, fontSize:14, fontWeight:600, marginRight:8 }}>{msg.username}</span>
                      <span style={{ color:C.textMuted, fontSize:11 }}>{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                )}
                <div style={{ paddingLeft: showHeader ? 52 : 52, color:C.text, fontSize:14, lineHeight:1.4, wordBreak:'break-word',
                  background: msg.message?.includes('@everyone') ? C.mention : 'transparent', padding: msg.message?.includes('@everyone') ? '2px 4px 2px 52px' : undefined, borderRadius:4,
                }}>{msg.message}</div>
              </div>
            </div>
          );
        })}
        <div ref={msgEnd} />
      </div>

      {/* Input */}
      <div style={{ padding:'0 12px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', background:C.input, borderRadius:8, padding:'8px 12px', gap:8 }}>
          <button style={{...B, padding:4}}>{Ic.plus}</button>
          <input type="text" placeholder={`Conversar em #${activeChannel.name}`} value={inputText}
            onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:14, fontFamily:'inherit' }} />
          {inputText.trim() && <button onClick={handleSend} style={{...B, width:32, height:32, borderRadius:16, background:C.accent}}>{Ic.send}</button>}
        </div>
      </div>
    </div>
  );

  // ===== SERVER LIST =====
  return (
    <div style={{ height:'100%', display:'flex', background:C.panel }}>
      {/* Server sidebar */}
      <div style={{ width:66, display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 0', gap:2, overflow:'auto', scrollbarWidth:'none' }}>
        {/* DM icon */}
        <button style={{ ...B, width:48, height:48, borderRadius:16, background:C.accent, marginBottom:4, fontSize:20 }}>💬</button>
        <div style={{ width:32, height:2, borderRadius:1, background:C.sep, marginBottom:4 }} />
        {servers.map(s => (
          <ServerIcon key={s.id} server={s} active={activeServer?.id === s.id} onClick={() => openServer(s)} />
        ))}
        {/* Add server */}
        <button onClick={() => setView('create')} style={{
          ...B, width:48, height:48, borderRadius:24, background:C.bg, marginTop:4,
          border:`2px dashed ${C.sep}`,
        }}>{Ic.plus}</button>
      </div>

      {/* Server content / Home */}
      <div style={{ flex:1, borderRadius:'12px 0 0 0', background:C.bg, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {activeServer ? (
          <>
            {/* Server name header */}
            <div style={{ padding:'14px 16px', borderBottom:`1px solid ${C.panel}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ color:C.text, fontSize:16, fontWeight:700 }}>{activeServer.name}</span>
              <button onClick={() => setView('members')} style={{...B, padding:4}}>{Ic.settings}</button>
            </div>
            {/* Channel list */}
            <div style={{ padding:'8px 8px 4px' }}>
              <div style={{ color:C.textMuted, fontSize:11, fontWeight:700, textTransform:'uppercase', padding:'4px 8px', letterSpacing:0.5 }}>Canais de texto</div>
            </div>
            <div style={{ flex:1, overflow:'auto', padding:'0 8px' }}>
              {channels.map(ch => (
                <button key={ch.id} onClick={() => openChannel(ch, activeServer.id)} style={{
                  ...B, width:'100%', gap:6, padding:'6px 10px', borderRadius:4, justifyContent:'flex-start',
                  background: activeChannel?.id === ch.id ? C.hover : 'transparent',
                }}>
                  {Ic.hash}
                  <span style={{ color: activeChannel?.id === ch.id ? C.text : C.textSec, fontSize:14, fontWeight:activeChannel?.id === ch.id ? 600 : 400 }}>{ch.name}</span>
                </button>
              ))}
            </div>
            {/* User bar */}
            <div style={{ padding:'8px 10px', background:C.panel, display:'flex', alignItems:'center', gap:8 }}>
              <Avatar name={myProfile?.username} size={28} color={myProfile?.role_color || C.green} />
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:13, fontWeight:500 }}>{myProfile?.username || '...'}</div>
                <div style={{ color:C.textMuted, fontSize:10 }}>Online</div>
              </div>
              <button style={{...B, padding:4}}>{Ic.settings}</button>
            </div>
          </>
        ) : (
          /* No server selected / Home */
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:24 }}>
            {loading ? (
              <div style={{ width:24, height:24, border:`2px solid ${C.sep}`, borderTopColor:C.accent, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            ) : servers.length === 0 ? (
              <>
                <div style={{ fontSize:48, marginBottom:12 }}>🎮</div>
                <div style={{ color:C.text, fontSize:18, fontWeight:700, marginBottom:4 }}>Nenhum servidor</div>
                <div style={{ color:C.textSec, fontSize:14, textAlign:'center', marginBottom:16 }}>Crie ou entre em um servidor para começar</div>
                <button onClick={() => setView('create')} style={{
                  padding:'12px 24px', borderRadius:4, border:'none', cursor:'pointer',
                  background:C.accent, color:'#fff', fontSize:15, fontWeight:600,
                }}>Criar servidor</button>
              </>
            ) : (
              <>
                <div style={{ fontSize:36, marginBottom:8 }}>👈</div>
                <div style={{ color:C.textSec, fontSize:15 }}>Selecione um servidor</div>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

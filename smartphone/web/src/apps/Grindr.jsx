import { useState, useEffect, useCallback } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// Grindr real dark mode
const C = {
  bg:'#060606', surface:'#1A1A1A', elevated:'#242424',
  text:'#FFFFFF', textSec:'#999999', textTer:'#666666',
  sep:'#2A2A2A', yellow:'#FFD900', yellowDark:'#E6C300',
  accent:'#FFD900', green:'#06C167', red:'#FF453A',
  online:'#06C167', input:'#1E1E1E',
  gradient:'linear-gradient(135deg, #FFD900, #FF8C00)',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };
const timeAgo = (d) => { if(!d)return''; const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return'agora'; if(s<3600)return`${Math.floor(s/60)}m`; if(s<86400)return`${Math.floor(s/3600)}h`; return`${Math.floor(s/86400)}d`; };

const AVATARS = ['😎','🧔','👨‍🦱','👨‍🦰','🧑‍🦳','👱','🥷','🦸','🧑‍💻','👨‍🎤','🕵️','🧛','🏋️','🏄','🎸','🎭'];

export default function Grindr({ onNavigate }) {
  const [view, setView] = useState('grid');
  const [profiles, setProfiles] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [taps, setTaps] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('😎');

  useEffect(() => {
    fetchBackend('grindr_init').then(r => {
      if (r?.profiles) setProfiles(r.profiles);
      if (r?.myProfile) { setMyProfile(r.myProfile); setEditName(r.myProfile.name||''); setEditBio(r.myProfile.bio||''); setEditAvatar(r.myProfile.avatar||'😎'); }
      if (r?.taps) setTaps(r.taps);
      if (r?.chats) setChats(r.chats);
      if (!r?.myProfile) setEditMode(true);
      setLoading(false);
    });
  }, []);

  usePusherEvent('GRINDR_TAP', useCallback((d) => {
    setTaps(p => [d, ...p]);
    fetchClient('playSound', { sound: 'notification' });
  }, []));

  usePusherEvent('GRINDR_MESSAGE', useCallback((d) => {
    if (activeChat && d.chatId === activeChat.id) setMessages(p => [...p, d.message]);
    else setChats(p => p.map(c => c.id === d.chatId ? { ...c, lastMessage: d.message.message, unread: (c.unread||0)+1 } : c));
  }, [activeChat]));

  const saveProfile = async () => {
    if (!editName.trim()) return;
    const r = await fetchBackend('grindr_save_profile', { name: editName.trim(), bio: editBio.trim(), avatar: editAvatar });
    if (r?.ok) { setMyProfile(r.profile); setEditMode(false); }
  };

  const sendTap = async (profileId) => {
    await fetchBackend('grindr_tap', { targetId: profileId });
  };

  const openChat = async (profile) => {
    const r = await fetchBackend('grindr_open_chat', { targetId: profile.id });
    if (r?.ok) { setActiveChat({ id: r.chatId, profile }); setMessages(r.messages || []); setView('chat'); }
  };

  const sendMessage = async () => {
    if (!msg.trim() || !activeChat) return;
    const r = await fetchBackend('grindr_send', { chatId: activeChat.id, message: msg.trim() });
    if (r?.ok) setMsg('');
  };

  // EDIT PROFILE
  if (editMode) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        {myProfile ? <button onClick={()=>setEditMode(false)} style={{...B,color:C.textSec,fontSize:15}}>Cancelar</button> : <div/>}
        <span style={{ color:C.text, fontSize:16, fontWeight:700 }}>Seu perfil</span>
        <button onClick={saveProfile} style={{...B, background:C.yellow, padding:'6px 16px', borderRadius:16}}>
          <span style={{ color:'#000', fontSize:14, fontWeight:600 }}>Salvar</span>
        </button>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ width:80, height:80, borderRadius:16, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, margin:'0 auto 8px' }}>{editAvatar}</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center' }}>
            {AVATARS.map(a => (
              <button key={a} onClick={()=>setEditAvatar(a)} style={{
                width:36, height:36, borderRadius:8, border: editAvatar===a ? `2px solid ${C.yellow}` : `1px solid ${C.sep}`,
                background:C.elevated, fontSize:18, ...B, cursor:'pointer',
              }}>{a}</button>
            ))}
          </div>
        </div>
        <input type="text" placeholder="Nome de exibição" value={editName} onChange={e=>setEditName(e.target.value)}
          style={{ width:'100%', background:C.surface, border:'none', outline:'none', color:C.text, fontSize:16, padding:'14px', borderRadius:8, marginBottom:12, fontFamily:'inherit' }} />
        <textarea placeholder="Bio (opcional)" value={editBio} onChange={e=>setEditBio(e.target.value)}
          style={{ width:'100%', minHeight:80, background:C.surface, border:'none', outline:'none', color:C.text, fontSize:15, padding:'14px', borderRadius:8, fontFamily:'inherit', resize:'vertical' }} />
      </div>
    </div>
  );

  // CHAT
  if (view === 'chat' && activeChat) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>{setView('chats');setActiveChat(null);}} style={B}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ width:36, height:36, borderRadius:8, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
          {activeChat.profile?.avatar || '😎'}
        </div>
        <div>
          <div style={{ color:C.text, fontSize:15, fontWeight:600 }}>{activeChat.profile?.name || 'Perfil'}</div>
          <div style={{ color:C.online, fontSize:11 }}>Online</div>
        </div>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'8px 14px', display:'flex', flexDirection:'column', gap:4 }}>
        {messages.map((m,i) => {
          const isMe = m.sender_id === myProfile?.id;
          return (
            <div key={i} style={{ alignSelf:isMe?'flex-end':'flex-start', maxWidth:'75%' }}>
              <div style={{
                background:isMe?C.yellow:C.surface, color:isMe?'#000':C.text,
                borderRadius:16, padding:'8px 14px', fontSize:14,
              }}>{m.message}</div>
              <div style={{ color:C.textTer, fontSize:10, marginTop:2, textAlign:isMe?'right':'left' }}>{timeAgo(m.created_at)}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding:'8px 14px 12px', borderTop:`0.5px solid ${C.sep}`, display:'flex', gap:8 }}>
        <input type="text" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Mensagem..."
          onKeyDown={e=>e.key==='Enter'&&sendMessage()}
          style={{ flex:1, background:C.input, border:`1px solid ${C.sep}`, borderRadius:20, padding:'10px 16px', color:C.text, fontSize:14, outline:'none', fontFamily:'inherit' }} />
        <button onClick={sendMessage} style={{...B,width:40,height:40,borderRadius:20,background:C.yellow}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#000"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  );

  // CHATS LIST
  if (view === 'chats') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px' }}>
        <button onClick={()=>setView('grid')} style={B}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Mensagens</span>
      </div>
      <div style={{ flex:1, overflow:'auto' }}>
        {chats.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:C.textSec }}>Nenhuma conversa ainda</div>
        ) : chats.map(c => (
          <div key={c.id} onClick={()=>openChat(c.profile||{id:c.other_id,name:c.other_name,avatar:c.other_avatar})}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
            <div style={{ width:48, height:48, borderRadius:10, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0, position:'relative' }}>
              {c.other_avatar||'😎'}
              <div style={{ position:'absolute', bottom:-1, right:-1, width:12, height:12, borderRadius:6, background:C.online, border:`2px solid ${C.bg}` }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:C.text, fontSize:15, fontWeight:600 }}>{c.other_name||'Perfil'}</div>
              <div style={{ color:C.textSec, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.lastMessage||'Toque para conversar'}</div>
            </div>
            {c.unread > 0 && <div style={{ width:20, height:20, borderRadius:10, background:C.yellow, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#000', fontSize:11, fontWeight:700 }}>{c.unread}</span>
            </div>}
          </div>
        ))}
      </div>
    </div>
  );

  // PROFILE VIEW
  if (view === 'profile' && selectedProfile) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px' }}>
        <button onClick={()=>{setView('grid');setSelectedProfile(null);}} style={B}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ width:100, height:100, borderRadius:20, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:50, margin:'0 auto 12px' }}>
            {selectedProfile.avatar||'😎'}
          </div>
          <div style={{ color:C.text, fontSize:22, fontWeight:700 }}>{selectedProfile.name}</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginTop:4 }}>
            <div style={{ width:8, height:8, borderRadius:4, background:C.online }}/>
            <span style={{ color:C.online, fontSize:13 }}>Online</span>
          </div>
        </div>
        {selectedProfile.bio && (
          <div style={{ background:C.surface, borderRadius:12, padding:14, marginBottom:16 }}>
            <div style={{ color:C.textSec, fontSize:12, marginBottom:4 }}>Bio</div>
            <div style={{ color:C.text, fontSize:15 }}>{selectedProfile.bio}</div>
          </div>
        )}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={()=>sendTap(selectedProfile.id)} style={{
            flex:1, padding:'14px', borderRadius:12, border:'none', cursor:'pointer',
            background:C.yellow, color:'#000', fontSize:15, fontWeight:600,
          }}>🔥 Tap</button>
          <button onClick={()=>openChat(selectedProfile)} style={{
            flex:1, padding:'14px', borderRadius:12, border:'none', cursor:'pointer',
            background:C.surface, color:C.text, fontSize:15, fontWeight:600, border:`1px solid ${C.sep}`,
          }}>💬 Chat</button>
        </div>
      </div>
    </div>
  );

  // GRID (main)
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px' }}>
        <span style={{ color:C.yellow, fontSize:22, fontWeight:900, letterSpacing:1 }}>grindr</span>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={()=>setView('chats')} style={B}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={C.text}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          </button>
          <button onClick={()=>setEditMode(true)} style={B}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={C.text}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </button>
        </div>
      </div>

      {/* Taps notification */}
      {taps.length > 0 && (
        <div style={{ padding:'0 16px 8px' }}>
          <div style={{ background:C.yellow+'15', borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:16 }}>🔥</span>
            <span style={{ color:C.yellow, fontSize:13, fontWeight:500 }}>{taps.length} tap{taps.length>1?'s':''} recebido{taps.length>1?'s':''}</span>
          </div>
        </div>
      )}

      {/* Grid 3xN */}
      <div style={{ flex:1, overflow:'auto', padding:'0 16px 16px' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
            <div style={{ width:24, height:24, border:`2px solid ${C.sep}`, borderTopColor:C.yellow, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          </div>
        ) : profiles.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:C.textSec }}>Nenhum perfil online no momento</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:3 }}>
            {profiles.map(p => (
              <button key={p.id} onClick={()=>{setSelectedProfile(p);setView('profile');}}
                style={{
                  aspectRatio:'0.8', borderRadius:4, border:'none', cursor:'pointer',
                  background:C.elevated, display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', gap:4, position:'relative', overflow:'hidden',
                }}>
                <span style={{ fontSize:36 }}>{p.avatar||'😎'}</span>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent,rgba(0,0,0,0.8))', padding:'16px 6px 6px' }}>
                  <div style={{ color:C.text, fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <div style={{ width:6, height:6, borderRadius:3, background:C.online }}/>
                    <span style={{ color:C.online, fontSize:10 }}>Online</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// WhatsApp Dark Mode — cores exatas
const C = {
  bg:'#111B21', header:'#202C33', chatBg:'#0B141A',
  bubbleMe:'#005C4B', bubbleOther:'#202C33',
  text:'#E9EDEF', textSec:'#8696A0', textTer:'#667781',
  green:'#25D366', greenLight:'#00A884', blue:'#53BDEB',
  sep:'#222D34', input:'#2A3942', search:'#202C33',
  unread:'#25D366', fabGreen:'#00A884',
};

const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

const Ic = {
  back: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 12H4M10 18l-6-6 6-6" stroke={C.greenLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.textSec}><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  send: <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  newChat: <svg width="22" height="22" viewBox="0 0 24 24" fill={C.greenLight}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM11 5h2v4h4v2h-4v4h-2v-4H7V9h4V5z"/></svg>,
  camera: <svg width="22" height="22" viewBox="0 0 24 24" fill={C.textSec}><path d="M12 15.2A3.2 3.2 0 1012 8.8a3.2 3.2 0 000 6.4z"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z" fill="none" stroke={C.textSec} strokeWidth="1.5"/></svg>,
  phone: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.textSec}><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  video: <svg width="22" height="22" viewBox="0 0 24 24" fill={C.textSec}><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>,
  dots: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.textSec}><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>,
  tick1: (c=C.textSec) => <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M11.07 0.73L4.82 6.98 2.4 4.56 1 5.97 4.82 9.78 12.48 2.12 11.07 0.73Z" fill={c}/></svg>,
  tick2: (c=C.textSec) => <svg width="20" height="11" viewBox="0 0 20 11" fill="none"><path d="M15.07 0.73L8.82 6.98 7.4 5.56 6 6.97 8.82 9.78 16.48 2.12 15.07 0.73Z" fill={c}/><path d="M11.07 0.73L4.82 6.98 3.4 5.56 2 6.97 4.82 9.78 12.48 2.12 11.07 0.73Z" fill={c}/></svg>,
  emoji: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.textSec} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>,
  attach: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.textSec} strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>,
  mic: <svg width="24" height="24" viewBox="0 0 24 24" fill={C.textSec}><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>,
};

const WaAvatar = ({ name, size=48, isGroup }) => (
  <div style={{ width:size, height:size, borderRadius:'50%', background: isGroup ? '#00A884' : '#2A3942', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
    {isGroup ? (
      <svg width={size*0.48} height={size*0.48} viewBox="0 0 24 24" fill="#fff"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
    ) : (
      <span style={{ color:'#8696A0', fontSize:size*0.42, fontWeight:500 }}>{name?.[0]?.toUpperCase()||'?'}</span>
    )}
  </div>
);

const Tick = ({ isMe, isRead }) => {
  if (!isMe) return null;
  return isRead ? Ic.tick2(C.blue) : Ic.tick2(C.textSec);
};

// WhatsApp SVG pattern background
const waBgPattern = `url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M20 5c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2zM8 18c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zM30 28c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1zM35 10l-2 2M5 32l2-2' fill='none' stroke='%23ffffff' stroke-width='.3' opacity='.06'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='300' height='300' fill='%230B141A'/%3E%3Crect width='300' height='300' fill='url(%23p)'/%3E%3C/svg%3E")`;

export default function WhatsApp({ onNavigate, params }) {
  const [view, setView] = useState('list');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myPhone, setMyPhone] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [newTo, setNewTo] = useState('');
  const [contacts, setContacts] = useState([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, unread, groups
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const msgEnd = useRef(null);

  const loadChats = useCallback(async () => { setLoading(true); const r=await fetchBackend('whatsapp_chats'); if(r?.chats)setChats(r.chats); const s=await fetchBackend('getSettings'); if(s?.phone)setMyPhone(s.phone); setLoading(false); }, []);
  useEffect(() => { loadChats(); }, [loadChats]);
  useEffect(() => { if(params?.to){setNewTo(params.to);setView('new');} }, [params]);
  useEffect(() => { if(view==='new' || showCreateGroup) fetchBackend('contacts_list').then(r=>{if(r?.contacts)setContacts(r.contacts);}); }, [view, showCreateGroup]);

  const openChat = useCallback(async (chat) => { setActiveChat(chat);setView('chat');setMessages([]); const r=await fetchBackend('whatsapp_messages',{chatId:chat.id}); if(r?.messages)setMessages(r.messages); if(chat.unreadCount>0)setChats(p=>p.map(c=>c.id===chat.id?{...c,unreadCount:0}:c)); }, []);

  const handleSend = useCallback(async () => {
    const text=inputText.trim(); if(!text)return; setInputText('');
    if(view==='new'){ const to=newTo.trim(); if(!to)return; const r=await fetchBackend('whatsapp_send',{to,message:text}); if(r?.ok&&r?.message){setActiveChat({id:r.message.chatId,name:to,otherPhones:[to]});setMessages([r.message]);setView('chat');loadChats();} return; }
    if(!activeChat)return;
    const opt={id:Date.now(),sender_phone:myPhone,message:text,type:'text',is_read:0,created_at:new Date().toISOString(),_pending:true};
    setMessages(p=>[...p,opt]);
    const r=await fetchBackend('whatsapp_send',{chatId:activeChat.id,message:text});
    if(r?.ok&&r?.message)setMessages(p=>p.map(m=>m.id===opt.id?{...r.message,_pending:false}:m));
  }, [inputText, activeChat, view, newTo, myPhone, loadChats]);

  useEffect(() => { msgEnd.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  usePusherEvent('WHATSAPP_MESSAGE', useCallback((d) => {
    if(activeChat&&d.chatId===activeChat.id){ setMessages(p=>{if(p.find(m=>m.id===d.id))return p;return[...p,d];}); fetchBackend('whatsapp_mark_read',{chatId:activeChat.id}); }
    else { setChats(p=>{const e=p.find(c=>c.id===d.chatId);if(e)return p.map(c=>c.id===d.chatId?{...c,lastMessage:d.message,lastMessageAt:d.created_at,lastSender:d.sender_phone,unreadCount:(c.unreadCount||0)+1}:c);loadChats();return p;}); }
  }, [activeChat, loadChats]));

  usePusherEvent('WHATSAPP_READ', useCallback((d) => { if(activeChat&&d.chatId===activeChat.id)setMessages(p=>p.map(m=>({...m,is_read:1}))); }, [activeChat]));

  const formatTime = (d) => { if(!d)return''; const dt=new Date(d); return dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); };
  const formatDay = (d) => { if(!d)return''; const dt=new Date(d); const now=new Date(); const diff=Math.floor((now-dt)/86400000); if(diff===0)return'Hoje'; if(diff===1)return'Ontem'; return dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}); };
  const formatMsgTime = (d) => { if(!d)return''; return new Date(d).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); };

  const filteredChats = useMemo(() => {
    let result = chats;
    if (activeTab === 'unread') result = result.filter(c => c.unreadCount > 0);
    else if (activeTab === 'groups') result = result.filter(c => c.is_group);
    if (searchQ.trim()) { const q=searchQ.toLowerCase(); result = result.filter(c=>(c.name||'').toLowerCase().includes(q)||(c.lastMessage||'').toLowerCase().includes(q)); }
    return result;
  }, [chats, searchQ, activeTab]);
  const filteredContacts = useMemo(() => { if(!newTo.trim())return contacts; const q=newTo.toLowerCase(); return contacts.filter(c=>c.contact_name.toLowerCase().includes(q)||c.contact_phone.includes(q)); }, [contacts, newTo]);

  // ===== CHAT VIEW =====
  if (view === 'chat' && activeChat) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.chatBg }}>
      {/* Chat header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:C.header }}>
        <button onClick={()=>{setView('list');setActiveChat(null);loadChats();}} style={B}>{Ic.back}</button>
        <WaAvatar name={activeChat.name||activeChat.otherPhones?.[0]} size={38} isGroup={activeChat.is_group} />
        <div style={{ flex:1 }}>
          <div style={{ color:C.text, fontSize:16, fontWeight:500 }}>{activeChat.name||activeChat.otherPhones?.[0]||'Chat'}</div>
          <div style={{ color:C.textSec, fontSize:12 }}>{activeChat.is_group ? `${activeChat.memberCount||''}membros` : 'online'}</div>
        </div>
        <button style={{...B,padding:8}}>{Ic.video}</button>
        <button onClick={()=>onNavigate?.('phone',{number:activeChat.otherPhones?.[0]})} style={{...B,padding:8}}>{Ic.phone}</button>
        <button style={{...B,padding:8}}>{Ic.dots}</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflow:'auto', padding:'8px 12px', backgroundImage:waBgPattern, backgroundSize:'300px 300px' }}>
        {messages.map((msg, i) => {
          const isMe = msg.sender_phone === myPhone;
          const showDay = i === 0 || formatDay(msg.created_at) !== formatDay(messages[i-1]?.created_at);
          const showTime = i === 0 || (new Date(msg.created_at) - new Date(messages[i-1]?.created_at)) > 300000;

          return (
            <div key={msg.id}>
              {showDay && (
                <div style={{ textAlign:'center', margin:'10px 0 6px' }}>
                  <span style={{ background:'#1D2A30', color:C.textSec, fontSize:12, padding:'5px 12px', borderRadius:8, fontWeight:500 }}>{formatDay(msg.created_at)}</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:isMe?'flex-end':'flex-start', marginBottom:2 }}>
                <div style={{
                  maxWidth:'80%', position:'relative',
                  background:isMe?C.bubbleMe:C.bubbleOther,
                  borderRadius:8, borderTopRightRadius:isMe?0:8, borderTopLeftRadius:isMe?8:0,
                  padding:'6px 8px 4px', opacity:msg._pending?0.5:1,
                  boxShadow:'0 1px 0.5px rgba(0,0,0,0.13)',
                }}>
                  {activeChat.is_group && !isMe && (
                    <div style={{ color:'#00A884', fontSize:12, fontWeight:600, marginBottom:2 }}>{msg.sender_name || msg.sender_phone}</div>
                  )}
                  <span style={{ color:C.text, fontSize:14.2, lineHeight:1.35, wordBreak:'break-word' }}>{msg.message}</span>
                  <span style={{ float:'right', display:'flex', alignItems:'center', marginLeft:8, marginTop:2, gap:3, whiteSpace:'nowrap' }}>
                    <span style={{ color:'rgba(255,255,255,0.45)', fontSize:11 }}>{formatMsgTime(msg.created_at)}</span>
                    <Tick isMe={isMe} isRead={msg.is_read} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={msgEnd} />
      </div>

      {/* Input bar */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, padding:'6px 6px 8px', background:C.chatBg }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', background:C.input, borderRadius:24, padding:'6px 8px', gap:4 }}>
          <button style={{...B,padding:4}}>{Ic.emoji}</button>
          <input type="text" placeholder="Mensagem" value={inputText} onChange={e=>setInputText(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSend()}
            style={{ background:'transparent', border:'none', outline:'none', color:C.text, fontSize:16, width:'100%', fontFamily:'inherit', padding:'4px 2px' }} />
          <button style={{...B,padding:4}}>{Ic.attach}</button>
          <button style={{...B,padding:4}}>{Ic.camera}</button>
        </div>
        {inputText.trim() ? (
          <button onClick={handleSend} style={{ ...B, width:44, height:44, borderRadius:22, background:C.fabGreen, flexShrink:0 }}>{Ic.send}</button>
        ) : (
          <button style={{ ...B, width:44, height:44, borderRadius:22, background:C.fabGreen, flexShrink:0 }}>{Ic.mic}</button>
        )}
      </div>
    </div>
  );

  // ===== NEW CHAT =====
  if (view === 'new') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'10px 14px', background:C.header, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={()=>setView('list')} style={B}>{Ic.back}</button>
        <div><div style={{ color:C.text, fontSize:17, fontWeight:500 }}>Nova conversa</div><div style={{ color:C.textSec, fontSize:13 }}>{contacts.length} contatos</div></div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        {Ic.search}
        <input type="text" placeholder="Pesquisar nome ou número" value={newTo} onChange={e=>setNewTo(e.target.value)} autoFocus
          style={{ background:'transparent', border:'none', outline:'none', color:C.text, fontSize:15, flex:1, fontFamily:'inherit' }} />
      </div>
      <div style={{ flex:1, overflow:'auto' }}>
        {filteredContacts.map(c => (
          <div key={c.id} onClick={()=>{
            const ex=chats.find(ch=>ch.otherPhones?.includes(c.contact_phone));
            if(ex)openChat(ex); else{setNewTo(c.contact_phone);setActiveChat({id:null,name:c.contact_name,otherPhones:[c.contact_phone]});setMessages([]);setView('chat');}
          }} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 16px', cursor:'pointer' }}>
            <WaAvatar name={c.contact_name} size={46} />
            <div><div style={{ color:C.text, fontSize:16 }}>{c.contact_name}</div><div style={{ color:C.textSec, fontSize:13 }}>{c.contact_phone}</div></div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, padding:'6px 6px 8px', background:C.header }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', background:C.input, borderRadius:24, padding:'8px 14px' }}>
          <input type="text" placeholder="Mensagem" value={inputText} onChange={e=>setInputText(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSend()}
            style={{ background:'transparent', border:'none', outline:'none', color:C.text, fontSize:16, width:'100%', fontFamily:'inherit' }} />
        </div>
        {inputText.trim()&&newTo.trim() && (
          <button onClick={handleSend} style={{...B,width:44,height:44,borderRadius:22,background:C.fabGreen,flexShrink:0}}>{Ic.send}</button>
        )}
      </div>
    </div>
  );

  // ===== CREATE GROUP =====
  if (showCreateGroup) {
    const createGroup = async () => {
      if (!groupName.trim() || groupMembers.length === 0) return;
      const r = await fetchBackend('whatsapp_create_group', { name: groupName.trim(), members: groupMembers.map(m=>m.contact_phone) });
      if (r?.ok) { setShowCreateGroup(false); setGroupName(''); setGroupMembers([]); loadChats(); if(r.chat) openChat(r.chat); }
    };
    const toggleMember = (c) => { if(groupMembers.find(m=>m.id===c.id)) setGroupMembers(p=>p.filter(m=>m.id!==c.id)); else setGroupMembers(p=>[...p,c]); };
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
        <div style={{ padding:'10px 14px', background:C.header, display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>setShowCreateGroup(false)} style={B}>{Ic.back}</button>
          <div><div style={{ color:C.text, fontSize:17, fontWeight:500 }}>Novo grupo</div></div>
        </div>
        <div style={{ padding:'12px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
          <input type="text" placeholder="Nome do grupo" value={groupName} onChange={e=>setGroupName(e.target.value)}
            style={{ width:'100%', background:C.input, border:'none', outline:'none', color:C.text, fontSize:16, padding:'10px 14px', borderRadius:8, fontFamily:'inherit' }} />
          {groupMembers.length > 0 && (
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:8 }}>
              {groupMembers.map(m => (
                <span key={m.id} onClick={()=>toggleMember(m)} style={{ background:C.fabGreen+'22', color:C.greenLight, fontSize:12, padding:'4px 10px', borderRadius:12, cursor:'pointer' }}>
                  {m.contact_name} ✕
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ color:C.textSec, fontSize:13, padding:'8px 16px', fontWeight:500 }}>Adicionar participantes</div>
        <div style={{ flex:1, overflow:'auto' }}>
          {contacts.map(c => {
            const selected = groupMembers.find(m=>m.id===c.id);
            return (
              <div key={c.id} onClick={()=>toggleMember(c)}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 16px', cursor:'pointer', background:selected?C.fabGreen+'08':'transparent' }}>
                <WaAvatar name={c.contact_name} size={42} />
                <div style={{ flex:1 }}>
                  <div style={{ color:C.text, fontSize:15 }}>{c.contact_name}</div>
                  <div style={{ color:C.textSec, fontSize:12 }}>{c.contact_phone}</div>
                </div>
                {selected && <div style={{ width:22, height:22, borderRadius:11, background:C.fabGreen, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>}
              </div>
            );
          })}
        </div>
        {groupMembers.length > 0 && groupName.trim() && (
          <div style={{ padding:'8px 16px 12px' }}>
            <button onClick={createGroup} style={{ width:'100%', padding:'14px', borderRadius:24, border:'none', cursor:'pointer', background:C.fabGreen, color:'#fff', fontSize:16, fontWeight:600 }}>
              Criar grupo ({groupMembers.length} membros)
            </button>
          </div>
        )}
      </div>
    );
  }

  // ===== CHAT LIST =====
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'14px 16px 8px', background:C.header }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ color:C.text, fontSize:22, fontWeight:700 }}>WhatsApp</span>
          <div style={{ display:'flex', gap:18 }}>
            <button style={B}>{Ic.camera}</button>
            <button onClick={()=>setSearchOpen(!searchOpen)} style={B}>{Ic.search}</button>
            <button style={B}>{Ic.dots}</button>
          </div>
        </div>
        {/* Search */}
        {searchOpen && (
          <div style={{ display:'flex', alignItems:'center', background:C.search, borderRadius:8, padding:'6px 12px', marginBottom:8, gap:8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSec} strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            <input type="text" placeholder="Pesquisar..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} autoFocus
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:15, fontFamily:'inherit' }} />
          </div>
        )}
        {/* Tabs */}
        <div style={{ display:'flex', gap:8 }}>
          {[{id:'all',label:'Todas'},{id:'unread',label:'Não lidas'},{id:'groups',label:'Grupos'}].map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              padding:'5px 14px', borderRadius:16, border:'none', cursor:'pointer', fontSize:13, fontWeight:500,
              background:activeTab===t.id?C.fabGreen+'22':C.search, color:activeTab===t.id?C.greenLight:C.textSec,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Chats */}
      <div style={{ flex:1, overflow:'auto' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
            <div style={{ width:24, height:24, border:`2px solid ${C.sep}`, borderTopColor:C.greenLight, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : filteredChats.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:C.textSec }}>
            <div style={{ fontSize:40, marginBottom:8 }}>💬</div>
            <div style={{ fontSize:14 }}>Nenhuma conversa</div>
          </div>
        ) : filteredChats.map(chat => (
          <div key={chat.id} onClick={()=>openChat(chat)}
            style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', cursor:'pointer', borderBottom:`0.5px solid ${C.sep}08` }}>
            <WaAvatar name={chat.name||chat.otherPhones?.[0]} size={50} isGroup={chat.is_group} />
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                <span style={{ color:C.text, fontSize:16, fontWeight:500 }}>{chat.name||chat.otherPhones?.[0]||'Chat'}</span>
                <span style={{ color:chat.unreadCount>0?C.unread:C.textSec, fontSize:12 }}>{formatTime(chat.lastMessageAt)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, flex:1, overflow:'hidden' }}>
                  {chat.lastSender===myPhone && <span style={{ flexShrink:0 }}>{Ic.tick2(chat.unreadCount>0?C.textSec:C.blue)}</span>}
                  <span style={{ color:C.textSec, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {chat.is_group && chat.lastSender && chat.lastSender !== myPhone ? `${chat.lastSenderName||chat.lastSender}: ` : ''}
                    {chat.lastMessage||'...'}
                  </span>
                </div>
                {chat.unreadCount > 0 && (
                  <span style={{
                    background:C.unread, color:'#111B21', fontSize:11, fontWeight:700,
                    minWidth:20, height:20, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'0 5px', marginLeft:8, flexShrink:0,
                  }}>{chat.unreadCount}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={()=>{ if(activeTab==='groups'){setShowCreateGroup(true);} else {setNewTo('');setView('new');} }} style={{
        position:'absolute', bottom:16, right:16, width:54, height:54, borderRadius:16,
        background:C.fabGreen, border:'none', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 2px 10px rgba(0,0,0,0.3)',
      }}>{Ic.newChat}</button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

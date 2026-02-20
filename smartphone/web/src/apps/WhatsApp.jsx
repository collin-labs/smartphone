import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { fetchBackend, fetchClient } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// ============================================================
// WhatsApp App — Visual V0 pixel-perfect + Backend FiveM
// Views: conversations | chat | newChat | createGroup
// ============================================================

// ===== SVG Icons (100% V0) =====
const BackArrow = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#00A884" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const SearchSVG = ({ color = "#AEBAC1" }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const MoreVert = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="#AEBAC1">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
);
const PhoneCallIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#AEBAC1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const VideoCamIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#AEBAC1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const EmojiIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const AttachIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const MicIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const SendIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="#00A884">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);
const CheckDouble = ({ color = "#53BDEB" }) => (
  <svg width={16} height={11} viewBox="0 0 16 11" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 5.5 4 8.5 11 1.5"/><polyline points="5 5.5 8 8.5 15 1.5"/>
  </svg>
);
const CheckSingle = () => (
  <svg width={12} height={11} viewBox="0 0 12 11" fill="none" stroke="#8696A0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 5.5 4 8.5 11 1.5"/>
  </svg>
);
const NewChatFAB = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="#fff">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    <line x1="12" y1="8" x2="12" y2="16" stroke="#00A884" strokeWidth="2"/>
    <line x1="8" y1="12" x2="16" y2="12" stroke="#00A884" strokeWidth="2"/>
  </svg>
);
const CameraIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#AEBAC1" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);
const GroupIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="#fff">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const B = { background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, alignItems: "center", justifyContent: "center" };

// Avatar V0 style
const WaAvatar = ({ name, size = 50, color, isGroup, online }) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: isGroup ? "#00A884" : (color || "#2A3942"),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color: "#fff",
    }}>
      {isGroup ? (
        <svg width={size * 0.48} height={size * 0.48} viewBox="0 0 24 24" fill="#fff"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      ) : (name || "?").charAt(0).toUpperCase()}
    </div>
    {online && (
      <div style={{
        position: "absolute", bottom: 1, right: 1,
        width: 12, height: 12, borderRadius: "50%",
        background: "#00A884", border: "2px solid #111B21",
      }} />
    )}
  </div>
);

// ===== Helpers =====
const formatTime = (d) => { if (!d) return ""; return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); };
const formatDay = (d) => { if (!d) return ""; const dt = new Date(d); const now = new Date(); const diff = Math.floor((now - dt) / 86400000); if (diff === 0) return "HOJE"; if (diff === 1) return "ONTEM"; return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }); };

const AVATAR_COLORS = ["#E1306C", "#F77737", "#C13584", "#405DE6", "#833AB4", "#FD1D1D", "#128C7E", "#607D8B", "#795548", "#00A884"];
const getColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

// ===== MAIN COMPONENT =====
export default function WhatsApp({ onNavigate, params }) {
  const [view, setView] = useState("conversations");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myPhone, setMyPhone] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [contacts, setContacts] = useState([]);
  const [newTo, setNewTo] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const messagesEndRef = useRef(null);

  // ===== Backend =====
  const loadChats = useCallback(async () => {
    setLoading(true);
    const r = await fetchBackend('whatsapp_chats');
    if (r?.chats) setChats(r.chats);
    const s = await fetchBackend('getSettings');
    if (s?.phone) setMyPhone(s.phone);
    setLoading(false);
  }, []);

  useEffect(() => { loadChats(); }, [loadChats]);
  useEffect(() => { if (params?.to) { setNewTo(params.to); setView('newChat'); } }, [params]);
  useEffect(() => { if (view === 'newChat' || showCreateGroup) fetchBackend('contacts_list').then(r => { if (r?.contacts) setContacts(r.contacts); }); }, [view, showCreateGroup]);

  const openChat = useCallback(async (chat) => {
    setActiveChat(chat); setView("chat"); setMessages([]);
    const r = await fetchBackend('whatsapp_messages', { chatId: chat.id });
    if (r?.messages) setMessages(r.messages);
    if (chat.unreadCount > 0) {
      fetchBackend('whatsapp_mark_read', { chatId: chat.id });
      setChats(p => p.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
    }
  }, []);

  const deleteChat = async (chatId) => {
    const r = await fetchBackend('whatsapp_delete_chat', { chatId });
    if (r?.ok) { setChats(p => p.filter(x => x.id !== chatId)); if (activeChat?.id === chatId) { setActiveChat(null); setView('conversations'); } }
  };

  const handleSend = useCallback(async () => {
    const text = inputText.trim(); if (!text) return; setInputText('');
    if (view === 'newChat') {
      const to = newTo.trim(); if (!to) return;
      const r = await fetchBackend('whatsapp_send', { to, message: text });
      if (r?.ok && r?.message) { setActiveChat({ id: r.message.chatId, name: to, otherPhones: [to] }); setMessages([r.message]); setView('chat'); loadChats(); }
      return;
    }
    if (!activeChat) return;
    const opt = { id: Date.now(), sender_phone: myPhone, message: text, type: 'text', is_read: 0, created_at: new Date().toISOString(), _pending: true };
    setMessages(p => [...p, opt]);
    const r = await fetchBackend('whatsapp_send', { chatId: activeChat.id, message: text });
    if (r?.ok && r?.message) setMessages(p => p.map(m => m.id === opt.id ? { ...r.message, _pending: false } : m));
  }, [inputText, activeChat, view, newTo, myPhone, loadChats]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  usePusherEvent('WHATSAPP_MESSAGE', useCallback((d) => {
    if (activeChat && d.chatId === activeChat.id) {
      setMessages(p => { if (p.find(m => m.id === d.id)) return p; return [...p, d]; });
      fetchBackend('whatsapp_mark_read', { chatId: activeChat.id });
    } else {
      setChats(p => {
        const e = p.find(c => c.id === d.chatId);
        if (e) return p.map(c => c.id === d.chatId ? { ...c, lastMessage: d.message, lastMessageAt: d.created_at, lastSender: d.sender_phone, unreadCount: (c.unreadCount || 0) + 1 } : c);
        loadChats(); return p;
      });
    }
  }, [activeChat, loadChats]));

  usePusherEvent('WHATSAPP_READ', useCallback((d) => {
    if (activeChat && d.chatId === activeChat.id) setMessages(p => p.map(m => ({ ...m, is_read: 1 })));
  }, [activeChat]));

  const filteredChats = useMemo(() => {
    let result = chats;
    if (activeTab === 'unread') result = result.filter(c => c.unreadCount > 0);
    else if (activeTab === 'groups') result = result.filter(c => c.is_group);
    if (searchText.trim()) { const q = searchText.toLowerCase(); result = result.filter(c => (c.name || '').toLowerCase().includes(q) || (c.lastMessage || '').toLowerCase().includes(q)); }
    return result;
  }, [chats, searchText, activeTab]);

  const filteredContacts = useMemo(() => {
    if (!newTo.trim()) return contacts;
    const q = newTo.toLowerCase();
    return contacts.filter(c => c.contact_name.toLowerCase().includes(q) || c.contact_phone.includes(q));
  }, [contacts, newTo]);

  // ============================================================
  // CREATE GROUP (estilo V0)
  // ============================================================
  if (showCreateGroup) {
    const createGroup = async () => {
      if (!groupName.trim() || groupMembers.length === 0) return;
      const r = await fetchBackend('whatsapp_create_group', { name: groupName.trim(), members: groupMembers.map(m => m.contact_phone) });
      if (r?.ok) { setShowCreateGroup(false); setGroupName(''); setGroupMembers([]); loadChats(); if (r.chat) openChat(r.chat); }
    };
    const toggleMember = (c) => { if (groupMembers.find(m => m.id === c.id)) setGroupMembers(p => p.filter(m => m.id !== c.id)); else setGroupMembers(p => [...p, c]); };

    return (
      <div style={{ width: "100%", height: "100%", background: "#111B21", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 16, background: "#1F2C34" }}>
          <button onClick={() => setShowCreateGroup(false)} style={B}><BackArrow /></button>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#E9EDEF", fontSize: 18, fontWeight: 600 }}>Novo grupo</div>
          </div>
        </div>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(134,150,160,0.08)" }}>
          <input type="text" placeholder="Nome do grupo" value={groupName} onChange={e => setGroupName(e.target.value)}
            style={{ width: "100%", background: "#2A3942", border: "none", outline: "none", color: "#E9EDEF", fontSize: 16, padding: "10px 14px", borderRadius: 8, fontFamily: "inherit", boxSizing: "border-box" }} />
          {groupMembers.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
              {groupMembers.map(m => (
                <span key={m.id} onClick={() => toggleMember(m)} style={{ background: "rgba(0,168,132,0.15)", color: "#00A884", fontSize: 12, padding: "4px 10px", borderRadius: 12, cursor: "pointer" }}>
                  {m.contact_name} ✕
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "8px 16px", color: "#00A884", fontSize: 14, fontWeight: 500 }}>Adicionar participantes</div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {contacts.map(c => {
            const selected = groupMembers.find(m => m.id === c.id);
            return (
              <div key={c.id} onClick={() => toggleMember(c)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", cursor: "pointer",
                background: selected ? "rgba(0,168,132,0.05)" : "transparent",
              }}>
                <WaAvatar name={c.contact_name} size={42} color={getColor(c.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#E9EDEF", fontSize: 15 }}>{c.contact_name}</div>
                  <div style={{ color: "#8696A0", fontSize: 12 }}>{c.contact_phone}</div>
                </div>
                {selected && <div style={{ width: 22, height: 22, borderRadius: 11, background: "#00A884", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </div>}
              </div>
            );
          })}
        </div>
        {groupMembers.length > 0 && groupName.trim() && (
          <div style={{ padding: "8px 16px 12px" }}>
            <button onClick={createGroup} style={{ width: "100%", padding: "14px", borderRadius: 24, border: "none", cursor: "pointer", background: "#00A884", color: "#fff", fontSize: 16, fontWeight: 600 }}>
              Criar grupo ({groupMembers.length} membros)
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // NEW CHAT VIEW (V0)
  // ============================================================
  if (view === "newChat") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#111B21", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 16, background: "#1F2C34" }}>
          <button onClick={() => setView("conversations")} style={B}><BackArrow /></button>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#E9EDEF", fontSize: 18, fontWeight: 600 }}>Nova conversa</div>
            <div style={{ color: "#8696A0", fontSize: 13 }}>{contacts.length} contatos</div>
          </div>
          <SearchSVG />
        </div>
        <div style={{ padding: "8px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#1F2C34", borderRadius: 8, padding: "8px 12px" }}>
            <SearchSVG color="#8696A0" />
            <input placeholder="Pesquisar contatos" value={newTo} onChange={e => setNewTo(e.target.value)} autoFocus
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#E9EDEF", fontSize: 15 }} />
          </div>
        </div>
        {/* New group option */}
        <div onClick={() => { setShowCreateGroup(true); setView("conversations"); }} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 16, cursor: "pointer" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#00A884", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GroupIcon />
          </div>
          <span style={{ color: "#E9EDEF", fontSize: 16, fontWeight: 500 }}>Novo grupo</span>
        </div>
        {/* Contacts list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "8px 16px", color: "#00A884", fontSize: 14, fontWeight: 500 }}>Contatos no WhatsApp</div>
          {filteredContacts.map((contact) => (
            <button key={contact.id} onClick={() => {
              const ex = chats.find(ch => ch.otherPhones?.includes(contact.contact_phone));
              if (ex) openChat(ex);
              else { setNewTo(contact.contact_phone); setActiveChat({ id: null, name: contact.contact_name, otherPhones: [contact.contact_phone] }); setMessages([]); setView("chat"); }
            }} style={{
              display: "flex", alignItems: "center", width: "100%", padding: "10px 16px", gap: 14,
              background: "none", border: "none", cursor: "pointer", textAlign: "left",
            }}>
              <WaAvatar name={contact.contact_name} size={44} color={getColor(contact.id)} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#E9EDEF", fontSize: 16, fontWeight: 500 }}>{contact.contact_name}</div>
                <div style={{ color: "#8696A0", fontSize: 13, marginTop: 2 }}>{contact.contact_phone}</div>
              </div>
            </button>
          ))}
        </div>
        {/* Input for direct number */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, padding: "6px 8px", background: "#1F2C34", flexShrink: 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#2A3942", borderRadius: 24, padding: "8px 14px" }}>
            <input type="text" placeholder="Mensagem" value={inputText} onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ background: "transparent", border: "none", outline: "none", color: "#E9EDEF", fontSize: 16, width: "100%", fontFamily: "inherit" }} />
          </div>
          {inputText.trim() && newTo.trim() && (
            <button onClick={handleSend} style={{ ...B, width: 44, height: 44, borderRadius: 22, background: "#00A884", flexShrink: 0 }}><SendIcon /></button>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // CHAT VIEW (V0 visual)
  // ============================================================
  if (view === "chat" && activeChat) {
    return (
      <div style={{
        width: "100%", height: "100%", background: "#0B141A",
        display: "flex", flexDirection: "column",
        backgroundImage: "radial-gradient(circle at 20% 50%, rgba(0,168,132,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,168,132,0.03) 0%, transparent 50%)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 8px", background: "#1F2C34", gap: 8, flexShrink: 0 }}>
          <button onClick={() => { setView("conversations"); setActiveChat(null); loadChats(); }} style={B}><BackArrow /></button>
          <WaAvatar name={activeChat.name || activeChat.otherPhones?.[0]} size={36} color={getColor(activeChat.id)} isGroup={activeChat.is_group} />
          <div style={{ flex: 1, marginLeft: 4 }}>
            <div style={{ color: "#E9EDEF", fontSize: 16, fontWeight: 600 }}>{activeChat.name || activeChat.otherPhones?.[0] || "Chat"}</div>
            <div style={{ color: activeChat.is_group ? "#8696A0" : "#00A884", fontSize: 12 }}>
              {activeChat.is_group ? `${activeChat.memberCount || ""} membros` : "online"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <VideoCamIcon />
            <button onClick={() => onNavigate?.('phone', { number: activeChat.otherPhones?.[0] })} style={B}><PhoneCallIcon /></button>
            <MoreVert />
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {messages.map((msg, i) => {
            const isMe = msg.sender_phone === myPhone;
            const showDay = i === 0 || formatDay(msg.created_at) !== formatDay(messages[i - 1]?.created_at);
            return (
              <div key={msg.id}>
                {showDay && (
                  <div style={{ alignSelf: "center", padding: "4px 12px", borderRadius: 8, background: "rgba(31,44,52,0.9)", color: "#8696A0", fontSize: 12, margin: "8px auto", textAlign: "center", width: "fit-content" }}>
                    {formatDay(msg.created_at)}
                  </div>
                )}
                <div style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%", background: isMe ? "#005C4B" : "#1F2C34", padding: "6px 8px 4px", borderRadius: isMe ? "8px 0 8px 8px" : "0 8px 8px 8px", marginBottom: 2, opacity: msg._pending ? 0.5 : 1 }}>
                  {activeChat.is_group && !isMe && (
                    <div style={{ color: "#00A884", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{msg.sender_name || msg.sender_phone}</div>
                  )}
                  <span style={{ color: "#E9EDEF", fontSize: 14.2, lineHeight: 1.35, wordBreak: "break-word" }}>{msg.message}</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 2 }}>
                    <span style={{ color: "rgba(134,150,160,0.8)", fontSize: 11 }}>{formatTime(msg.created_at)}</span>
                    {isMe && (msg.is_read ? <CheckDouble color="#53BDEB" /> : <CheckDouble color="#8696A0" />)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar (V0) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "#1F2C34", flexShrink: 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#2A3942", borderRadius: 24, padding: "6px 12px" }}>
            <EmojiIcon />
            <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Mensagem" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#E9EDEF", fontSize: 15 }} />
            <AttachIcon />
          </div>
          {inputText.trim() ? (
            <button onClick={handleSend} style={{ width: 44, height: 44, borderRadius: "50%", background: "#00A884", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><SendIcon /></button>
          ) : (
            <button style={{ width: 44, height: 44, borderRadius: "50%", background: "#00A884", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><MicIcon /></button>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // CONVERSATIONS VIEW (default — 100% V0)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#111B21", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#1F2C34", flexShrink: 0 }}>
        <span style={{ color: "#E9EDEF", fontSize: 22, fontWeight: 700 }}>WhatsApp</span>
        <div style={{ display: "flex", gap: 20 }}>
          <button style={B}><CameraIcon /></button>
          <button onClick={() => setSearchOpen(!searchOpen)} style={B}><SearchSVG /></button>
          <button style={B}><MoreVert /></button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div style={{ padding: "8px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#1F2C34", borderRadius: 8, padding: "8px 12px" }}>
            <SearchSVG color="#8696A0" />
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Pesquisar" autoFocus
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#E9EDEF", fontSize: 15 }} />
          </div>
        </div>
      )}

      {/* Filter chips (V0) */}
      <div style={{ display: "flex", gap: 8, padding: "4px 16px 8px", flexShrink: 0 }}>
        {[{ id: "all", label: "Todas" }, { id: "unread", label: "Nao lidas" }, { id: "groups", label: "Grupos" }].map((filter) => (
          <button key={filter.id} onClick={() => setActiveTab(filter.id)} style={{
            padding: "6px 14px", borderRadius: 16,
            background: activeTab === filter.id ? "#00A884" : "#1F2C34",
            border: "none", color: activeTab === filter.id ? "#111B21" : "#8696A0",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Conversations list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
            <div style={{ width: 24, height: 24, border: "2px solid #222D34", borderTopColor: "#00A884", borderRadius: "50%", animation: "waSpin 0.8s linear infinite" }} />
          </div>
        ) : filteredChats.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#8696A0" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 14 }}>Nenhuma conversa</div>
          </div>
        ) : filteredChats.map((conv) => (
          <button key={conv.id} onClick={() => openChat(conv)} style={{
            display: "flex", alignItems: "center", width: "100%", padding: "10px 16px", gap: 14,
            background: "none", border: "none", cursor: "pointer", textAlign: "left",
            borderBottom: "1px solid rgba(134,150,160,0.08)",
          }}>
            <WaAvatar name={conv.name || conv.otherPhones?.[0]} size={50} color={getColor(conv.id)} isGroup={conv.is_group} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#E9EDEF", fontSize: 16, fontWeight: 500 }}>{conv.name || conv.otherPhones?.[0] || "Chat"}</span>
                <span style={{ color: conv.unreadCount > 0 ? "#00A884" : "#8696A0", fontSize: 12 }}>{formatTime(conv.lastMessageAt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                <span style={{ color: "#8696A0", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                  {conv.is_group && conv.lastSender && conv.lastSender !== myPhone ? `${conv.lastSenderName || conv.lastSender}: ` : ""}
                  {conv.lastMessage || "..."}
                </span>
                {conv.unreadCount > 0 && (
                  <div style={{ minWidth: 20, height: 20, borderRadius: 10, background: "#00A884", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", flexShrink: 0 }}>
                    <span style={{ color: "#111B21", fontSize: 11, fontWeight: 700 }}>{conv.unreadCount}</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FAB (V0) */}
      <button onClick={() => { if (activeTab === 'groups') { setShowCreateGroup(true); } else { setNewTo(''); setView('newChat'); } }} style={{
        position: "absolute", bottom: 20, right: 16,
        width: 56, height: 56, borderRadius: 16,
        background: "#00A884", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}>
        <NewChatFAB />
      </button>

      <style>{`@keyframes waSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

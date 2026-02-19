import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// ============================================
// CORES WhatsApp Dark
// ============================================

const C = {
  bg: '#111B21',
  header: '#1F2C34',
  chatBg: '#0B141A',
  bubbleMe: '#005C4B',
  bubbleOther: '#202C33',
  text: '#E9EDEF',
  textSec: '#8696A0',
  green: '#25D366',
  greenLight: '#00A884',
  blue: '#53BDEB',    // tick azul
  separator: '#222D34',
  inputBg: '#2A3942',
  searchBg: '#202C33',
  unread: '#25D366',
};

// ============================================
// ICONS SVG
// ============================================

const Icons = {
  back: (
    <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
      <path d="M9 1L1.5 8.5L9 16" stroke={C.greenLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textSec}>
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  send: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={C.greenLight}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  ),
  newChat: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={C.greenLight}>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM11 5h2v4h4v2h-4v4h-2v-4H7V9h4V5z"/>
    </svg>
  ),
  tick1: (color = C.textSec) => (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
      <path d="M11.07 0.73L4.82 6.98 2.4 4.56 1 5.97 4.82 9.78 12.48 2.12 11.07 0.73Z" fill={color}/>
    </svg>
  ),
  tick2: (color = C.textSec) => (
    <svg width="20" height="11" viewBox="0 0 20 11" fill="none">
      <path d="M15.07 0.73L8.82 6.98 7.4 5.56 6 6.97 8.82 9.78 16.48 2.12 15.07 0.73Z" fill={color}/>
      <path d="M11.07 0.73L4.82 6.98 3.4 5.56 2 6.97 4.82 9.78 12.48 2.12 11.07 0.73Z" fill={color}/>
    </svg>
  ),
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function WhatsApp({ onNavigate, params }) {
  const [view, setView] = useState('list'); // list | chat | new
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myPhone, setMyPhone] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // New message
  const [newTo, setNewTo] = useState('');
  const [contacts, setContacts] = useState([]);

  // Chat input
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // ============================================
  // Init
  // ============================================

  const loadChats = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('whatsapp_chats');
    if (res?.chats) setChats(res.chats);
    const settings = await fetchBackend('getSettings');
    if (settings?.phone) setMyPhone(settings.phone);
    setLoading(false);
  }, []);

  useEffect(() => { loadChats(); }, [loadChats]);

  useEffect(() => {
    if (params?.to) {
      setNewTo(params.to);
      setView('new');
    }
  }, [params]);

  useEffect(() => {
    if (view === 'new') {
      fetchBackend('contacts_list').then(res => {
        if (res?.contacts) setContacts(res.contacts);
      });
    }
  }, [view]);

  // ============================================
  // Open chat
  // ============================================

  const openChat = useCallback(async (chat) => {
    setActiveChat(chat);
    setView('chat');
    setMessages([]);

    const res = await fetchBackend('whatsapp_messages', { chatId: chat.id });
    if (res?.messages) setMessages(res.messages);

    if (chat.unreadCount > 0) {
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
    }
  }, []);

  // ============================================
  // Send
  // ============================================

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    if (view === 'new') {
      const to = newTo.trim();
      if (!to) return;
      const res = await fetchBackend('whatsapp_send', { to, message: text });
      if (res?.ok && res?.message) {
        const chatId = res.message.chatId;
        setActiveChat({ id: chatId, name: to, otherPhones: [to] });
        setMessages([res.message]);
        setView('chat');
        loadChats();
      }
      return;
    }

    if (!activeChat) return;

    const optimistic = {
      id: Date.now(),
      sender_phone: myPhone,
      message: text,
      type: 'text',
      is_read: 0,
      created_at: new Date().toISOString(),
      _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);

    const res = await fetchBackend('whatsapp_send', { chatId: activeChat.id, message: text });
    if (res?.ok && res?.message) {
      setMessages(prev => prev.map(m =>
        m.id === optimistic.id ? { ...res.message, _pending: false } : m
      ));
    }
  }, [inputText, activeChat, view, newTo, myPhone, loadChats]);

  // ============================================
  // Auto-scroll
  // ============================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================
  // PUSHER
  // ============================================

  usePusherEvent('WHATSAPP_MESSAGE', useCallback((data) => {
    if (activeChat && data.chatId === activeChat.id) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      fetchBackend('whatsapp_mark_read', { chatId: activeChat.id });
    } else {
      setChats(prev => {
        const exists = prev.find(c => c.id === data.chatId);
        if (exists) {
          return prev.map(c => c.id === data.chatId ? {
            ...c,
            lastMessage: data.message,
            lastMessageAt: data.created_at,
            lastSender: data.sender_phone,
            unreadCount: (c.unreadCount || 0) + 1,
          } : c);
        }
        loadChats();
        return prev;
      });
    }
  }, [activeChat, loadChats]));

  usePusherEvent('WHATSAPP_READ', useCallback((data) => {
    if (activeChat && data.chatId === activeChat.id) {
      setMessages(prev => prev.map(m => ({ ...m, is_read: 1 })));
    }
  }, [activeChat]));

  // ============================================
  // Helpers
  // ============================================

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter(c => c.name?.toLowerCase().includes(q));
  }, [searchQuery, chats]);

  const filteredContacts = useMemo(() => {
    if (!newTo) return contacts;
    const q = newTo.toLowerCase();
    return contacts.filter(c =>
      c.contact_name.toLowerCase().includes(q) || c.contact_phone.includes(q)
    );
  }, [newTo, contacts]);

  // Tick component
  const Tick = ({ isMe, isRead }) => {
    if (!isMe) return null;
    const color = isRead ? C.blue : C.textSec;
    return <span style={{ marginLeft: 4, display: 'inline-flex' }}>{Icons.tick2(color)}</span>;
  };

  // ============================================
  // VIEW: Chat List
  // ============================================

  if (view === 'list') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px 8px', background: C.header,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: C.text, fontSize: 22, fontWeight: 700 }}>WhatsApp</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={() => setSearchOpen(!searchOpen)} style={btnStyle}>{Icons.search}</button>
            <button onClick={() => { setNewTo(''); setView('new'); }} style={btnStyle}>{Icons.newChat}</button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ padding: '8px 12px', background: C.header }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.searchBg, borderRadius: 8, padding: '6px 12px',
            }}>
              {Icons.search}
              <input
                type="text"
                placeholder="Pesquisar"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: C.text, fontSize: 15, flex: 1, fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        )}

        {/* Chat list */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Carregando...</div>
          ) : filteredChats.length === 0 ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40, fontSize: 15 }}>
              {searchQuery ? 'Nenhum resultado' : 'Nenhuma conversa'}
            </div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => openChat(chat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', borderBottom: `0.5px solid ${C.separator}`,
                  cursor: 'pointer',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 50, height: 50, borderRadius: 25, background: '#2A3942', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 22, color: '#8696A0' }}>
                    {chat.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: C.text, fontSize: 16, fontWeight: 400 }}>{chat.name}</span>
                    <span style={{
                      color: chat.unreadCount > 0 ? C.unread : C.textSec,
                      fontSize: 12, flexShrink: 0, marginLeft: 8,
                    }}>
                      {formatTime(chat.lastMessageAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    {/* Tick do último msg se fui eu */}
                    {chat.lastSender === myPhone && (
                      <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                        {Icons.tick2(chat.lastIsRead ? C.blue : C.textSec)}
                      </span>
                    )}
                    <span style={{
                      color: C.textSec, fontSize: 14, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }}>
                      {chat.lastMessage || 'Sem mensagens'}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span style={{
                        background: C.unread, color: '#111B21', fontSize: 11, fontWeight: 700,
                        borderRadius: 10, padding: '2px 6px', minWidth: 20, textAlign: 'center',
                      }}>
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div style={{ height: 60 }} />
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: Chat
  // ============================================

  if (view === 'chat' && activeChat) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.chatBg }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
          background: C.header, flexShrink: 0,
        }}>
          <button onClick={() => { setView('list'); loadChats(); }} style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
            {Icons.back}
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: 18, background: '#2A3942',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 16, color: '#8696A0' }}>
              {activeChat.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.text, fontSize: 16, fontWeight: 500 }}>{activeChat.name}</div>
            <div style={{ color: C.textSec, fontSize: 12 }}>online</div>
          </div>
          {/* Phone + Video buttons */}
          <button onClick={() => onNavigate?.('phone', { dial: activeChat.otherPhones?.[0] })} style={btnStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={C.textSec}>
              <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </button>
        </div>

        {/* WhatsApp pattern background + Messages */}
        <div style={{
          flex: 1, overflow: 'auto', padding: '8px 12px',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${C.chatBg.replace('#', '')}' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: C.chatBg,
        }}>
          {messages.map((msg, i) => {
            const isMe = msg.sender_phone === myPhone;
            const showTime = i === 0 ||
              (new Date(msg.created_at) - new Date(messages[i-1]?.created_at)) > 300000;

            return (
              <div key={msg.id}>
                {showTime && (
                  <div style={{ textAlign: 'center', margin: '10px 0 6px' }}>
                    <span style={{
                      background: '#1D2A30', color: C.textSec, fontSize: 11,
                      padding: '4px 12px', borderRadius: 8,
                    }}>
                      {formatMsgTime(msg.created_at)}
                    </span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: 2,
                }}>
                  <div style={{
                    maxWidth: '78%', position: 'relative',
                    background: isMe ? C.bubbleMe : C.bubbleOther,
                    borderRadius: 8,
                    borderTopRightRadius: isMe ? 0 : 8,
                    borderTopLeftRadius: isMe ? 8 : 0,
                    padding: '6px 8px 4px',
                    opacity: msg._pending ? 0.5 : 1,
                  }}>
                    <span style={{
                      color: C.text, fontSize: 14.5, lineHeight: 1.35, wordBreak: 'break-word',
                    }}>
                      {msg.message}
                    </span>
                    {/* Time + tick */}
                    <span style={{
                      float: 'right', display: 'flex', alignItems: 'center',
                      marginLeft: 8, marginTop: 2, gap: 2,
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                        {formatMsgTime(msg.created_at)}
                      </span>
                      <Tick isMe={isMe} isRead={msg.is_read} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          padding: '6px 8px 10px', background: C.header,
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: C.inputBg, borderRadius: 24, padding: '8px 14px',
          }}>
            <input
              type="text"
              placeholder="Mensagem"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: C.text, fontSize: 16, width: '100%', fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{
              ...btnStyle, width: 42, height: 42, borderRadius: 21,
              background: C.greenLight, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
              opacity: inputText.trim() ? 1 : 0.4,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: New Chat
  // ============================================

  if (view === 'new') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{
          padding: '12px 16px 8px', background: C.header,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={() => setView('list')} style={btnStyle}>{Icons.back}</button>
          <span style={{ color: C.text, fontSize: 18, fontWeight: 600 }}>Nova conversa</span>
        </div>

        {/* To field */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderBottom: `0.5px solid ${C.separator}`,
        }}>
          {Icons.search}
          <input
            type="text"
            placeholder="Pesquisar nome ou número"
            value={newTo}
            onChange={e => setNewTo(e.target.value)}
            autoFocus
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: C.text, fontSize: 15, flex: 1, fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Contacts list */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredContacts.map(c => (
            <div
              key={c.id}
              onClick={() => {
                const existing = chats.find(ch => ch.otherPhones?.includes(c.contact_phone));
                if (existing) {
                  openChat(existing);
                } else {
                  setNewTo(c.contact_phone);
                  setActiveChat({ id: null, name: c.contact_name, otherPhones: [c.contact_phone] });
                  setMessages([]);
                  setView('chat');
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', cursor: 'pointer',
                borderBottom: `0.5px solid ${C.separator}`,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 22, background: '#2A3942',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18, color: '#8696A0' }}>
                  {c.contact_name[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <div style={{ color: C.text, fontSize: 16 }}>{c.contact_name}</div>
                <div style={{ color: C.textSec, fontSize: 13 }}>{c.contact_phone}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          padding: '6px 8px 10px', background: C.header,
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: C.inputBg, borderRadius: 24, padding: '8px 14px',
          }}>
            <input
              type="text"
              placeholder="Mensagem"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: C.text, fontSize: 16, width: '100%', fontFamily: 'inherit',
              }}
            />
          </div>
          {inputText.trim() && newTo.trim() && (
            <button onClick={handleSend} style={{
              ...btnStyle, width: 42, height: 42, borderRadius: 21,
              background: C.greenLight, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ============================================
// STYLES
// ============================================

const btnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

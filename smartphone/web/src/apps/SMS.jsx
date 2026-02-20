import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// ============================================
// CORES iMessage
// ============================================

const C = {
  bg: '#000000',
  card: '#1C1C1E',
  bubble_me: '#007AFF',     // azul iMessage
  bubble_other: '#2C2C2E',  // cinza
  text: '#FFFFFF',
  textSec: '#8E8E93',
  separator: '#38383A',
  green: '#30D158',
  red: '#FF3B30',
  inputBg: '#1C1C1E',
};

// ============================================
// ICONS
// ============================================

const Icons = {
  back: (
    <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
      <path d="M9 1L1.5 8.5L9 16" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  compose: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M20.5 3.5L10 14M20.5 3.5L14 21L10 14M20.5 3.5L3 10L10 14" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  send: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#007AFF">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  ),
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SMS({ onNavigate, params }) {
  const [view, setView] = useState('list'); // list | chat | new
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myPhone, setMyPhone] = useState('');

  // New message
  const [newTo, setNewTo] = useState('');
  const [contacts, setContacts] = useState([]);

  // Chat input
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // ============================================
  // Init: carregar conversas
  // ============================================

  const loadConversations = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('sms_conversations');
    if (res?.conversations) setConversations(res.conversations);

    // Pegar meu telefone
    const settings = await fetchBackend('getSettings');
    if (settings?.phone) setMyPhone(settings.phone);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Se veio com params.to (de Contatos), ir direto pra new message
  useEffect(() => {
    if (params?.to) {
      setNewTo(params.to);
      setView('new');
    }
  }, [params]);

  // ============================================
  // Carregar contatos pra autocomplete
  // ============================================

  useEffect(() => {
    if (view === 'new') {
      fetchBackend('contacts_list').then(res => {
        if (res?.contacts) setContacts(res.contacts);
      });
    }
  }, [view]);

  // ============================================
  // Abrir conversa
  // ============================================

  const openConversation = useCallback(async (conv) => {
    setActiveConv(conv);
    setView('chat');
    setMessages([]);

    const res = await fetchBackend('sms_messages', { conversationId: conv.id });
    if (res?.messages) setMessages(res.messages);

    // Marcar como lido
    if (conv.unreadCount > 0) {
      await fetchBackend('sms_mark_read', { conversationId: conv.id });
      setConversations(prev => prev.map(c =>
        c.id === conv.id ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, []);

  // ============================================
  // Enviar mensagem
  // ============================================

  const deleteConversation = async (convId) => { const r=await fetchBackend('sms_delete_conversation',{conversationId:convId}); if(r?.ok){ setConversations(p=>p.filter(x=>x.id!==convId)); if(activeConv?.id===convId){setActiveConv(null);setView('list');} } };

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    setInputText('');

    if (view === 'new') {
      // Enviar pra novo número
      const to = newTo.trim();
      if (!to) return;

      const res = await fetchBackend('sms_send', { to, message: text });
      if (res?.ok && res?.message) {
        // Navegar pra conversa criada
        const convId = res.message.conversationId;
        setActiveConv({
          id: convId,
          name: to,
          otherPhones: [to],
        });
        setMessages([res.message]);
        setView('chat');
        loadConversations(); // Refresh lista
      }
      return;
    }

    if (!activeConv) return;

    // Optimistic: adicionar mensagem local
    const optimistic = {
      id: Date.now(),
      sender_phone: myPhone,
      message: text,
      created_at: new Date().toISOString(),
      _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);

    const res = await fetchBackend('sms_send', {
      conversationId: activeConv.id,
      message: text,
    });

    if (res?.ok && res?.message) {
      // Substituir optimistic pelo real
      setMessages(prev => prev.map(m =>
        m.id === optimistic.id ? { ...res.message, _pending: false } : m
      ));
    }
  }, [inputText, activeConv, view, newTo, myPhone, loadConversations]);

  // ============================================
  // Auto-scroll
  // ============================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================
  // PUSHER: nova mensagem recebida
  // ============================================

  usePusherEvent('SMS_MESSAGE', useCallback((data) => {
    // Se estou na conversa, adicionar mensagem
    if (activeConv && data.conversationId === activeConv.id) {
      setMessages(prev => {
        // Evitar duplicata
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      // Marcar como lido
      fetchBackend('sms_mark_read', { conversationId: activeConv.id });
    } else {
      // Atualizar badge na lista
      setConversations(prev => {
        const exists = prev.find(c => c.id === data.conversationId);
        if (exists) {
          return prev.map(c => c.id === data.conversationId ? {
            ...c,
            lastMessage: data.message,
            lastMessageAt: data.created_at,
            lastSender: data.sender_phone,
            unreadCount: (c.unreadCount || 0) + 1,
          } : c);
        }
        // Nova conversa — reload
        loadConversations();
        return prev;
      });
    }
  }, [activeConv, loadConversations]));

  // ============================================
  // Helpers
  // ============================================

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';

    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Autocomplete contatos
  const filteredContacts = useMemo(() => {
    if (!newTo) return contacts;
    const q = newTo.toLowerCase();
    return contacts.filter(c =>
      c.contact_name.toLowerCase().includes(q) || c.contact_phone.includes(q)
    );
  }, [newTo, contacts]);

  // ============================================
  // HEADER
  // ============================================

  const Header = ({ title, left, right }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px 8px', background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ width: 70, display: 'flex', alignItems: 'center' }}>{left}</div>
      <span style={{ color: C.text, fontSize: 17, fontWeight: 600 }}>{title}</span>
      <div style={{ width: 70, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );

  // ============================================
  // VIEW: Conversation List
  // ============================================

  if (view === 'list') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <Header
          title="Mensagens"
          right={
            <button onClick={() => { setNewTo(''); setView('new'); }} style={btnStyle}>
              {Icons.compose}
            </button>
          }
        />

        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Carregando...</div>
          ) : conversations.length === 0 ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>
              Nenhuma conversa
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => openConversation(conv)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}`,
                  cursor: 'pointer',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: 24, background: '#636366', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 20, color: '#AEAEB2', fontWeight: 300 }}>
                    {conv.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{
                      color: C.text, fontSize: 16,
                      fontWeight: conv.unreadCount > 0 ? 600 : 400,
                    }}>
                      {conv.name}
                    </span>
                    <span style={{ color: C.textSec, fontSize: 14, flexShrink: 0, marginLeft: 8 }}>
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{
                      color: C.textSec, fontSize: 14, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }}>
                      {conv.lastMessage || 'Sem mensagens'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span style={{
                        background: C.bubble_me, color: '#fff', fontSize: 12, fontWeight: 600,
                        borderRadius: 10, padding: '2px 7px', minWidth: 20, textAlign: 'center',
                      }}>
                        {conv.unreadCount}
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

  if (view === 'chat' && activeConv) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <Header
          title={activeConv.name || 'Chat'}
          left={
            <button onClick={() => { setView('list'); loadConversations(); }} style={{ ...btnStyle, gap: 4, display: 'flex', alignItems: 'center' }}>
              {Icons.back}
              <span style={{ color: '#007AFF', fontSize: 17 }}>
                <span style={{ position: 'relative' }}>
                  {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, left: -14,
                      background: C.red, color: '#fff', fontSize: 10, fontWeight: 700,
                      borderRadius: 8, padding: '1px 5px', minWidth: 16, textAlign: 'center',
                    }}>
                      {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
                    </span>
                  )}
                </span>
              </span>
            </button>
          }
        />

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
          {messages.map((msg, i) => {
            const isMe = msg.sender_phone === myPhone;
            const showTime = i === 0 || 
              (new Date(msg.created_at) - new Date(messages[i-1]?.created_at)) > 300000;

            return (
              <div key={msg.id}>
                {showTime && (
                  <div style={{ textAlign: 'center', margin: '12px 0 8px' }}>
                    <span style={{ color: C.textSec, fontSize: 12 }}>
                      {formatMsgTime(msg.created_at)}
                    </span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: 4,
                }}>
                  <div style={{
                    maxWidth: '75%',
                    background: isMe ? C.bubble_me : C.bubble_other,
                    borderRadius: 18,
                    borderBottomRightRadius: isMe ? 4 : 18,
                    borderBottomLeftRadius: isMe ? 18 : 4,
                    padding: '8px 14px',
                    opacity: msg._pending ? 0.6 : 1,
                  }}>
                    <span style={{ color: C.text, fontSize: 16, lineHeight: 1.35, wordBreak: 'break-word' }}>
                      {msg.message}
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
          padding: '8px 12px 12px', background: 'rgba(0,0,0,0.9)',
          borderTop: `0.5px solid ${C.separator}`,
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: C.inputBg, borderRadius: 20, border: '1px solid #3A3A3C',
            padding: '8px 14px',
          }}>
            <input
              type="text"
              placeholder="iMessage"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: C.text, fontSize: 16, width: '100%', fontFamily: 'inherit',
              }}
            />
          </div>
          {inputText.trim() && (
            <button onClick={handleSend} style={{
              ...btnStyle, width: 34, height: 34, borderRadius: 17,
              background: '#007AFF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M3.67 20.4l1.92-7.03H12c.55 0 1-.45 1-1s-.45-1-1-1H5.59L3.67 4.35c-.38-1.38.96-2.62 2.28-2.08l16.95 6.92c1.33.54 1.33 2.42 0 2.96L5.95 19.07c-1.32.54-2.66-.7-2.28-2.08z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: New Message
  // ============================================

  if (view === 'new') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <Header
          title="Nova Mensagem"
          left={
            <button onClick={() => setView('list')} style={btnStyle}>
              <span style={{ color: '#007AFF', fontSize: 17 }}>Cancelar</span>
            </button>
          }
        />

        {/* To field */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderBottom: `0.5px solid ${C.separator}`,
        }}>
          <span style={{ color: C.textSec, fontSize: 16 }}>Para:</span>
          <input
            type="text"
            placeholder="Número ou nome"
            value={newTo}
            onChange={e => setNewTo(e.target.value)}
            autoFocus
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: C.text, fontSize: 16, flex: 1, fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Autocomplete contacts */}
        {newTo && filteredContacts.length > 0 && (
          <div style={{ maxHeight: 200, overflow: 'auto', borderBottom: `0.5px solid ${C.separator}` }}>
            {filteredContacts.map(c => (
              <div
                key={c.id}
                onClick={() => {
                  setNewTo(c.contact_phone);
                  // Verificar se já existe conversa
                  const existing = conversations.find(conv =>
                    conv.otherPhones?.includes(c.contact_phone)
                  );
                  if (existing) {
                    openConversation(existing);
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', cursor: 'pointer',
                  borderBottom: `0.5px solid ${C.separator}`,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 18, background: '#636366',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 16, color: '#AEAEB2' }}>
                    {c.contact_name[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div style={{ color: C.text, fontSize: 15 }}>{c.contact_name}</div>
                  <div style={{ color: C.textSec, fontSize: 13 }}>{c.contact_phone}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          padding: '8px 12px 12px', background: 'rgba(0,0,0,0.9)',
          borderTop: `0.5px solid ${C.separator}`,
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: C.inputBg, borderRadius: 20, border: '1px solid #3A3A3C',
            padding: '8px 14px',
          }}>
            <input
              type="text"
              placeholder="iMessage"
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
              ...btnStyle, width: 34, height: 34, borderRadius: 17,
              background: '#007AFF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M3.67 20.4l1.92-7.03H12c.55 0 1-.45 1-1s-.45-1-1-1H5.59L3.67 4.35c-.38-1.38.96-2.62 2.28-2.08l16.95 6.92c1.33.54 1.33 2.42 0 2.96L5.95 19.07c-1.32.54-2.66-.7-2.28-2.08z"/>
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

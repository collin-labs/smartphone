import React, { useState, useCallback, useRef, useEffect } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// SMS App — Visual V0 pixel-perfect + Backend FiveM
// Telas: list | chat
// V0 layout: 100% preservado | Backend: fetchBackend integrado
// ============================================================

// ---------- Dados fallback (100% V0) ----------
const FALLBACK_CONVERSATIONS = [
  { id: 1, name: "Maria LS", lastMsg: "Te vejo la entao!", time: "14:35", unread: 2, color: "#E1306C" },
  { id: 2, name: "Joao Grau", lastMsg: "Mano, cola aqui", time: "13:20", unread: 0, color: "#F77737" },
  { id: 3, name: "Mae", lastMsg: "Filho, liga pra mim", time: "12:00", unread: 1, color: "#FF6B6B" },
  { id: 4, name: "Pizzaria LS", lastMsg: "Seu pedido foi confirmado", time: "Ontem", unread: 0, color: "#CC0000" },
  { id: 5, name: "Ana Belle", lastMsg: "Kkkk verdade", time: "Ontem", unread: 0, color: "#C13584" },
  { id: 6, name: "Pedro MG", lastMsg: "Tmj irmao", time: "25/01", unread: 0, color: "#405DE6" },
  { id: 7, name: "Operadora", lastMsg: "Voce recebeu 1GB de bonus", time: "24/01", unread: 0, color: "#666" },
  { id: 8, name: "Lari Santos", lastMsg: "Obrigada!!", time: "23/01", unread: 0, color: "#833AB4" },
  { id: 9, name: "5511999", lastMsg: "Codigo de verificacao: 847291", time: "22/01", unread: 0, color: "#444" },
];
const FALLBACK_CHAT = {
  1: [
    { id: 1, from: "them", text: "E ai, vai no rolezinho hoje?", time: "14:20" },
    { id: 2, from: "me", text: "Vo sim! Que horas?", time: "14:22" },
    { id: 3, from: "them", text: "Umas 8h da noite, no Bahama Mamas", time: "14:25" },
    { id: 4, from: "me", text: "Fechou, to dentro", time: "14:28" },
    { id: 5, from: "them", text: "Te vejo la entao!", time: "14:35" },
  ],
  2: [
    { id: 1, from: "them", text: "Fala bro", time: "13:00" },
    { id: 2, from: "me", text: "Fala mano, tranquilo?", time: "13:05" },
    { id: 3, from: "them", text: "Mano, cola aqui", time: "13:20" },
  ],
  3: [
    { id: 1, from: "them", text: "Filho, esta tudo bem?", time: "11:30" },
    { id: 2, from: "me", text: "Ta sim mae, de boa", time: "11:45" },
    { id: 3, from: "them", text: "Filho, liga pra mim", time: "12:00" },
  ],
};

const timeAgo = (d) => {
  if (!d) return "";
  const now = new Date();
  const dt = new Date(d);
  const diff = Math.floor((now - dt) / 86400000);
  if (diff === 0) return dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return "Ontem";
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

export default function SMS({ onNavigate, params }) {
  const [view, setView] = useState("list");
  const [conversations, setConversations] = useState(FALLBACK_CONVERSATIONS);
  const [selectedConvo, setSelectedConvo] = useState(FALLBACK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const chatEndRef = useRef(null);

  // ---------- Backend: carregar conversas ----------
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("sms_conversations");
      if (res?.conversations?.length) {
        setConversations(res.conversations.map((c, i) => ({
          id: c.id || c.phone || i + 1,
          name: c.contact_name || c.phone || "Desconhecido",
          lastMsg: c.last_message || "",
          time: c.updated_at ? timeAgo(c.updated_at) : "",
          unread: c.unread_count || 0,
          color: ["#E1306C", "#F77737", "#FF6B6B", "#CC0000", "#C13584", "#405DE6", "#666", "#833AB4", "#444"][i % 9],
          phone: c.phone || "",
        })));
      }
    })();
  }, []);

  // Auto-open from params (deep link from notifications)
  useEffect(() => {
    if (params?.phone) {
      const convo = conversations.find((c) => c.phone === params.phone);
      if (convo) openChat(convo);
    }
  }, [params]);

  useEffect(() => {
    if (view === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  const openChat = useCallback(async (convo) => {
    setSelectedConvo(convo);
    setView("chat");

    // Backend: carregar msgs
    const res = await fetchBackend("sms_messages", { phone: convo.phone || convo.name, conversationId: convo.id });
    if (res?.messages?.length) {
      setMessages(res.messages.map((m) => ({
        id: m.id,
        from: m.is_mine ? "me" : "them",
        text: m.message || m.text || "",
        time: m.created_at ? new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "",
      })));
    } else {
      // Fallback
      setMessages(FALLBACK_CHAT[convo.id] || [{ id: 1, from: "them", text: convo.lastMsg, time: convo.time }]);
    }

    // Mark as read
    await fetchBackend("sms_mark_read", { phone: convo.phone || convo.name, conversationId: convo.id });
    setConversations((prev) => prev.map((c) => c.id === convo.id ? { ...c, unread: 0 } : c));
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      from: "me",
      text: input.trim(),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    const text = input.trim();
    setInput("");

    // Update last msg in list
    setConversations((prev) => prev.map((c) => c.id === selectedConvo.id ? { ...c, lastMsg: text, time: "agora" } : c));

    // Backend
    await fetchBackend("sms_send", { phone: selectedConvo.phone || selectedConvo.name, message: text, conversationId: selectedConvo.id });
  }, [input, selectedConvo]);

  const filteredConvos = searchQuery
    ? conversations.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  // ============================================================
  // CHAT VIEW (100% V0)
  // ============================================================
  if (view === "chat") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #222", flexShrink: 0 }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: selectedConvo.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{selectedConvo.name.charAt(0)}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{selectedConvo.name}</div>
            <div style={{ color: "#888", fontSize: 11 }}>SMS</div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3"/></svg>
          </button>
        </div>
        {/* Messages (100% V0) */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ textAlign: "center", margin: "8px 0" }}>
            <span style={{ color: "#666", fontSize: 11, background: "#1a1a1a", padding: "4px 12px", borderRadius: 12 }}>Hoje</span>
          </div>
          {messages.map((msg) => (
            <div key={msg.id} style={{ alignSelf: msg.from === "me" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
              <div style={{ padding: "10px 14px", borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.from === "me" ? "#2196F3" : "#2a2a2a", color: "#fff", fontSize: 14, lineHeight: 1.4 }}>{msg.text}</div>
              <div style={{ color: "#666", fontSize: 10, marginTop: 2, textAlign: msg.from === "me" ? "right" : "left" }}>{msg.time}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {/* Input (100% V0) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderTop: "1px solid #222", flexShrink: 0 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="SMS" style={{ flex: 1, padding: "10px 14px", borderRadius: 20, background: "#1a1a1a", border: "1px solid #333", color: "#fff", fontSize: 14, outline: "none" }} />
          <button onClick={sendMessage} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0, opacity: input.trim() ? 1 : 0.3 }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="#2196F3"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // LIST VIEW (default — 100% V0)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Header (100% V0) */}
      <div style={{ padding: "12px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={() => onNavigate?.("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "#2196F3", fontSize: 14, fontWeight: 600 }}>Voltar</button>
          <span style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>Mensagens</span>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        {/* Search (100% V0) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", borderRadius: 10, padding: "8px 12px" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14 }} />
        </div>
      </div>
      {/* Conversations (100% V0) */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredConvos.map((convo) => (
          <button key={convo.id} onClick={() => openChat(convo)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: convo.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{convo.name.charAt(0)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: convo.unread > 0 ? 700 : 500 }}>{convo.name}</span>
                <span style={{ color: convo.unread > 0 ? "#2196F3" : "#666", fontSize: 11, flexShrink: 0 }}>{convo.time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                <span style={{ color: convo.unread > 0 ? "#ccc" : "#888", fontSize: 13, fontWeight: convo.unread > 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{convo.lastMsg}</span>
                {convo.unread > 0 && (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#2196F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{convo.unread}</div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

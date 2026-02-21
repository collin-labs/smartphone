import React, { useState, useCallback, useEffect, useRef } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Discord App — Visual V0 pixel-perfect + Backend FiveM
// Telas: servers | chat | create | members
// V0 layout: 100% preservado | Backend: fetchBackend integrado
// ============================================================

// ---------- Dados fallback (100% V0) ----------
const FALLBACK_SERVERS = [
  { id: 1, name: "Los Santos RP", initials: "LS", color: "#5865F2", members: 2453, online: 847, unread: 12 },
  { id: 2, name: "Policia LSPD", initials: "PD", color: "#57F287", members: 456, online: 123, unread: 3 },
  { id: 3, name: "Mafia Italiana", initials: "MI", color: "#ED4245", members: 189, online: 67, unread: 0 },
  { id: 4, name: "Mecanica Santos", initials: "MS", color: "#FEE75C", members: 78, online: 23, unread: 5 },
  { id: 5, name: "Hospital Central", initials: "HC", color: "#EB459E", members: 234, online: 89, unread: 0 },
  { id: 6, name: "Weazel News", initials: "WN", color: "#5865F2", members: 167, online: 45, unread: 1 },
];
const FALLBACK_CHANNELS = [
  { id: 1, category: "INFORMACAO", channels: [{ id: "rules", name: "regras", type: "text", unread: false }, { id: "announcements", name: "anuncios", type: "text", unread: true }, { id: "welcome", name: "boas-vindas", type: "text", unread: false }] },
  { id: 2, category: "GERAL", channels: [{ id: "general", name: "geral", type: "text", unread: true }, { id: "off-topic", name: "off-topic", type: "text", unread: false }, { id: "memes", name: "memes", type: "text", unread: true }] },
  { id: 3, category: "VOICE", channels: [{ id: "voice-1", name: "Sala 1", type: "voice", unread: false }, { id: "voice-2", name: "Sala 2", type: "voice", unread: false }, { id: "voice-afk", name: "AFK", type: "voice", unread: false }] },
  { id: 4, category: "ROLEPLAY", channels: [{ id: "rp-geral", name: "rp-geral", type: "text", unread: true }, { id: "historias", name: "historias", type: "text", unread: false }, { id: "eventos", name: "eventos", type: "text", unread: true }] },
];
const FALLBACK_MESSAGES = [
  { id: 1, user: "Carlos_RP", color: "#5865F2", content: "Bora fazer aquele evento hoje a noite?", time: "14:32", avatar: "C" },
  { id: 2, user: "Maria_Santos", color: "#EB459E", content: "To dentro! Que horas?", time: "14:33", avatar: "M" },
  { id: 3, user: "Joao_Grau", color: "#57F287", content: "Pode ser as 21h, vou trazer o pessoal da mecanica", time: "14:35", avatar: "J" },
  { id: 4, user: "Ana_Belle", color: "#FEE75C", content: "Alguem sabe se o servidor vai ter update essa semana?", time: "14:38", avatar: "A" },
  { id: 5, user: "Pedro_Silva", color: "#ED4245", content: "Vi no Twitter que vao adicionar umas 5 motos novas", time: "14:40", avatar: "P" },
  { id: 6, user: "Carlos_RP", color: "#5865F2", content: "Serio? Isso vai ser insano! Ja quero a Ducati", time: "14:41", avatar: "C" },
  { id: 7, user: "Lucas_Dev", color: "#57F287", content: "Pessoal, atualizei as regras do canal #rp-geral, da uma olhada", time: "14:45", avatar: "L" },
  { id: 8, user: "Maria_Santos", color: "#EB459E", content: "Beleza, vou ver agora. Alguem mais vem pro evento?", time: "14:47", avatar: "M" },
];
const FALLBACK_MEMBERS = [
  { id: 1, name: "Carlos_RP", status: "online", role: "Admin", color: "#ED4245", activity: "Jogando GTA V" },
  { id: 2, name: "Maria_Santos", status: "online", role: "Mod", color: "#57F287", activity: "Ouvindo Spotify" },
  { id: 3, name: "Joao_Grau", status: "online", role: "Membro", color: "#fff", activity: "" },
  { id: 4, name: "Ana_Belle", status: "idle", role: "Membro", color: "#fff", activity: "" },
  { id: 5, name: "Pedro_Silva", status: "online", role: "Membro", color: "#fff", activity: "Jogando GTA V" },
  { id: 6, name: "Lucas_Dev", status: "dnd", role: "Admin", color: "#ED4245", activity: "VS Code" },
  { id: 7, name: "Fernanda_M", status: "offline", role: "Membro", color: "#fff", activity: "" },
  { id: 8, name: "Thiago_BR", status: "offline", role: "Membro", color: "#fff", activity: "" },
];
const statusColors = { online: "#57F287", idle: "#FEE75C", dnd: "#ED4245", offline: "#80848E" };

export default function Discord({ onNavigate }) {
  const [view, setView] = useState("servers");
  const [servers, setServers] = useState(FALLBACK_SERVERS);
  const [selectedServer, setSelectedServer] = useState(FALLBACK_SERVERS[0]);
  const [channels, setChannels] = useState(FALLBACK_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState("geral");
  const [messageText, setMessageText] = useState("");
  const [chatMessages, setChatMessages] = useState(FALLBACK_MESSAGES);
  const [members, setMembers] = useState(FALLBACK_MEMBERS);
  const [expandedCategories, setExpandedCategories] = useState(new Set([1, 2, 3, 4]));
  const [newServerName, setNewServerName] = useState("Servidor do Carlos");
  const msgEnd = useRef(null);

  // ---------- Backend: carregar servers ----------
  useEffect(() => {
    (async () => {
      const r = await fetchBackend("discord_init");
      if (r?.servers?.length) setServers(r.servers.map((s) => ({ ...s, initials: (s.icon || s.name?.[0]?.toUpperCase() || "?"), color: s.color || "#5865F2", unread: s.unread_count || 0 })));
    })();
  }, []);

  // ---------- Backend: abrir server ----------
  const openServer = useCallback(async (server) => {
    setSelectedServer(server);
    const r = await fetchBackend("discord_server", { serverId: server.id });
    if (r?.channels?.length) {
      const mapped = [{ id: 1, category: "CANAIS", channels: r.channels.map((c) => ({ id: c.id, name: c.name, type: c.type || "text", unread: !!c.unread })) }];
      setChannels(mapped);
    }
    if (r?.members?.length) setMembers(r.members.map((m) => ({ id: m.id, name: m.username || m.name, status: m.status || "online", role: m.role || "Membro", color: m.role_color || "#fff", activity: m.activity || "" })));
  }, []);

  // ---------- Backend: abrir canal ----------
  const openChannel = useCallback(async (channelName, channelId) => {
    setSelectedChannel(channelName);
    setView("chat");
    const r = await fetchBackend("discord_messages", { channelId: channelId || channelName });
    if (r?.messages?.length) {
      setChatMessages(r.messages.map((m) => ({ id: m.id, user: m.username || "?", color: m.role_color || "#5865F2", content: m.message || m.content || "", time: m.created_at ? new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "", avatar: (m.username || "?").charAt(0) })));
    }
  }, []);

  // ---------- Backend: enviar msg ----------
  const sendMessage = useCallback(async () => {
    if (!messageText.trim()) return;
    const newMsg = { id: Date.now(), user: "Voce", color: "#5865F2", content: messageText, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), avatar: "V" };
    setChatMessages((prev) => [...prev, newMsg]);
    const text = messageText;
    setMessageText("");
    await fetchBackend("discord_send", { channelId: selectedChannel, message: text });
  }, [messageText, selectedChannel]);

  // ---------- Backend: criar server ----------
  const createServer = useCallback(async () => {
    if (!newServerName.trim()) return;
    const r = await fetchBackend("discord_create_server", { name: newServerName.trim(), icon: newServerName.trim().charAt(0) });
    if (r?.ok && r?.server) {
      setServers((p) => [...p, { ...r.server, initials: r.server.name?.charAt(0) || "?", color: "#5865F2", unread: 0 }]);
    }
    setNewServerName("");
    setView("servers");
  }, [newServerName]);

  const toggleCategory = useCallback((catId) => {
    setExpandedCategories((prev) => { const next = new Set(prev); if (next.has(catId)) next.delete(catId); else next.add(catId); return next; });
  }, []);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // ============================================================
  // MEMBERS VIEW (100% V0)
  // ============================================================
  if (view === "members") {
    const onlineMembers = members.filter((m) => m.status !== "offline");
    const offlineMembers = members.filter((m) => m.status === "offline");
    return (
      <div style={{ width: "100%", height: "100%", background: "#2B2D31", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1E1F22" }}>
          <button onClick={() => setView("chat")} style={{ background: "none", border: "none", cursor: "pointer", marginRight: 12, display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#B5BAC1" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#F2F3F5", fontSize: 16, fontWeight: 700 }}>Membros</span>
          <span style={{ color: "#80848E", fontSize: 14, marginLeft: 8 }}>{members.length}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "12px 16px 4px" }}><span style={{ color: "#80848E", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>ONLINE — {onlineMembers.length}</span></div>
          {onlineMembers.map((member) => (
            <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", cursor: "pointer" }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{member.name.charAt(0)}</div>
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: statusColors[member.status], border: "3px solid #2B2D31" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: member.color, fontSize: 14, fontWeight: 600 }}>{member.name}</div>
                {member.activity && <div style={{ color: "#80848E", fontSize: 12, marginTop: 1 }}>{member.activity}</div>}
              </div>
              <span style={{ color: "#80848E", fontSize: 10, fontWeight: 600, background: "#1E1F22", padding: "2px 6px", borderRadius: 4 }}>{member.role}</span>
            </div>
          ))}
          <div style={{ padding: "12px 16px 4px" }}><span style={{ color: "#80848E", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>OFFLINE — {offlineMembers.length}</span></div>
          {offlineMembers.map((member) => (
            <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", opacity: 0.5 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{member.name.charAt(0)}</div>
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: statusColors[member.status], border: "3px solid #2B2D31" }} />
              </div>
              <div><div style={{ color: "#80848E", fontSize: 14, fontWeight: 600 }}>{member.name}</div></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // CREATE SERVER VIEW (100% V0)
  // ============================================================
  if (view === "create") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#313338", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", width: "100%", padding: "12px 16px", borderBottom: "1px solid #1E1F22" }}>
          <button onClick={() => setView("servers")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#B5BAC1" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#F2F3F5", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Criar Servidor</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 32px" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: "2px dashed #5865F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <div style={{ color: "#F2F3F5", fontSize: 20, fontWeight: 800, textAlign: "center" }}>Crie seu servidor</div>
          <div style={{ color: "#B5BAC1", fontSize: 14, textAlign: "center", lineHeight: 1.5 }}>Seu servidor e onde voce e seus amigos podem conversar. Crie o seu e comece a falar.</div>
          <div style={{ width: "100%", marginTop: 16 }}>
            <label style={{ color: "#B5BAC1", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, display: "block" }}>NOME DO SERVIDOR</label>
            <input value={newServerName} onChange={(e) => setNewServerName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 4, background: "#1E1F22", border: "none", outline: "none", color: "#F2F3F5", fontSize: 15, boxSizing: "border-box" }} />
          </div>
          <button onClick={createServer} style={{ width: "100%", padding: "12px 0", borderRadius: 4, background: "#5865F2", border: "none", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>Criar Servidor</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // CHAT VIEW (100% V0)
  // ============================================================
  if (view === "chat") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#313338", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #1E1F22", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setView("servers")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#B5BAC1" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#80848E" strokeWidth="2"><path d="M4 11h16M4 11l4-4M4 11l4 4M20 13H4M20 13l-4-4M20 13l-4 4"/></svg>
            <span style={{ color: "#F2F3F5", fontSize: 16, fontWeight: 700 }}>{selectedChannel}</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={() => setView("members")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#B5BAC1" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#B5BAC1" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {chatMessages.map((msg, i) => {
            const showHeader = i === 0 || chatMessages[i - 1].user !== msg.user;
            return (
              <div key={msg.id} style={{ padding: showHeader ? "12px 16px 2px" : "2px 16px 2px 68px", display: "flex", gap: 12 }}>
                {showHeader && (
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: msg.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{msg.avatar}</div>
                )}
                <div style={{ flex: 1 }}>
                  {showHeader && (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                      <span style={{ color: msg.color, fontSize: 15, fontWeight: 600 }}>{msg.user}</span>
                      <span style={{ color: "#80848E", fontSize: 11 }}>{msg.time}</span>
                    </div>
                  )}
                  <div style={{ color: "#DBDEE1", fontSize: 14, lineHeight: 1.4 }}>{msg.content}</div>
                </div>
              </div>
            );
          })}
          <div ref={msgEnd} />
        </div>
        <div style={{ padding: "0 12px 12px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#383A40", borderRadius: 8, padding: "8px 12px" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#B5BAC1" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </button>
            <input value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={`Mensagem #${selectedChannel}`} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#F2F3F5", fontSize: 15 }} />
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#B5BAC1" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // SERVERS VIEW (default — 100% V0)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#1E1F22", display: "flex" }}>
      {/* Server rail */}
      <div style={{ width: 56, background: "#1E1F22", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 4, overflowY: "auto", flexShrink: 0 }}>
        <button onClick={() => onNavigate?.("home")} style={{ width: 44, height: 44, borderRadius: "50%", background: "#313338", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="#5865F2"><path d="M19.73 4.87l-15.5 6.37a.5.5 0 00.01.95l4.78 1.71a.5.5 0 00.45-.07L19.73 4.87zM19.73 4.87L10.5 15.12a.5.5 0 00-.07.45l1.71 4.78a.5.5 0 00.95.01l6.37-15.5z"/></svg>
        </button>
        <div style={{ width: 32, height: 2, borderRadius: 1, background: "#35363C", marginBottom: 4 }} />
        {servers.map((server) => (
          <button key={server.id} onClick={() => { setSelectedServer(server); openServer(server); setView("chat"); }} style={{ width: 44, height: 44, borderRadius: selectedServer.id === server.id ? 14 : "50%", background: server.color, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", transition: "border-radius 0.2s", position: "relative" }}>
            {server.initials || server.name?.charAt(0)}
            {server.unread > 0 && (
              <div style={{ position: "absolute", bottom: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8, background: "#ED4245", border: "3px solid #1E1F22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", padding: "0 4px" }}>{server.unread}</div>
            )}
          </button>
        ))}
        <button onClick={() => setView("create")} style={{ width: 44, height: 44, borderRadius: "50%", background: "#313338", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#57F287" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      {/* Channel list */}
      <div style={{ flex: 1, background: "#2B2D31", display: "flex", flexDirection: "column", borderTopLeftRadius: 8 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E1F22", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#F2F3F5", fontSize: 16, fontWeight: 700 }}>{selectedServer.name}</span>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#B5BAC1" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {channels.map((category) => (
            <div key={category.id}>
              <button onClick={() => toggleCategory(category.id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 8px 4px 4px", background: "none", border: "none", cursor: "pointer", width: "100%" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#80848E" strokeWidth="2" style={{ transform: expandedCategories.has(category.id) ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.15s" }}><polyline points="6 9 12 15 18 9"/></svg>
                <span style={{ color: "#80848E", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{category.category}</span>
              </button>
              {expandedCategories.has(category.id) && category.channels.map((ch) => (
                <button key={ch.id} onClick={() => openChannel(ch.name, ch.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px 6px 16px", width: "100%", background: selectedChannel === ch.name ? "#35363C" : "none", border: "none", cursor: "pointer", borderRadius: 4, margin: "0 4px" }}>
                  {ch.type === "voice" ? (
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#80848E" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  ) : (
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#80848E" strokeWidth="2"><path d="M4 11h16M4 11l4-4M4 11l4 4M20 13H4M20 13l-4-4M20 13l-4 4"/></svg>
                  )}
                  <span style={{ color: ch.unread ? "#F2F3F5" : "#80848E", fontSize: 14, fontWeight: ch.unread ? 600 : 400 }}>{ch.name}</span>
                  {ch.unread && <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#F2F3F5" }} />}
                </button>
              ))}
            </div>
          ))}
        </div>
        {/* User bar (100% V0) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#232428" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>V</div>
            <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: "#57F287", border: "2px solid #232428" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#F2F3F5", fontSize: 13, fontWeight: 600 }}>Carlos_RP</div>
            <div style={{ color: "#80848E", fontSize: 11 }}>Online</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="#B5BAC1"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="#B5BAC1" strokeWidth="2"/><line x1="12" y1="19" x2="12" y2="23" stroke="#B5BAC1" strokeWidth="2"/></svg>
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#B5BAC1" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

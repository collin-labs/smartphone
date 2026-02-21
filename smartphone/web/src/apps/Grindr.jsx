import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Grindr App — Pixel-perfect 2025/2026 dark mode replica
// Telas: grid | profile | chat | editProfile
// Handlers: grindr_init, grindr_open_chat, grindr_save_profile,
//   grindr_send, grindr_tap
// ============================================================

const PROFILES = [
  { id: 1, name: "Lucas", age: 24, distance: "120m", online: true, body: "Definido", height: "1.78m", bio: "Boa vibe sempre", color: "#FF6B35" },
  { id: 2, name: "Matheus", age: 28, distance: "350m", online: true, body: "Musculoso", height: "1.82m", bio: "Gym + chill", color: "#4ECDC4" },
  { id: 3, name: "Rafael", age: 22, distance: "0.5km", online: false, body: "Magro", height: "1.75m", bio: "Rolezeiro", color: "#FF4757" },
  { id: 4, name: "Bruno", age: 31, distance: "0.8km", online: true, body: "Urso", height: "1.85m", bio: "Cerveja artesanal", color: "#7B68EE" },
  { id: 5, name: "Diego", age: 26, distance: "1.2km", online: false, body: "Medio", height: "1.80m", bio: "Discreto", color: "#20BF6B" },
  { id: 6, name: "Pedro", age: 23, distance: "1.5km", online: true, body: "Definido", height: "1.76m", bio: "Surfer vibes", color: "#3867D6" },
  { id: 7, name: "Thiago", age: 29, distance: "2km", online: false, body: "Magro", height: "1.70m", bio: "Fotografo", color: "#E74C3C" },
  { id: 8, name: "Gabriel", age: 25, distance: "2.3km", online: true, body: "Musculoso", height: "1.88m", bio: "Personal trainer", color: "#F39C12" },
  { id: 9, name: "Felipe", age: 27, distance: "3km", online: false, body: "Medio", height: "1.77m", bio: "420 friendly", color: "#8E44AD" },
];

const CHAT_MESSAGES = [
  { id: 1, from: "them", text: "Opa, tudo bem?", time: "14:30" },
  { id: 2, from: "me", text: "Tudo sim! E vc?", time: "14:31" },
  { id: 3, from: "them", text: "De boa, ta fazendo o que?", time: "14:32" },
  { id: 4, from: "me", text: "Nada demais, so em casa", time: "14:33" },
  { id: 5, from: "them", text: "Cola aqui entao", time: "14:35" },
];

const MY_PROFILE = {
  name: "Carlos",
  age: 25,
  body: "Definido",
  height: "1.80m",
  bio: "Boa vibe, sem frescura",
  lookingFor: "Amizade, Encontros",
};

export default function GrindrApp({ onNavigate }) {
  const [view, setView] = useState("grid");
  const [selectedProfile, setSelectedProfile] = useState(PROFILES[0]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [tab, setTab] = useState("explore");
  const [editData, setEditData] = useState(MY_PROFILE);
  const [profiles, setProfiles] = useState(PROFILES);

  // ── grindr_init ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("grindr_init");
      if (res?.profiles?.length) {
        setProfiles(res.profiles.map((p, i) => ({
          id: p.id || i + 1, name: p.name || "?", age: p.age || 25,
          distance: p.distance || "?", online: !!p.online,
          body: p.body || "Medio", height: p.height || "1.75m",
          bio: p.bio || "", color: PROFILES[i % PROFILES.length]?.color || "#FF6B35",
        })));
      }
    })();
  }, []);

  const openProfile = useCallback((p) => {
    setSelectedProfile(p);
    setView("profile");
  }, []);

  // ── grindr_send ──
  const sendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      from: "me",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    await fetchBackend("grindr_send", { to: selectedProfile.id, text: newMsg.text });
  }, [chatInput, messages.length, selectedProfile.id]);

  // ── grindr_open_chat ──
  const openChat = useCallback(async (profile) => {
    setSelectedProfile(profile);
    setView("chat");
    const res = await fetchBackend("grindr_open_chat", { id: profile.id });
    if (res?.messages?.length) {
      setMessages(res.messages.map((m, i) => ({
        id: m.id || i + 1, from: m.from || "them", text: m.text || "", time: m.time || "",
      })));
    }
  }, []);

  // ── grindr_save_profile ──
  const saveProfile = useCallback(async () => {
    await fetchBackend("grindr_save_profile", { ...editData });
    setView("grid");
  }, [editData]);

  // ── grindr_tap ──
  const tapProfile = useCallback(async (profile) => {
    await fetchBackend("grindr_tap", { id: profile.id });
  }, []);

  // ============================================================
  // EDIT PROFILE VIEW
  // ============================================================
  if (view === "editProfile") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 16px",
          borderBottom: "1px solid #222",
        }}>
          <button onClick={() => setView("grid")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12, flex: 1 }}>Editar Perfil</span>
          <button onClick={saveProfile} style={{
            background: "#FFD600", border: "none", borderRadius: 6, padding: "6px 16px",
            color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            Salvar
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {/* Avatar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              width: 100, height: 100, borderRadius: 12,
              background: "linear-gradient(135deg, #FFD600, #FF9500)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#000" }}>
                {editData.name.charAt(0)}
              </span>
              <div style={{
                position: "absolute", bottom: -6, right: -6,
                width: 28, height: 28, borderRadius: "50%",
                background: "#FFD600", border: "3px solid #000",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="#000"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </div>
            </div>
          </div>
          {/* Fields */}
          {[
            { label: "Nome", key: "name" },
            { label: "Idade", key: "age" },
            { label: "Corpo", key: "body" },
            { label: "Altura", key: "height" },
            { label: "Bio", key: "bio" },
            { label: "Procurando", key: "lookingFor" },
          ].map((field) => (
            <div key={field.key} style={{ marginBottom: 16 }}>
              <div style={{ color: "#888", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>
                {field.label}
              </div>
              <input
                value={String(editData[field.key])}
                onChange={(e) => setEditData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  background: "#1a1a1a", border: "1px solid #333",
                  color: "#fff", fontSize: 14, outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // CHAT VIEW
  // ============================================================
  if (view === "chat") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 16px", gap: 10,
          borderBottom: "1px solid #222",
        }}>
          <button onClick={() => setView("profile")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: selectedProfile.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{selectedProfile.name.charAt(0)}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{selectedProfile.name}</div>
            <div style={{ color: selectedProfile.online ? "#4CAF50" : "#666", fontSize: 11 }}>
              {selectedProfile.online ? "Online agora" : selectedProfile.distance}
            </div>
          </div>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72"/>
          </svg>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              alignSelf: msg.from === "me" ? "flex-end" : "flex-start",
              maxWidth: "75%",
            }}>
              <div style={{
                padding: "10px 14px",
                borderRadius: msg.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.from === "me" ? "#FFD600" : "#1a1a1a",
                color: msg.from === "me" ? "#000" : "#fff",
                fontSize: 14, lineHeight: 1.4,
              }}>
                {msg.text}
              </div>
              <div style={{
                color: "#666", fontSize: 10, marginTop: 2,
                textAlign: msg.from === "me" ? "right" : "left",
              }}>
                {msg.time}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 16px", borderTop: "1px solid #222",
        }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#FFD600"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Mensagem..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 20,
              background: "#1a1a1a", border: "1px solid #333",
              color: "#fff", fontSize: 14, outline: "none",
            }}
          />
          <button onClick={sendMessage} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="#FFD600">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PROFILE VIEW
  // ============================================================
  if (view === "profile") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        {/* Photo area */}
        <div style={{
          height: 320, background: selectedProfile.color, position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 80, fontWeight: 800, color: "rgba(255,255,255,0.3)" }}>
            {selectedProfile.name.charAt(0)}
          </span>
          <button onClick={() => setView("grid")} style={{
            position: "absolute", top: 12, left: 12,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          {selectedProfile.online && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              padding: "4px 10px", borderRadius: 12,
              background: "rgba(0,0,0,0.5)", color: "#4CAF50",
              fontSize: 11, fontWeight: 600,
            }}>
              Online
            </div>
          )}
          <div style={{
            position: "absolute", bottom: 16, left: 16,
          }}>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>
              {selectedProfile.name}, {selectedProfile.age}
            </div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 }}>
              {selectedProfile.distance} de distancia
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <div style={{ color: "#fff", fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
            {selectedProfile.bio}
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Corpo", value: selectedProfile.body },
              { label: "Altura", value: selectedProfile.height },
            ].map((tag) => (
              <div key={tag.label} style={{
                padding: "6px 12px", borderRadius: 16,
                background: "#1a1a1a", border: "1px solid #333",
              }}>
                <span style={{ color: "#888", fontSize: 11 }}>{tag.label}: </span>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{tag.value}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => openChat(selectedProfile)} style={{
              flex: 1, padding: "12px", borderRadius: 8,
              background: "#FFD600", border: "none",
              color: "#000", fontSize: 15, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="#000">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Chat
            </button>
            <button onClick={() => tapProfile(selectedProfile)} style={{
              width: 48, height: 48, borderRadius: 8,
              background: "#1a1a1a", border: "1px solid #333",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
            <button style={{
              width: 48, height: 48, borderRadius: 8,
              background: "#1a1a1a", border: "1px solid #333",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FF4757" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // GRID VIEW (default)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderBottom: "1px solid #222", flexShrink: 0,
      }}>
        <svg width={80} height={24} viewBox="0 0 80 24">
          <text x="0" y="19" fill="#FFD600" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="900" letterSpacing="-0.5">
            grindr
          </text>
        </svg>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", position: "relative" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <div style={{
              position: "absolute", top: -4, right: -4,
              width: 16, height: 16, borderRadius: "50%",
              background: "#FFD600", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, color: "#000",
            }}>3</div>
          </button>
          <button onClick={() => setView("editProfile")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid #222", flexShrink: 0,
      }}>
        {["explore", "chats", "favs"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer",
            color: tab === t ? "#FFD600" : "#666",
            fontSize: 13, fontWeight: 600, textTransform: "capitalize",
            borderBottom: tab === t ? "2px solid #FFD600" : "2px solid transparent",
          }}>
            {t === "explore" ? "Explorar" : t === "chats" ? "Chats" : "Favoritos"}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "explore" && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 2, padding: 2,
          }}>
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => openProfile(profile)}
                style={{
                  aspectRatio: "3/4",
                  background: profile.color,
                  position: "relative", border: "none", cursor: "pointer",
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  padding: 6, overflow: "hidden",
                }}
              >
                {/* Avatar letter */}
                <span style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: 36, fontWeight: 800, color: "rgba(255,255,255,0.2)",
                }}>
                  {profile.name.charAt(0)}
                </span>
                {/* Online dot */}
                {profile.online && (
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                    width: 10, height: 10, borderRadius: "50%",
                    background: "#4CAF50", border: "2px solid rgba(0,0,0,0.3)",
                  }} />
                )}
                {/* Bottom info */}
                <div style={{
                  position: "relative", zIndex: 1,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  margin: -6, marginTop: 0, padding: "16px 6px 6px",
                }}>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{profile.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>{profile.distance}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === "chats" && (
          <div style={{ padding: "8px 0" }}>
            {profiles.filter((p) => p.online).map((profile) => (
              <button
                key={profile.id}
                onClick={() => openChat(profile)}
                style={{
                  display: "flex", gap: 12, padding: "12px 16px", width: "100%",
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 8,
                  background: profile.color, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{profile.name.charAt(0)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{profile.name}</div>
                  <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>Toque para conversar</div>
                </div>
                <div style={{ color: "#666", fontSize: 11 }}>{profile.distance}</div>
              </button>
            ))}
          </div>
        )}

        {tab === "favs" && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: 40, gap: 12,
          }}>
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={{ color: "#666", fontSize: 14 }}>Nenhum favorito ainda</span>
            <span style={{ color: "#444", fontSize: 12 }}>Toque na estrela no perfil para adicionar</span>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <GrindrNav active={tab} onNavigate={(t) => setTab(t)} />
    </div>
  );
}

function GrindrNav({ active, onNavigate }) {
  const tabs = [
    { id: "explore", label: "Explorar", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill={a ? "#FFD600" : "none"} stroke={a ? "#FFD600" : "#666"} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> },
    { id: "chats", label: "Chats", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill={a ? "#FFD600" : "none"} stroke={a ? "#FFD600" : "#666"} strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
    { id: "favs", label: "Favoritos", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill={a ? "#FFD600" : "none"} stroke={a ? "#FFD600" : "#666"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  ];

  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 0 6px", background: "#111",
      borderTop: "1px solid #222", flexShrink: 0,
    }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onNavigate(t.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "none", border: "none", cursor: "pointer",
        }}>
          {t.icon(active === t.id)}
          <span style={{ color: active === t.id ? "#FFD600" : "#666", fontSize: 10, fontWeight: 600 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

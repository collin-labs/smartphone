import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// TinderApp — Premium pixel-perfect Tinder 2025 clone
// Telas: swipe (main), matches, chat, profile
// Dark mode, cores reais: #FD297B gradient
// Handlers: tinder_discover, tinder_matches, tinder_messages,
//   tinder_profile, tinder_send, tinder_setup, tinder_swipe
// ============================================================

const PROFILES = [
  { id: 1, name: "Ana Clara", age: 24, distance: "3 km", bio: "Adoro sair pra comer e viajar. Procurando alguem legal pra conversar.", job: "Designer", school: "UFMG", photos: 5, verified: true },
  { id: 2, name: "Juliana", age: 22, distance: "5 km", bio: "Musica, cafe e boas conversas.", job: "Fotografa", school: "PUC-SP", photos: 4, verified: false },
  { id: 3, name: "Camila", age: 26, distance: "1 km", bio: "Engenheira de dia, artista de noite.", job: "Engenheira", school: "USP", photos: 6, verified: true },
  { id: 4, name: "Beatriz", age: 23, distance: "8 km", bio: "Gamer, otaku e amante de gatos.", job: "Streamer", school: "UFRJ", photos: 3, verified: false },
  { id: 5, name: "Isabella", age: 25, distance: "2 km", bio: "Life is short. Make every hair flip count.", job: "Modelo", school: "ESPM", photos: 7, verified: true },
];

const MATCHES = [
  { id: 1, name: "Fernanda", time: "Agora", unread: true },
  { id: 2, name: "Gabriela", time: "2h", unread: true },
  { id: 3, name: "Larissa", time: "5h", unread: false },
  { id: 4, name: "Marina", time: "1d", unread: false },
  { id: 5, name: "Sophia", time: "2d", unread: false },
];

const MESSAGES = [
  { id: 1, text: "Oi! Tudo bem?", sender: "them", time: "14:30" },
  { id: 2, text: "Tudo otimo! E voce?", sender: "me", time: "14:32" },
  { id: 3, text: "Bem tambem! Vi que voce curte viajar", sender: "them", time: "14:33" },
  { id: 4, text: "Sim! Acabei de voltar de Floripa", sender: "me", time: "14:35" },
  { id: 5, text: "Que legal!! Floripa e maravilhosa", sender: "them", time: "14:36" },
];

export default function TinderApp({ onNavigate }) {
  const [view, setView] = useState("swipe");
  const [currentProfile, setCurrentProfile] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [chatTarget, setChatTarget] = useState("Fernanda");
  const [profiles, setProfiles] = useState(PROFILES);
  const [matches, setMatches] = useState(MATCHES);
  const [messages, setMessages] = useState(MESSAGES);
  const [chatInput, setChatInput] = useState("");

  // ── tinder_discover (init) ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("tinder_discover");
      if (res?.profiles?.length) {
        setProfiles(res.profiles.map((p, i) => ({
          id: p.id || i + 1, name: p.name || "?", age: p.age || 25,
          distance: p.distance || "?", bio: p.bio || "",
          job: p.job || "", school: p.school || "", photos: p.photos || 3,
          verified: !!p.verified,
        })));
      }
    })();
  }, []);

  // ── tinder_swipe ──
  const handleSwipe = useCallback(async (dir) => {
    setSwipeDir(dir);
    const profile = profiles[currentProfile];
    await fetchBackend("tinder_swipe", { id: profile?.id, direction: dir });
    setTimeout(() => {
      setSwipeDir(null);
      setCurrentProfile((p) => Math.min(p + 1, profiles.length - 1));
    }, 300);
  }, [currentProfile, profiles]);

  // ── tinder_matches ──
  const loadMatches = useCallback(async () => {
    setView("matches");
    const res = await fetchBackend("tinder_matches");
    if (res?.matches?.length) {
      setMatches(res.matches.map((m, i) => ({
        id: m.id || i + 1, name: m.name || "?", time: m.time || "", unread: !!m.unread,
      })));
    }
  }, []);

  // ── tinder_messages ──
  const openChat = useCallback(async (name) => {
    setChatTarget(name);
    setView("chat");
    const res = await fetchBackend("tinder_messages", { name });
    if (res?.messages?.length) {
      setMessages(res.messages.map((m, i) => ({
        id: m.id || i + 1, text: m.text || "", sender: m.sender || m.from || "them", time: m.time || "",
      })));
    }
  }, []);

  // ── tinder_send ──
  const sendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;
    const newMsg = { id: messages.length + 1, text: chatInput.trim(), sender: "me", time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    await fetchBackend("tinder_send", { to: chatTarget, text: newMsg.text });
  }, [chatInput, chatTarget, messages.length]);

  // ── tinder_profile ──
  const loadProfile = useCallback(async () => {
    setView("profile");
    await fetchBackend("tinder_profile");
  }, []);

  // ── tinder_setup ──
  const saveSetup = useCallback(async (data) => {
    await fetchBackend("tinder_setup", data);
  }, []);

  const profile = profiles[currentProfile];

  return (
    <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Top nav */}
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "50px 20px 12px", background: "#111", borderBottom: "1px solid #222" }}>
        <button onClick={loadProfile} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={view === "profile" ? "#FD297B" : "#666"} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        <button onClick={() => setView("swipe")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill={view === "swipe" ? "#FD297B" : "#666"}>
            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z"/>
          </svg>
        </button>
        <button onClick={loadMatches} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, position: "relative" }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={view === "matches" || view === "chat" ? "#FD297B" : "#666"} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <div style={{ position: "absolute", top: 0, right: -2, width: 10, height: 10, borderRadius: "50%", background: "#FD297B" }} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {view === "swipe" && (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, gap: 16 }}>
            {/* Card */}
            <div style={{
              width: "100%", maxWidth: 343, height: 440, borderRadius: 16, overflow: "hidden", position: "relative",
              background: `linear-gradient(135deg, #1a1a2e ${currentProfile * 10}%, #16213e ${50 + currentProfile * 5}%, #0f3460 100%)`,
              transform: swipeDir === "left" ? "translateX(-120%) rotate(-20deg)" : swipeDir === "right" ? "translateX(120%) rotate(20deg)" : "none",
              transition: swipeDir ? "transform 0.3s ease" : "none",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}>
              {/* Photo placeholder with gradient */}
              <div style={{ width: "100%", height: "100%", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)" }} />
                {/* Photo count dots */}
                <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", gap: 3 }}>
                  {Array.from({ length: profile.photos }, (_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i === 0 ? "#fff" : "rgba(255,255,255,0.3)" }} />
                  ))}
                </div>
                {/* Info */}
                <div style={{ position: "absolute", bottom: 80, left: 16, right: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>{profile.name}</span>
                    <span style={{ color: "#fff", fontSize: 24 }}>{profile.age}</span>
                    {profile.verified && (
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="#3B9BFF"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="#ccc"><path d="M20 6H4V4h16v2zm-4 6H8v-2h8v2zm2 6H6v-2h12v2z"/></svg>
                    <span style={{ color: "#ccc", fontSize: 14 }}>{profile.job}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="#ccc"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                    <span style={{ color: "#aaa", fontSize: 13 }}>{profile.distance}</span>
                  </div>
                  <p style={{ color: "#ddd", fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>{profile.bio}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button onClick={() => handleSwipe("left")} style={{
                width: 56, height: 56, borderRadius: "50%", border: "2px solid #FF6B6B", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <button style={{
                width: 44, height: 44, borderRadius: "50%", border: "2px solid #2196F3", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="#2196F3"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </button>
              <button onClick={() => handleSwipe("right")} style={{
                width: 56, height: 56, borderRadius: "50%", border: "2px solid #4CD964", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="#4CD964"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z"/></svg>
              </button>
              <button style={{
                width: 44, height: 44, borderRadius: "50%", border: "2px solid #A855F7", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </button>
            </div>
          </div>
        )}

        {view === "matches" && (
          <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
            {/* New matches horizontal */}
            <div style={{ padding: "16px 16px 0" }}>
              <span style={{ color: "#FD297B", fontSize: 14, fontWeight: 700 }}>Novos Matches</span>
              <div style={{ display: "flex", gap: 12, marginTop: 12, overflowX: "auto", paddingBottom: 12 }}>
                {matches.map((m) => (
                  <button key={m.id} onClick={() => openChat(m.name)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", minWidth: 64,
                  }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: "50%",
                      background: "linear-gradient(135deg, #FD297B, #FF5864, #FF655B)",
                      padding: 2, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg, #2a2a3e, #1a1a2e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{m.name[0]}</span>
                      </div>
                    </div>
                    <span style={{ color: "#fff", fontSize: 11 }}>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: "8px 16px" }}>
              <span style={{ color: "#FD297B", fontSize: 14, fontWeight: 700 }}>Mensagens</span>
            </div>

            {matches.map((m) => (
              <button key={m.id} onClick={() => openChat(m.name)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", width: "100%",
                background: "none", border: "none", borderBottom: "1px solid #1a1a1a", cursor: "pointer",
              }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #2a2a3e, #1a1a2e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{m.name[0]}</span>
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>Enviou uma mensagem...</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ color: "#666", fontSize: 11 }}>{m.time}</span>
                  {m.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FD297B" }} />}
                </div>
              </button>
            ))}
          </div>
        )}

        {view === "chat" && (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Chat header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #222" }}>
              <button onClick={loadMatches} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FD297B" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #2a2a3e, #1a1a2e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{chatTarget[0]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{chatTarget}</div>
                <div style={{ color: "#4CD964", fontSize: 11 }}>Online agora</div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FD297B" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender === "me" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "75%", padding: "10px 14px", borderRadius: 18,
                    background: msg.sender === "me" ? "linear-gradient(135deg, #FD297B, #FF5864)" : "#1e1e1e",
                    borderBottomRightRadius: msg.sender === "me" ? 4 : 18,
                    borderBottomLeftRadius: msg.sender === "them" ? 4 : 18,
                  }}>
                    <span style={{ color: "#fff", fontSize: 14, lineHeight: 1.4 }}>{msg.text}</span>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderTop: "1px solid #222" }}>
              <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#FD297B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4h8"/></svg>
              </button>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Digite uma mensagem..."
                style={{ flex: 1, background: "#1e1e1e", borderRadius: 20, padding: "10px 16px", color: "#fff", fontSize: 14, border: "none", outline: "none" }}
              />
              <button onClick={sendMessage} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="#FD297B"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        )}

        {view === "profile" && (
          <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
            {/* Profile header */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px", gap: 12 }}>
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                background: "linear-gradient(135deg, #FD297B, #FF5864, #FF655B)", padding: 3,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 92, height: 92, borderRadius: "50%", background: "linear-gradient(135deg, #2a2a3e, #1a1a2e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 36, fontWeight: 700 }}>J</span>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>Joao, 25</div>
                <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>Los Santos, SA</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", justifyContent: "center", gap: 32, padding: "16px 0", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a" }}>
              {[{ n: "28", l: "Matches" }, { n: "142", l: "Likes" }, { n: "5", l: "Super Likes" }].map((s) => (
                <div key={s.l} style={{ textAlign: "center" }}>
                  <div style={{ color: "#FD297B", fontSize: 22, fontWeight: 700 }}>{s.n}</div>
                  <div style={{ color: "#888", fontSize: 11, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Settings */}
            {[
              { label: "Tinder Gold", desc: "Veja quem curtiu voce", icon: "G" },
              { label: "Minha Conta", desc: "Configuracoes do perfil", icon: "C" },
              { label: "Preferencias", desc: "Distancia, idade, genero", icon: "P" },
              { label: "Seguranca", desc: "Verificacao e bloqueios", icon: "S" },
            ].map((item) => (
              <button key={item.label} onClick={() => saveSetup({ action: item.label })} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", width: "100%",
                background: "none", border: "none", borderBottom: "1px solid #1a1a1a", cursor: "pointer",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1e1e1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#FD297B", fontSize: 16, fontWeight: 700 }}>{item.icon}</span>
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ color: "#666", fontSize: 12 }}>{item.desc}</div>
                </div>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}

            <button onClick={() => onNavigate("home")} style={{
              margin: "20px auto", display: "block", padding: "12px 32px", borderRadius: 24,
              background: "linear-gradient(135deg, #FD297B, #FF5864)", border: "none",
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              Voltar ao Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

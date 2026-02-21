import React, { useState, useCallback, useEffect } from "react";
import { fetchBackend, fetchClient } from "../hooks/useNui";

// ============================================================
// Phone App — Visual V0 pixel-perfect + Backend FiveM
// Telas: keypad | calling
// V0 layout: 100% preservado | Backend: fetchBackend integrado
// ============================================================

// ---------- Dados fallback (100% V0) ----------
const FALLBACK_FAVORITES = [
  { id: 1, name: "Mae", number: "(11) 98765-4321", color: "#FF6B6B" },
  { id: 2, name: "Pai", number: "(11) 98765-1234", color: "#4ECDC4" },
  { id: 3, name: "Maria", number: "(21) 99887-6655", color: "#E1306C" },
  { id: 4, name: "Joao", number: "(11) 91234-5678", color: "#F77737" },
];
const FALLBACK_RECENTS = [
  { id: 1, name: "Maria LS", number: "(21) 99887-6655", time: "14:30", type: "incoming", color: "#E1306C" },
  { id: 2, name: "Desconhecido", number: "(11) 3456-7890", time: "13:15", type: "missed", color: "#666" },
  { id: 3, name: "Joao Grau", number: "(11) 91234-5678", time: "12:00", type: "outgoing", color: "#F77737" },
  { id: 4, name: "Pizzaria LS", number: "(11) 3333-4444", time: "Ontem", type: "outgoing", color: "#CC0000" },
  { id: 5, name: "Desconhecido", number: "(11) 9876-5432", time: "Ontem", type: "missed", color: "#666" },
  { id: 6, name: "Ana Belle", number: "(21) 98765-0000", time: "Ontem", type: "incoming", color: "#C13584" },
  { id: 7, name: "Pedro MG", number: "(31) 99999-8888", time: "25/01", type: "outgoing", color: "#405DE6" },
  { id: 8, name: "Lari Santos", number: "(11) 97777-6666", time: "24/01", type: "incoming", color: "#833AB4" },
];

const timeAgo = (d) => {
  if (!d) return "";
  const now = new Date();
  const dt = new Date(d);
  const diff = Math.floor((now - dt) / 86400000);
  if (diff === 0) return dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return "Ontem";
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

export default function Phone({ onNavigate }) {
  const [view, setView] = useState("keypad");
  const [tab, setTab] = useState("teclado");
  const [dialNumber, setDialNumber] = useState("");
  const [callingName, setCallingName] = useState("");
  const [callTime, setCallTime] = useState(0);
  const [callActive, setCallActive] = useState(false);
  const [recents, setRecents] = useState(FALLBACK_RECENTS);
  const [favorites, setFavorites] = useState(FALLBACK_FAVORITES);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [activeCallId, setActiveCallId] = useState(null);

  const dialPad = [
    { num: "1", sub: "" }, { num: "2", sub: "ABC" }, { num: "3", sub: "DEF" },
    { num: "4", sub: "GHI" }, { num: "5", sub: "JKL" }, { num: "6", sub: "MNO" },
    { num: "7", sub: "PQRS" }, { num: "8", sub: "TUV" }, { num: "9", sub: "WXYZ" },
    { num: "*", sub: "" }, { num: "0", sub: "+" }, { num: "#", sub: "" },
  ];

  // ---------- Backend: carregar histórico ----------
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("call_history");
      if (res?.calls?.length) {
        setRecents(res.calls.map((c, i) => ({
          id: c.id || i + 1,
          name: c.contact_name || c.phone || "Desconhecido",
          number: c.phone || "",
          time: c.created_at ? timeAgo(c.created_at) : "",
          type: c.direction || "outgoing",
          color: ["#E1306C", "#F77737", "#C13584", "#405DE6", "#833AB4", "#CC0000"][i % 6],
        })));
      }
    })();
  }, []);

  const pressKey = useCallback((num) => {
    setDialNumber((prev) => prev + num);
  }, []);

  const makeCall = useCallback(async () => {
    if (!dialNumber && !callingName) return;
    const contact = recents.find((r) => r.number.replace(/\D/g, "").includes(dialNumber.replace(/\D/g, "")));
    const name = callingName || contact?.name || dialNumber || "Desconhecido";
    setCallingName(name);
    setView("calling");
    setCallActive(false);
    setCallTime(0);
    setMuted(false);
    setSpeaker(false);

    // Backend: iniciar chamada
    const res = await fetchBackend("call_init", { phone: dialNumber || contact?.number });
    if (res?.callId) setActiveCallId(res.callId);
    setTimeout(() => setCallActive(true), 2000);
  }, [dialNumber, callingName, recents]);

  const callFromContact = useCallback(async (name, number) => {
    setDialNumber(number);
    setCallingName(name);
    setView("calling");
    setCallActive(false);
    setCallTime(0);
    setMuted(false);
    setSpeaker(false);

    const res = await fetchBackend("call_init", { phone: number });
    if (res?.callId) setActiveCallId(res.callId);
    setTimeout(() => setCallActive(true), 2000);
  }, []);

  const endCall = useCallback(async () => {
    if (activeCallId) await fetchBackend("call_end", { callId: activeCallId });
    setView("keypad");
    setCallTime(0);
    setCallActive(false);
    setActiveCallId(null);
    setCallingName("");
  }, [activeCallId]);

  // Timer for call
  useEffect(() => {
    if (!callActive || view !== "calling") return;
    const iv = setInterval(() => setCallTime((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [callActive, view]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ============================================================
  // CALLING VIEW (100% V0)
  // ============================================================
  if (view === "calling") {
    return (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #4CAF50, #2E7D32)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>{callingName.charAt(0).toUpperCase()}</span>
          </div>
          <div style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>{callingName}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 6 }}>{callActive ? formatTime(callTime) : "Chamando..."}</div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Call actions (100% V0) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, padding: "0 40px", marginBottom: 30 }}>
          {[
            { icon: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={muted ? "#FF3B30" : "#fff"} strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>, label: "Mudo", action: () => setMuted(!muted) },
            { icon: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>, label: "Teclado" },
            { icon: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={speaker ? "#4CAF50" : "#fff"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, label: "Alto-falante", action: () => setSpeaker(!speaker) },
            { icon: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>, label: "Adicionar" },
            { icon: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, label: "Pausar" },
            { icon: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>, label: "Contatos" },
          ].map((action, i) => (
            <div key={i} onClick={action.action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{action.icon}</div>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>{action.label}</span>
            </div>
          ))}
        </div>
        {/* End call (100% V0) */}
        <button onClick={endCall} style={{ width: 64, height: 64, borderRadius: "50%", background: "#FF3B30", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="#fff"><path d="M23.71 16.67C20.66 13.78 16.54 12 12 12S3.34 13.78.29 16.67a1 1 0 00-.04 1.4l2.56 2.56a1 1 0 001.12.22 12.6 12.6 0 014.46-1.45 1 1 0 00.86-.99V15a10.45 10.45 0 015.5 0v3.41a1 1 0 00.86.99 12.6 12.6 0 014.46 1.45 1 1 0 001.12-.22l2.56-2.56a1 1 0 00-.04-1.4z"/></svg>
        </button>
      </div>
    );
  }

  // ============================================================
  // KEYPAD VIEW (default — 100% V0)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Content area */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "teclado" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24 }}>
            {/* Display */}
            <div style={{ fontSize: dialNumber.length > 12 ? 24 : 32, fontWeight: 300, color: "#fff", minHeight: 44, display: "flex", alignItems: "center", letterSpacing: 2, padding: "0 16px", marginBottom: 16, fontFamily: "monospace" }}>
              {dialNumber || <span style={{ color: "#666" }}>Digite o numero</span>}
            </div>
            {/* Numpad (100% V0) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 32px", width: "100%", boxSizing: "border-box" }}>
              {dialPad.map((key) => (
                <button key={key.num} onClick={() => pressKey(key.num)} style={{ height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 26, fontWeight: 300, lineHeight: 1 }}>{key.num}</span>
                  {key.sub && <span style={{ color: "#888", fontSize: 9, fontWeight: 600, letterSpacing: 2, marginTop: 1 }}>{key.sub}</span>}
                </button>
              ))}
            </div>
            {/* Call + delete row (100% V0) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginTop: 16, width: "100%", padding: "0 32px", boxSizing: "border-box" }}>
              <div style={{ width: 56 }} />
              <button onClick={makeCall} style={{ width: 64, height: 64, borderRadius: "50%", background: "#4CAF50", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="#fff"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </button>
              <button onClick={() => setDialNumber((prev) => prev.slice(0, -1))} style={{ width: 56, height: 56, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: dialNumber ? 1 : 0.3 }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
              </button>
            </div>
          </div>
        )}

        {tab === "favoritos" && (
          <div style={{ padding: "8px 0" }}>
            {favorites.map((fav) => (
              <button key={fav.id} onClick={() => callFromContact(fav.name, fav.number)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: fav.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{fav.name.charAt(0)}</span>
                </div>
                <div>
                  <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{fav.name}</div>
                  <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{fav.number}</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72"/></svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === "recentes" && (
          <div style={{ padding: "8px 0" }}>
            {recents.map((recent) => (
              <button key={recent.id} onClick={() => callFromContact(recent.name, recent.number)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: recent.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{recent.name.charAt(0)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: recent.type === "missed" ? "#FF3B30" : "#fff", fontSize: 14, fontWeight: 600 }}>{recent.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={recent.type === "missed" ? "#FF3B30" : recent.type === "incoming" ? "#4CAF50" : "#2196F3"} strokeWidth="2">
                      {recent.type === "incoming" && <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/></>}
                      {recent.type === "outgoing" && <><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>}
                      {recent.type === "missed" && <><line x1="18" y1="6" x2="6" y2="18"/><polyline points="6 6 6 18 18 18"/></>}
                    </svg>
                    <span style={{ color: "#888", fontSize: 11 }}>{recent.number}</span>
                  </div>
                </div>
                <span style={{ color: "#666", fontSize: 11 }}>{recent.time}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "contatos" && (
          <div style={{ padding: "8px 0" }}>
            <div style={{ padding: "8px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", borderRadius: 8, padding: "8px 12px" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ color: "#666", fontSize: 14 }}>Buscar contato...</span>
              </div>
            </div>
            {[...favorites, ...recents.map((r) => ({ id: r.id + 100, name: r.name, number: r.number, color: r.color }))].map((c) => (
              <button key={c.id} onClick={() => callFromContact(c.name, c.number)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{c.name.charAt(0)}</span>
                </div>
                <div>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ color: "#888", fontSize: 11 }}>{c.number}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom tabs (100% V0) */}
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 0 6px", background: "#111", borderTop: "1px solid #222", flexShrink: 0 }}>
        {[
          { id: "favoritos", label: "Favoritos", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill={a ? "#4CAF50" : "none"} stroke={a ? "#4CAF50" : "#666"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
          { id: "recentes", label: "Recentes", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={a ? "#4CAF50" : "#666"} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { id: "contatos", label: "Contatos", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={a ? "#4CAF50" : "#666"} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
          { id: "teclado", label: "Teclado", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={a ? "#4CAF50" : "#666"} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg> },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
            {t.icon(tab === t.id)}
            <span style={{ color: tab === t.id ? "#4CAF50" : "#666", fontSize: 10, fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

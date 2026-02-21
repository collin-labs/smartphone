import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Waze App — V0 100% pixel-perfect + ALL 4 backend handlers
// Handlers: waze_init, waze_navigate, waze_report, waze_stop
// Views: map | search | navigation
// ============================================================

const FALLBACK_PLACES = [
  { id: 1, name: "Casa", address: "Rua Alta, 1247", icon: "home", time: "12 min" },
  { id: 2, name: "Trabalho", address: "Av. Central, 500", icon: "work", time: "25 min" },
  { id: 3, name: "Mecanica Santos", address: "Rua Santos Dumont, 456", icon: "pin", time: "8 min" },
  { id: 4, name: "Hospital Central", address: "Rua da Saude, 100", icon: "pin", time: "15 min" },
];
const ALERTS = [
  { id: 1, type: "police", label: "Policia", distance: "1.2 km" },
  { id: 2, type: "accident", label: "Acidente", distance: "3.5 km" },
];
const REPORT_TYPES = [
  { id: "police", label: "Policia", icon: "🚔", color: "#276EF1" },
  { id: "accident", label: "Acidente", icon: "⚠️", color: "#FF6B35" },
  { id: "hazard", label: "Perigo", icon: "🔺", color: "#E53935" },
  { id: "traffic", label: "Transito", icon: "🚗", color: "#F57C00" },
];

export default function Waze({ onNavigate }) {
  const [view, setView] = useState("map");
  const [search, setSearch] = useState("");
  const [speed, setSpeed] = useState(62);
  const [eta, setEta] = useState(12);
  const [navDest, setNavDest] = useState("");
  const [turnInstruction, setTurnInstruction] = useState("Siga em frente por 800m");
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    if (view !== "navigation") return;
    const interval = setInterval(() => {
      setSpeed(Math.floor(40 + Math.random() * 40));
      setEta((prev) => Math.max(0, prev - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [view]);

  // ── waze_init ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("waze_init");
      if (res?.speed !== undefined) setSpeed(res.speed);
    })();
  }, []);

  // ── waze_navigate ──
  const startNavigation = useCallback(async (place) => {
    setNavDest(place.name);
    setEta(parseInt(place.time) || 12);
    setView("navigation");
    await fetchBackend("waze_navigate", { destination: place.name, address: place.address });
  }, []);

  // ── waze_report ──
  const sendReport = useCallback(async (type) => {
    await fetchBackend("waze_report", { type });
    setShowReports(false);
  }, []);

  // ── waze_stop ──
  const stopNavigation = useCallback(async () => {
    await fetchBackend("waze_stop");
    setView("map");
  }, []);

  // ============================================================
  // NAVIGATION VIEW (V0 100%)
  // ============================================================
  if (view === "navigation") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0D1B2A", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", background: "linear-gradient(135deg, #0D47A1, #1565C0)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="#33CCFF"><polygon points="12 2 22 22 12 17 2 22"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{turnInstruction}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{navDest}</div>
          </div>
        </div>
        <div style={{ flex: 1, background: "linear-gradient(180deg, #0D1B2A 0%, #1A2A3A 50%, #0D2B1A 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
            {Array.from({ length: 8 }, (_, i) => (<div key={`h${i}`} style={{ position: "absolute", top: `${i * 12.5}%`, left: 0, right: 0, height: 1, background: "#33CCFF" }} />))}
            {Array.from({ length: 10 }, (_, i) => (<div key={`v${i}`} style={{ position: "absolute", left: `${i * 10}%`, top: 0, bottom: 0, width: 1, background: "#33CCFF" }} />))}
          </div>
          <svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%"><path d="M 180 350 C 180 280 180 200 200 150 Q 220 100 260 80" fill="none" stroke="#33CCFF" strokeWidth="6" opacity="0.7" /><polygon points="180,340 170,360 190,360" fill="#33CCFF" /></svg>
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)" }}>
            <svg width={48} height={48} viewBox="0 0 24 24" fill="#33CCFF" opacity="0.8"><polygon points="12 2 22 22 12 17 2 22"/></svg>
          </div>
          {ALERTS.map((alert, i) => (
            <div key={alert.id} style={{ position: "absolute", top: 60 + i * 80, right: 20 + i * 40, padding: "4px 10px", borderRadius: 12, background: "rgba(0,0,0,0.7)", border: "1px solid #33CCFF", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12 }}>{alert.type === "police" ? "🚔" : "⚠️"}</span>
              <span style={{ color: "#33CCFF", fontSize: 11, fontWeight: 600 }}>{alert.distance}</span>
            </div>
          ))}
          <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "rgba(0,0,0,0.8)", borderRadius: 12, padding: "8px 20px", display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ color: "#33CCFF", fontSize: 36, fontWeight: 800 }}>{speed}</span>
              <span style={{ color: "#33CCFF", fontSize: 14 }}>km/h</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 16px", background: "#0D1B2A", borderTop: "1px solid #1A2A3A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#33CCFF", fontSize: 20, fontWeight: 800 }}>{eta} min</div>
            <div style={{ color: "#5A7A9A", fontSize: 12 }}>Chegada estimada</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowReports(!showReports)} style={{ padding: "10px 16px", borderRadius: 20, background: "#1A2A3A", border: "1px solid #33CCFF", color: "#33CCFF", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="#33CCFF" style={{ marginRight: 6, verticalAlign: "middle" }}><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Alertar
            </button>
            <button onClick={stopNavigation} style={{ padding: "10px 16px", borderRadius: 20, background: "#E53935", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Parar</button>
          </div>
        </div>
        {showReports && (
          <div style={{ position: "absolute", bottom: 70, left: 16, right: 16, background: "#1A2A3A", borderRadius: 16, padding: 12, display: "flex", gap: 8, justifyContent: "center", zIndex: 50 }}>
            {REPORT_TYPES.map((rt) => (
              <button key={rt.id} onClick={() => sendReport(rt.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 12px", borderRadius: 12, background: "#0D1B2A", border: `1px solid ${rt.color}`, cursor: "pointer" }}>
                <span style={{ fontSize: 20 }}>{rt.icon}</span>
                <span style={{ color: rt.color, fontSize: 10, fontWeight: 600 }}>{rt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // SEARCH VIEW (V0 100%)
  // ============================================================
  if (view === "search") {
    const results = FALLBACK_PLACES.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{ width: "100%", height: "100%", background: "#0D1B2A", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setView("map")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#33CCFF" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "#1A2A3A" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#5A7A9A" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar destino..." style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 14, outline: "none" }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {results.map((place) => (
            <button key={place.id} onClick={() => startNavigation(place)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #1A2A3A" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1A2A3A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#33CCFF" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{place.name}</div>
                <div style={{ color: "#5A7A9A", fontSize: 12 }}>{place.address}</div>
              </div>
              <span style={{ color: "#33CCFF", fontSize: 13, fontWeight: 600 }}>{place.time}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // MAP VIEW (default — V0 100%)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#0D1B2A", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px", position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 }}>
        <button onClick={() => setView("search")} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 16px", background: "rgba(26,42,58,0.95)", borderRadius: 12, border: "1px solid #1A3A5A", cursor: "pointer" }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#33CCFF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span style={{ color: "#5A7A9A", fontSize: 14 }}>Para onde?</span>
        </button>
      </div>
      <div style={{ flex: 1, background: "linear-gradient(180deg, #0D1B2A, #1A2A3A, #0D2B1A)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
          {Array.from({ length: 12 }, (_, i) => (<div key={`h${i}`} style={{ position: "absolute", top: `${i * 8.3}%`, left: 0, right: 0, height: 1, background: "#33CCFF" }} />))}
          {Array.from({ length: 15 }, (_, i) => (<div key={`v${i}`} style={{ position: "absolute", left: `${i * 6.6}%`, top: 0, bottom: 0, width: 1, background: "#33CCFF" }} />))}
        </div>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="#33CCFF" opacity="0.9"><circle cx="12" cy="12" r="8" fill="none" stroke="#33CCFF" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="#33CCFF"/></svg>
        </div>
        {ALERTS.map((alert, i) => (
          <div key={alert.id} style={{ position: "absolute", top: 80 + i * 90, left: 30 + i * 60, padding: "4px 10px", borderRadius: 12, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(51,204,255,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>{alert.type === "police" ? "🚔" : "⚠️"}</span>
            <span style={{ color: "#33CCFF", fontSize: 11, fontWeight: 600 }}>{alert.label}</span>
          </div>
        ))}
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", borderRadius: 12, padding: "6px 16px", display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ color: "#33CCFF", fontSize: 28, fontWeight: 800 }}>{speed}</span>
          <span style={{ color: "#33CCFF", fontSize: 12 }}>km/h</span>
        </div>
      </div>
      <div style={{ padding: "12px 16px", background: "#0D1B2A", borderTop: "1px solid #1A2A3A" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {FALLBACK_PLACES.slice(0, 2).map((place) => (
            <button key={place.id} onClick={() => startNavigation(place)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "#1A2A3A", border: "none", cursor: "pointer" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#33CCFF" strokeWidth="2">{place.icon === "home" ? <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/> : <rect x="2" y="7" width="20" height="14" rx="2"/>}</svg>
              <div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{place.name}</div>
                <div style={{ color: "#5A7A9A", fontSize: 11 }}>{place.time}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// AppStore App — Pixel-perfect 2025/2026 dark mode replica
// Telas: featured | detail
// Handlers: appstore_init, appstore_install, appstore_toggle, appstore_uninstall
// ============================================================

const FEATURED = [
  { id: 1, name: "GTA Online", subtitle: "Rockstar Games", desc: "Jogo de mundo aberto", gradient: "linear-gradient(135deg, #2E7D32, #1B5E20)", rating: 4.8, size: "72 GB", category: "Jogos" },
  { id: 2, name: "Spotify", subtitle: "Spotify Ltd.", desc: "Musica para todos", gradient: "linear-gradient(135deg, #1DB954, #191414)", rating: 4.9, size: "150 MB", category: "Musica" },
  { id: 3, name: "Netflix", subtitle: "Netflix Inc.", desc: "Filmes e Series", gradient: "linear-gradient(135deg, #E50914, #B20710)", rating: 4.7, size: "90 MB", category: "Entretenimento" },
];

const CATEGORIES = ["Destaques", "Jogos", "Apps", "Arcade"];

const APPS_LIST = [
  { id: 1, name: "WhatsApp", subtitle: "Mensagens gratis", gradient: "linear-gradient(135deg, #25D366, #128C7E)", rating: 4.6, installed: true, size: "120 MB" },
  { id: 2, name: "Instagram", subtitle: "Fotos e Videos", gradient: "linear-gradient(135deg, #E1306C, #F77737)", rating: 4.5, installed: true, size: "200 MB" },
  { id: 3, name: "TikTok", subtitle: "Videos curtos", gradient: "linear-gradient(135deg, #000, #EE1D52)", rating: 4.7, installed: false, size: "280 MB" },
  { id: 4, name: "YouTube", subtitle: "Videos e Musica", gradient: "linear-gradient(135deg, #FF0000, #CC0000)", rating: 4.8, installed: false, size: "150 MB" },
  { id: 5, name: "Uber", subtitle: "Viagens e Entregas", gradient: "linear-gradient(135deg, #000, #276EF1)", rating: 4.3, installed: true, size: "300 MB" },
  { id: 6, name: "Discord", subtitle: "Chat para gamers", gradient: "linear-gradient(135deg, #5865F2, #404EED)", rating: 4.6, installed: false, size: "180 MB" },
  { id: 7, name: "Telegram", subtitle: "Mensagens rapidas", gradient: "linear-gradient(135deg, #0088cc, #229ED9)", rating: 4.5, installed: false, size: "95 MB" },
  { id: 8, name: "Twitter", subtitle: "Rede social", gradient: "linear-gradient(135deg, #000, #333)", rating: 4.2, installed: true, size: "120 MB" },
  { id: 9, name: "Waze", subtitle: "GPS e Transito", gradient: "linear-gradient(135deg, #33CCFF, #00AAFF)", rating: 4.4, installed: false, size: "160 MB" },
  { id: 10, name: "iFood", subtitle: "Delivery de comida", gradient: "linear-gradient(135deg, #EA1D2C, #B71C1C)", rating: 4.5, installed: true, size: "130 MB" },
];

export default function AppStoreApp({ onNavigate }) {
  const [view, setView] = useState("featured");
  const [selectedApp, setSelectedApp] = useState(FEATURED[0]);
  const [activeCategory, setActiveCategory] = useState("Destaques");
  const [apps, setApps] = useState(APPS_LIST);
  const [searchQuery, setSearchQuery] = useState("");

  // ── appstore_init ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("appstore_init");
      if (res?.apps?.length) {
        setApps(res.apps.map((a, i) => ({
          id: a.id || i + 1, name: a.name || "?", subtitle: a.subtitle || "",
          gradient: APPS_LIST[i % APPS_LIST.length]?.gradient || "linear-gradient(135deg, #333, #666)",
          rating: a.rating || 4.0, installed: !!a.installed, size: a.size || "?",
        })));
      }
    })();
  }, []);

  // ── appstore_install ──
  const installApp = useCallback(async (app) => {
    setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, installed: true } : a));
    await fetchBackend("appstore_install", { id: app.id, name: app.name });
  }, []);

  // ── appstore_uninstall ──
  const uninstallApp = useCallback(async (app) => {
    setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, installed: false } : a));
    await fetchBackend("appstore_uninstall", { id: app.id, name: app.name });
  }, []);

  // ── appstore_toggle ──
  const toggleApp = useCallback(async (app) => {
    const newState = !app.installed;
    setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, installed: newState } : a));
    await fetchBackend("appstore_toggle", { id: app.id, name: app.name, installed: newState });
  }, []);

  const filteredApps = searchQuery
    ? apps.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : apps;

  // ============================================================
  // DETAIL VIEW
  // ============================================================
  if (view === "detail") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 16px",
          borderBottom: "1px solid #222", flexShrink: 0,
        }}>
          <button onClick={() => setView("featured")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Hero */}
          <div style={{
            height: 200, background: selectedApp.gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 48, fontWeight: 800 }}>
              {selectedApp.name.charAt(0)}
            </span>
          </div>
          {/* Info */}
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 14, background: selectedApp.gradient,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>{selectedApp.name.charAt(0)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{selectedApp.name}</div>
                <div style={{ color: "#888", fontSize: 13 }}>{selectedApp.subtitle}</div>
              </div>
              <button onClick={() => installApp(selectedApp)} style={{
                alignSelf: "center",
                padding: "8px 20px", borderRadius: 16,
                background: "#2196F3", border: "none",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                OBTER
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: "flex", justifyContent: "space-around",
              padding: "12px 0", borderTop: "1px solid #222", borderBottom: "1px solid #222",
              marginBottom: 16,
            }}>
              {[
                { label: "Avaliacao", value: `${selectedApp.rating}` },
                { label: "Tamanho", value: selectedApp.size },
                { label: "Categoria", value: selectedApp.category || "Apps" },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ color: "#888", fontSize: 11 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Descricao</div>
            <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6 }}>{selectedApp.desc}</div>

            {/* Screenshots placeholder */}
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Screenshots</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} style={{
                  width: 140, height: 240, borderRadius: 12, flexShrink: 0,
                  background: `linear-gradient(${135 + i * 30}deg, ${i === 0 ? "#667eea, #764ba2" : i === 1 ? "#4facfe, #00f2fe" : "#fa709a, #fee140"})`,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // FEATURED VIEW (default)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
        }}>
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>App Store</span>
          <button onClick={() => onNavigate?.("home")} style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>C</span>
          </button>
        </div>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#1a1a1a", borderRadius: 10, padding: "8px 12px",
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Jogos, Apps e mais..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14 }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "1px solid #222", flexShrink: 0,
      }}>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer",
            color: activeCategory === cat ? "#2196F3" : "#666",
            fontSize: 12, fontWeight: 600,
            borderBottom: activeCategory === cat ? "2px solid #2196F3" : "2px solid transparent",
          }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Featured card carousel */}
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory" }}>
            {FEATURED.map((app) => (
              <button key={app.id} onClick={() => { setSelectedApp(app); setView("detail"); }} style={{
                width: 280, flexShrink: 0, borderRadius: 14, overflow: "hidden",
                background: app.gradient, border: "none", cursor: "pointer",
                textAlign: "left", scrollSnapAlign: "start",
              }}>
                <div style={{ padding: "20px 16px", height: 160, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
                    Destaque
                  </div>
                  <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{app.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{app.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Apps list */}
        <div style={{ padding: "8px 16px" }}>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Apps Populares</div>
          {filteredApps.map((app, i) => (
            <div key={app.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: "1px solid #1a1a1a",
            }}>
              <span style={{ color: "#666", fontSize: 14, fontWeight: 600, width: 18, textAlign: "center" }}>{i + 1}</span>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: app.gradient, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{app.name.charAt(0)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{app.name}</div>
                <div style={{ color: "#888", fontSize: 11 }}>{app.subtitle}</div>
              </div>
              <button onClick={() => toggleApp(app)} style={{
                padding: "6px 16px", borderRadius: 14,
                background: app.installed ? "transparent" : "#2196F3",
                border: app.installed ? "1px solid #444" : "none",
                color: app.installed ? "#2196F3" : "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                minWidth: 70, textAlign: "center",
              }}>
                {app.installed ? "ABRIR" : "OBTER"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "8px 0 6px", background: "#111",
        borderTop: "1px solid #222", flexShrink: 0,
      }}>
        {[
          { label: "Hoje", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill={a ? "#2196F3" : "none"} stroke={a ? "#2196F3" : "#666"} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, active: true },
          { label: "Jogos", icon: () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="4" y1="12" x2="8" y2="12"/><circle cx="16" cy="10" r="1" fill="#666"/><circle cx="19" cy="13" r="1" fill="#666"/></svg>, active: false },
          { label: "Apps", icon: () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>, active: false },
          { label: "Buscar", icon: () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, active: false },
        ].map((tab) => (
          <button key={tab.label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer",
          }}>
            {tab.icon(tab.active)}
            <span style={{ color: tab.active ? "#2196F3" : "#666", fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

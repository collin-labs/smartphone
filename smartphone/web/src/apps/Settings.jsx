import React, { useState, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Settings App — Pixel-perfect 2025/2026 dark mode replica
// Telas: main | wallpaper
// Handlers: settings_save
// ============================================================

const WALLPAPERS = [
  { id: 1, gradient: "linear-gradient(135deg, #667eea, #764ba2)", name: "Noite" },
  { id: 2, gradient: "linear-gradient(135deg, #f093fb, #f5576c)", name: "Rosa" },
  { id: 3, gradient: "linear-gradient(135deg, #4facfe, #00f2fe)", name: "Oceano" },
  { id: 4, gradient: "linear-gradient(135deg, #43e97b, #38f9d7)", name: "Floresta" },
  { id: 5, gradient: "linear-gradient(135deg, #fa709a, #fee140)", name: "Sunset" },
  { id: 6, gradient: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", name: "Escuro" },
  { id: 7, gradient: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", name: "Meia-noite" },
  { id: 8, gradient: "linear-gradient(135deg, #000, #333)", name: "Preto" },
];

function Toggle({ value, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 48, height: 28, borderRadius: 14, padding: 2,
      background: value ? "#4CAF50" : "#333",
      border: "none", cursor: "pointer",
      display: "flex", alignItems: "center",
      transition: "background 0.2s",
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: "50%",
        background: "#fff",
        transform: value ? "translateX(20px)" : "translateX(0)",
        transition: "transform 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

export default function SettingsApp({ onNavigate }) {
  const [view, setView] = useState("main");
  const [settings, setSettings] = useState({
    wifi: true,
    bluetooth: false,
    modoAviao: false,
    dadosMoveis: true,
    localizacao: true,
    naoPerturbe: false,
    modoEscuro: true,
    notificacoes: true,
    somVibracao: true,
    autoRotacao: true,
  });
  const [selectedWallpaper, setSelectedWallpaper] = useState(6);
  const [brightness, setBrightness] = useState(70);
  const [volume, setVolume] = useState(50);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── settings_save ──
  const saveSettings = useCallback(async (newSettings) => {
    await fetchBackend("settings_save", newSettings || settings);
  }, [settings]);

  // ============================================================
  // WALLPAPER VIEW
  // ============================================================
  if (view === "wallpaper") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 16px",
          borderBottom: "1px solid #222", flexShrink: 0,
        }}>
          <button onClick={() => setView("main")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Papel de Parede</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {/* Preview */}
          <div style={{
            height: 200, borderRadius: 16, marginBottom: 20,
            background: WALLPAPERS.find((w) => w.id === selectedWallpaper)?.gradient || WALLPAPERS[0].gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #333",
          }}>
            <div style={{
              width: 100, height: 180, borderRadius: 12, border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(0,0,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Preview</span>
            </div>
          </div>
          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            {WALLPAPERS.map((wp) => (
              <button key={wp.id} onClick={() => setSelectedWallpaper(wp.id)} style={{
                aspectRatio: "1/1.5", borderRadius: 10,
                background: wp.gradient, border: selectedWallpaper === wp.id ? "2px solid #4CAF50" : "2px solid transparent",
                cursor: "pointer", position: "relative",
              }}>
                {selectedWallpaper === wp.id && (
                  <div style={{
                    position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
                    width: 18, height: 18, borderRadius: "50%", background: "#4CAF50",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          {/* Apply button */}
          <button onClick={() => saveSettings({ wallpaper: selectedWallpaper })} style={{
            width: "100%", padding: "14px", borderRadius: 10, marginTop: 20,
            background: "#4CAF50", border: "none",
            color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            Aplicar
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN VIEW (default)
  // ============================================================
  const sections = [
    {
      title: "Conexoes",
      items: [
        { key: "wifi", label: "Wi-Fi", sub: settings.wifi ? "LS-Free-5G" : "Desligado", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12" y2="20"/></svg>, toggle: true },
        { key: "bluetooth", label: "Bluetooth", sub: settings.bluetooth ? "Ligado" : "Desligado", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/></svg>, toggle: true },
        { key: "modoAviao", label: "Modo Aviao", sub: settings.modoAviao ? "Ligado" : "Desligado", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>, toggle: true },
        { key: "dadosMoveis", label: "Dados Moveis", sub: settings.dadosMoveis ? "4G LTE" : "Desligado", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, toggle: true },
      ],
    },
    {
      title: "Geral",
      items: [
        { key: "notificacoes", label: "Notificacoes", sub: "Permitidas", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>, toggle: true },
        { key: "somVibracao", label: "Som e Vibracao", sub: `Volume: ${volume}%`, icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>, toggle: true },
        { key: "modoEscuro", label: "Modo Escuro", sub: settings.modoEscuro ? "Ativo" : "Desativo", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9C27B0" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>, toggle: true },
      ],
    },
    {
      title: "Tela",
      items: [
        { key: null, label: "Papel de Parede", sub: "Personalizar", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#E91E63" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, action: () => setView("wallpaper") },
        { key: null, label: `Brilho: ${brightness}%`, sub: "", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>, slider: true },
        { key: "autoRotacao", label: "Rotacao Automatica", sub: settings.autoRotacao ? "Ligado" : "Desligado", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1014.85-3.36L23 1"/></svg>, toggle: true },
      ],
    },
    {
      title: "Sobre",
      items: [
        { key: null, label: "Armazenamento", sub: "32GB / 64GB usados", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M22 12H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg> },
        { key: null, label: "Versao do sistema", sub: "iFone OS 2.1.0", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
      ],
    },
  ];

  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid #222", flexShrink: 0,
      }}>
        <button onClick={() => onNavigate?.("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>Configuracoes</span>
        <div style={{ width: 22 }} />
      </div>

      {/* Settings list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* User card */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "16px",
          margin: "12px 16px", background: "#1a1a1a", borderRadius: 12,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>C</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>Carlos Silva</div>
            <div style={{ color: "#888", fontSize: 12 }}>carlos_rp@email.com</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 8 }}>
            <div style={{ padding: "12px 16px 6px", color: "#888", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
              {section.title}
            </div>
            <div style={{ margin: "0 16px", background: "#1a1a1a", borderRadius: 12, overflow: "hidden" }}>
              {section.items.map((item, i) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderBottom: i < section.items.length - 1 ? "1px solid #2a2a2a" : "none",
                  cursor: item.action ? "pointer" : "default",
                }} onClick={() => {
                  if (item.action) item.action();
                  if (item.toggle && item.key) {
                    toggleSetting(item.key);
                    saveSettings({ [item.key]: !settings[item.key] });
                  }
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                    {item.sub && <div style={{ color: "#888", fontSize: 11, marginTop: 1 }}>{item.sub}</div>}
                  </div>
                  {item.slider ? (
                    <input
                      type="range" min="0" max="100" value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      style={{ width: 80, accentColor: "#4CAF50" }}
                    />
                  ) : item.toggle && item.key ? (
                    <Toggle value={settings[item.key]} onChange={() => {}} />
                  ) : (
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

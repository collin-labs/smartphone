import React, { useState, useCallback, useRef } from "react";

// ============================================================
// Chrome / Browser App — Pixel-perfect 2025/2026 dark mode replica
// Telas: home | browser | tabs | bookmarks
// Navegacao REAL via iframes — NO backend handlers
// ============================================================

const SHORTCUTS = [
  { id: 1, name: "Google", url: "https://www.google.com/search?igu=1", color: "#4285F4", initial: "G" },
  { id: 2, name: "Maze Bank", url: "https://www.chase.com", color: "#00A550", initial: "M" },
  { id: 3, name: "Weazel News", url: "https://www.bbc.com/news", color: "#FF0000", initial: "W" },
  { id: 4, name: "LifeInvader", url: "https://www.facebook.com", color: "#2D88FF", initial: "L" },
  { id: 5, name: "Bleeter", url: "https://www.twitter.com", color: "#1DA1F2", initial: "B" },
  { id: 6, name: "LS Customs", url: "https://www.caranddriver.com", color: "#FF6B00", initial: "LS" },
  { id: 7, name: "Dynasty 8", url: "https://www.zillow.com", color: "#E67E22", initial: "D8" },
  { id: 8, name: "Eyefind", url: "https://www.google.com/search?igu=1", color: "#34A853", initial: "E" },
];

const BOOKMARKS = [
  { id: 1, title: "Maze Bank Online - Sua conta", url: "https://www.chase.com", color: "#00A550", initial: "M", time: "Hoje" },
  { id: 2, title: "Weazel News - Ultimas noticias de LS", url: "https://www.bbc.com/news", color: "#FF0000", initial: "W", time: "Hoje" },
  { id: 3, title: "LS Customs - Pecas e Servicos", url: "https://www.caranddriver.com", color: "#FF6B00", initial: "L", time: "Ontem" },
  { id: 4, title: "Dynasty 8 - Imoveis em Los Santos", url: "https://www.zillow.com", color: "#E67E22", initial: "D", time: "Ontem" },
  { id: 5, title: "Fleeca Bank - Emprestimos", url: "https://www.bankofamerica.com", color: "#2E86C1", initial: "F", time: "2 dias atras" },
  { id: 6, title: "LifeInvader - Perfil", url: "https://www.facebook.com", color: "#2D88FF", initial: "L", time: "3 dias atras" },
  { id: 7, title: "Legendary Motorsport", url: "https://www.caranddriver.com", color: "#C0392B", initial: "LM", time: "1 semana atras" },
  { id: 8, title: "Ponsonbys - Moda Masculina", url: "https://www.zara.com", color: "#8E44AD", initial: "P", time: "1 semana atras" },
];

const HISTORY = [
  { id: 1, title: "Maze Bank - Extrato Mensal", url: "maze-bank.com/extrato", time: "14:32", color: "#00A550", initial: "M" },
  { id: 2, title: "Weazel News - Assalto ao Fleeca", url: "weazel-news.com/urgente", time: "13:18", color: "#FF0000", initial: "W" },
  { id: 3, title: "LS Customs - Agendamento", url: "ls-customs.com/agendar", time: "11:45", color: "#FF6B00", initial: "L" },
  { id: 4, title: "Bleeter - Timeline", url: "bleeter.com/feed", time: "10:22", color: "#1DA1F2", initial: "B" },
  { id: 5, title: "Dynasty 8 - Apartamento Vinewood", url: "dynasty8.com/apt/2841", time: "09:15", color: "#E67E22", initial: "D" },
  { id: 6, title: "Google - clima los santos", url: "google.com/search?q=clima+ls", time: "08:30", color: "#4285F4", initial: "G" },
];

const DEFAULT_TABS = [
  { id: 1, title: "Maze Bank Online", url: "https://www.chase.com", color: "#00A550", initial: "M" },
  { id: 2, title: "Weazel News", url: "https://www.bbc.com/news", color: "#FF0000", initial: "W" },
  { id: 3, title: "Google", url: "https://www.google.com/search?igu=1", color: "#4285F4", initial: "G" },
];

// ---------- Inline SVG Icons ----------
const ChromeLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <svg width={24} height={24} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#4285F4" />
      <circle cx="12" cy="12" r="4" fill="#fff" />
      <path d="M12 8a4 4 0 0 1 3.46 2H22a10 10 0 0 0-8.54-8L12 8z" fill="#EA4335" />
      <path d="M8.54 14A4 4 0 0 1 8 12a4 4 0 0 1 .54-2L4.26 4.26A10 10 0 0 0 4.26 19.74L8.54 14z" fill="#FBBC05" />
      <path d="M15.46 14H12a4 4 0 0 1-3.46-2l-4.28 5.74A10 10 0 0 0 22 12h-6.54a4 4 0 0 1-3.46 2h3.46z" fill="#34A853" />
      <circle cx="12" cy="12" r="3.5" fill="#4285F4" />
      <circle cx="12" cy="12" r="2" fill="#fff" />
    </svg>
    <span style={{ color: "#fff", fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>Chrome</span>
  </div>
);
const BackArrow = () => (<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
const ForwardArrow = () => (<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>);
const SearchSvg = ({ size = 20, color = "#aaa" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const HomeSvg = ({ active = false }) => (<svg width={22} height={22} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth={active ? 2 : 1.5}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />{!active && <polyline points="9 22 9 12 15 12 15 22" />}</svg>);
const TabsSvg = ({ count = 3 }) => (<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" /><text x="12" y="15" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" stroke="none">{count}</text></svg>);
const BookmarkSvg = () => (<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const BookmarkFilledSvg = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="#FFCA28" stroke="#FFCA28" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const BookmarkOutlineSvg = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const MoreSvg = () => (<svg width={20} height={20} viewBox="0 0 24 24" fill="#aaa"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>);
const LockSvg = () => (<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const CloseSvg = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const PlusSvg = ({ size = 20 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const ClockSvg = () => (<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);

export default function ChromeApp({ onNavigate }) {
  const [view, setView] = useState("home");
  const [tabs, setTabs] = useState(DEFAULT_TABS);
  const [activeTabId, setActiveTabId] = useState(1);
  const [urlInput, setUrlInput] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [bookmarkedUrls, setBookmarkedUrls] = useState({});
  const [historyTab, setHistoryTab] = useState("bookmarks");
  const [searchQuery, setSearchQuery] = useState("");
  const iframeRef = useRef(null);
  const nextTabId = useRef(4);

  const openSite = useCallback((title, url, color, initial) => {
    const newTab = { id: nextTabId.current++, title, url, color, initial };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setCurrentUrl(url);
    setCurrentTitle(title);
    setUrlInput(url.replace(/^https?:\/\//, "").replace(/\/.*$/, ""));
    setView("browser");
  }, []);

  const openUrl = useCallback((url) => {
    let finalUrl = url;
    if (!url.startsWith("http")) {
      if (url.includes(".") && !url.includes(" ")) finalUrl = "https://" + url;
      else finalUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(url)}`;
    }
    const domain = finalUrl.replace(/^https?:\/\//, "").split("/")[0];
    openSite(domain, finalUrl, "#4285F4", domain.charAt(0).toUpperCase());
  }, [openSite]);

  const closeTab = useCallback((tabId) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (next.length === 0) { setView("home"); return prev; }
      if (activeTabId === tabId) setActiveTabId(next[next.length - 1].id);
      return next;
    });
  }, [activeTabId]);

  const toggleBookmark = useCallback((url) => { setBookmarkedUrls((p) => ({ ...p, [url]: !p[url] })); }, []);

  const goToTab = useCallback((tab) => {
    setActiveTabId(tab.id); setCurrentUrl(tab.url); setCurrentTitle(tab.title);
    setUrlInput(tab.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")); setView("browser");
  }, []);

  // ============================================================
  // BROWSER VIEW
  // ============================================================
  if (view === "browser") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "8px 10px", borderBottom: "1px solid #333", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", borderRadius: 24, padding: "8px 12px" }}>
            <LockSvg />
            <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && urlInput.trim()) openUrl(urlInput.trim()); }} placeholder="Pesquisar ou digitar URL" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "inherit" }} />
            {currentUrl && (<button onClick={() => toggleBookmark(currentUrl)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>{bookmarkedUrls[currentUrl] ? <BookmarkFilledSvg /> : <BookmarkOutlineSvg />}</button>)}
          </div>
        </div>
        <div style={{ flex: 1, position: "relative", background: "#111" }}>
          <iframe ref={iframeRef} src={currentUrl} style={{ width: "100%", height: "100%", border: "none" }} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" title={currentTitle} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0", borderTop: "1px solid #333", background: "#0d0d0d", flexShrink: 0 }}>
          <button onClick={() => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><BackArrow /></button>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><ForwardArrow /></button>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><HomeSvg /></button>
          <button onClick={() => setView("tabs")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><TabsSvg count={tabs.length} /></button>
          <button onClick={() => setView("bookmarks")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><MoreSvg /></button>
        </div>
      </div>
    );
  }

  // ============================================================
  // TABS VIEW
  // ============================================================
  if (view === "tabs") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #333", flexShrink: 0 }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><BackArrow /></button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{tabs.length} {tabs.length === 1 ? "aba" : "abas"}</span>
          <button onClick={() => { const newTab = { id: nextTabId.current++, title: "Nova aba", url: "https://www.google.com/search?igu=1", color: "#4285F4", initial: "G" }; setTabs((prev) => [...prev, newTab]); goToTab(newTab); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><PlusSvg /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => goToTab(tab)} style={{ background: activeTabId === tab.id ? "#1a1a1a" : "#111", border: activeTabId === tab.id ? "2px solid #4285F4" : "1px solid #333", borderRadius: 12, padding: 0, cursor: "pointer", overflow: "hidden", textAlign: "left", transition: "all 200ms" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#1a1a1a", borderBottom: "1px solid #222" }}>
                <div style={{ width: 24, height: 24, borderRadius: 4, background: tab.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{tab.initial}</div>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tab.title}</span>
                <div onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} style={{ cursor: "pointer", display: "flex", padding: 2 }}><CloseSvg /></div>
              </div>
              <div style={{ height: 140, background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${tab.color}, ${tab.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff" }}>{tab.initial}</div>
                <div style={{ position: "absolute", bottom: 8, left: 12, color: "#666", fontSize: 11 }}>{tab.url.replace(/^https?:\/\//, "").split("/")[0]}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 0", borderTop: "1px solid #333", background: "#0d0d0d", flexShrink: 0 }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer" }}><HomeSvg /></button>
          <button onClick={() => setView("bookmarks")} style={{ background: "none", border: "none", cursor: "pointer" }}><BookmarkSvg /></button>
        </div>
      </div>
    );
  }

  // ============================================================
  // BOOKMARKS / HISTORY VIEW
  // ============================================================
  if (view === "bookmarks") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #333", flexShrink: 0 }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><BackArrow /></button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 600, flex: 1 }}>Favoritos e Historico</span>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #333", flexShrink: 0 }}>
          {["bookmarks", "history"].map((tab) => (
            <button key={tab} onClick={() => setHistoryTab(tab)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer", color: historyTab === tab ? "#4285F4" : "#aaa", fontSize: 14, fontWeight: 600, borderBottom: historyTab === tab ? "2px solid #4285F4" : "2px solid transparent", transition: "all 200ms" }}>
              {tab === "bookmarks" ? "Favoritos" : "Historico"}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {historyTab === "bookmarks" ? (
            <div>
              <div style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", borderRadius: 8, padding: "8px 12px" }}>
                  <SearchSvg size={16} color="#666" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar favoritos" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "inherit" }} />
                </div>
              </div>
              {BOOKMARKS.filter((b) => !searchQuery.trim() || b.title.toLowerCase().includes(searchQuery.toLowerCase())).map((bm) => (
                <button key={bm.id} onClick={() => openSite(bm.title, bm.url, bm.color, bm.initial)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #1a1a1a", textAlign: "left" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: bm.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{bm.initial}</div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bm.title}</div>
                    <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{bm.time}</div>
                  </div>
                  <BookmarkFilledSvg />
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ padding: "14px 16px 6px" }}><span style={{ color: "#aaa", fontSize: 13, fontWeight: 600 }}>Hoje</span></div>
              {HISTORY.map((item) => (
                <button key={item.id} onClick={() => openSite(item.title, `https://${item.url}`, item.color, item.initial)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #1a1a1a", textAlign: "left" }}>
                  <ClockSvg />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                    <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{item.url} - {item.time}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 0", borderTop: "1px solid #333", background: "#0d0d0d", flexShrink: 0 }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer" }}><HomeSvg /></button>
          <button onClick={() => setView("tabs")} style={{ background: "none", border: "none", cursor: "pointer" }}><TabsSvg count={tabs.length} /></button>
        </div>
      </div>
    );
  }

  // ============================================================
  // HOME VIEW
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px", flexShrink: 0 }}>
        <ChromeLogo />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("tabs")} style={{ background: "none", border: "none", cursor: "pointer" }}><TabsSvg count={tabs.length} /></button>
          <button onClick={() => setView("bookmarks")} style={{ background: "none", border: "none", cursor: "pointer" }}><MoreSvg /></button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "8px 16px 20px" }}>
          <button onClick={() => { setUrlInput(""); setView("browser"); setCurrentUrl("https://www.google.com/search?igu=1"); setCurrentTitle("Google"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "#1a1a1a", borderRadius: 24, padding: "12px 16px", border: "none", cursor: "pointer" }}>
            <SearchSvg size={18} color="#8ab4f8" />
            <span style={{ color: "#8ab4f8", fontSize: 14, flex: 1, textAlign: "left" }}>Pesquisar ou digitar URL</span>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#8ab4f8" strokeWidth="2"><path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z" /><path d="M12 14v.01M12 11a1 1 0 0 1 1 1" /></svg>
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: "0 24px 24px" }}>
          {SHORTCUTS.map((shortcut) => (
            <button key={shortcut.id} onClick={() => openSite(shortcut.name, shortcut.url, shortcut.color, shortcut.initial)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #333", transition: "background 200ms" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${shortcut.color}, ${shortcut.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: shortcut.initial.length > 1 ? 10 : 14, fontWeight: 700, color: "#fff" }}>{shortcut.initial}</div>
              </div>
              <span style={{ color: "#ccc", fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 70, textAlign: "center" }}>{shortcut.name}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Discover</span>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </button>
          </div>
          {[
            { id: 1, source: "Weazel News", title: "Operacao policial prende 12 suspeitos em grande operacao anti-drogas em Davis", time: "3h", color: "#FF0000", initial: "W" },
            { id: 2, source: "LS Times", title: "Maze Bank anuncia novo programa de investimentos para pequenos empreendedores de LS", time: "5h", color: "#00A550", initial: "L" },
            { id: 3, source: "Vinewood Star", title: "Novo filme sendo gravado em Vinewood Boulevard atrai multidoes de curiosos", time: "8h", color: "#E67E22", initial: "V" },
            { id: 4, source: "Sandy Shore Herald", title: "Festival de carros classicos em Sandy Shores bate recorde de participantes", time: "12h", color: "#3498DB", initial: "S" },
          ].map((news) => (
            <button key={news.id} onClick={() => openSite(news.source, "https://www.bbc.com/news", news.color, news.initial)} style={{ display: "flex", gap: 12, width: "100%", padding: "14px 0", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #1a1a1a", textAlign: "left" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: news.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{news.initial}</div>
                  <span style={{ color: "#aaa", fontSize: 12 }}>{news.source}</span>
                  <span style={{ color: "#666", fontSize: 11 }}>{news.time}</span>
                </div>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{news.title}</div>
              </div>
              <div style={{ width: 80, height: 80, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${news.color}44, ${news.color}22)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${news.color}, ${news.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{news.initial}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ height: 24 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0 10px", borderTop: "1px solid #333", background: "#0d0d0d", flexShrink: 0 }}>
        {[
          { key: "home", label: "Inicio", icon: <HomeSvg active={true} /> },
          { key: "tabs", label: "Abas", icon: <TabsSvg count={tabs.length} /> },
          { key: "bookmarks", label: "Favoritos", icon: <BookmarkSvg /> },
        ].map((item) => (
          <button key={item.key} onClick={() => setView(item.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer" }}>
            {item.icon}
            <span style={{ color: item.key === "home" ? "#fff" : "#aaa", fontSize: 10, fontWeight: item.key === "home" ? 600 : 400 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

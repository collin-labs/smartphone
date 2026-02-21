import React, { useState, useCallback } from "react";

// ============================================================
// Twitch App — Pixel-perfect 2025/2026 dark mode replica
// Telas: home | player | browse | profile
// Embeds REAIS via player.twitch.tv — NO backend handlers
// ============================================================

const CURRENT_USER = {
  id: 1, name: "carlos_silva", displayName: "carlos_silva",
  color: "#9146FF", initial: "C", followers: 342, following: 128,
};

const LIVE_CHANNELS = [
  { id: 1, channel: "gaules", displayName: "Gaules", category: "GTA V", title: "GTA RP - Cidade Alta - Dia de correria no RP!!", viewers: "85.2K", color: "#FF6B00", initial: "G", isLive: true, uptime: "4h32m", tags: ["Portugues", "GTA RP"] },
  { id: 2, channel: "casimito", displayName: "Casimiro", category: "Just Chatting", title: "REAGINDO A TUDO - Reacts e papo com o chat", viewers: "120K", color: "#FFCA28", initial: "C", isLive: true, uptime: "2h15m", tags: ["Portugues", "Reacts"] },
  { id: 3, channel: "loud_coringa", displayName: "LOUD Coringa", category: "Valorant", title: "RANQUEADA IMORTAL - RUMO AO RADIANTE!!", viewers: "42.8K", color: "#1DB954", initial: "LC", isLive: true, uptime: "6h01m", tags: ["Portugues", "FPS"] },
  { id: 4, channel: "alanzoka", displayName: "alanzoka", category: "Minecraft", title: "Minecraft Hardcore - Dia 1000!! Nao posso morrer", viewers: "65.3K", color: "#E91E63", initial: "A", isLive: true, uptime: "3h45m", tags: ["Portugues", "Survival"] },
  { id: 5, channel: "cellbit", displayName: "Cellbit", category: "GTA V", title: "GTA RP - Los Santos Police Department - Patrulha noturna", viewers: "38.9K", color: "#3498DB", initial: "CB", isLive: true, uptime: "1h22m", tags: ["Portugues", "GTA RP"] },
  { id: 6, channel: "baiano", displayName: "Baiano", category: "League of Legends", title: "CHALLENGER EU VOU - SoloQ ate o amanhecer", viewers: "28.5K", color: "#9B59B6", initial: "B", isLive: true, uptime: "5h10m", tags: ["Portugues", "MOBA"] },
  { id: 7, channel: "felps", displayName: "Felps", category: "GTA V", title: "GTA RP - Vida de mecanico na LS Customs!! Dia agitado", viewers: "51.2K", color: "#FF0000", initial: "F", isLive: true, uptime: "2h55m", tags: ["Portugues", "GTA RP"] },
  { id: 8, channel: "bfrfrags", displayName: "bfrfrags", category: "Counter-Strike 2", title: "CS2 FACEIT LVL 10 - Gameplay chill com o chat", viewers: "15.7K", color: "#E67E22", initial: "BF", isLive: true, uptime: "7h30m", tags: ["Portugues", "FPS"] },
];

const CATEGORIES = [
  { id: 1, name: "GTA V", viewers: "312K", color: "#FF6B00", tags: ["RPG", "Acao"] },
  { id: 2, name: "Just Chatting", viewers: "890K", color: "#9146FF", tags: ["IRL"] },
  { id: 3, name: "Valorant", viewers: "245K", color: "#FF4655", tags: ["FPS", "Shooter"] },
  { id: 4, name: "League of Legends", viewers: "430K", color: "#C89B3C", tags: ["MOBA"] },
  { id: 5, name: "Minecraft", viewers: "180K", color: "#5D8C3E", tags: ["Survival", "Sandbox"] },
  { id: 6, name: "Counter-Strike 2", viewers: "210K", color: "#DE9B35", tags: ["FPS", "Shooter"] },
  { id: 7, name: "Fortnite", viewers: "195K", color: "#2D88FF", tags: ["Battle Royale"] },
  { id: 8, name: "Apex Legends", viewers: "120K", color: "#DA292A", tags: ["FPS", "Battle Royale"] },
  { id: 9, name: "FIFA 26", viewers: "88K", color: "#1DB954", tags: ["Esportes"] },
  { id: 10, name: "Slots", viewers: "340K", color: "#FFD700", tags: ["Cassino"] },
  { id: 11, name: "Music", viewers: "76K", color: "#E91E63", tags: ["IRL", "Criativo"] },
  { id: 12, name: "Art", viewers: "42K", color: "#9B59B6", tags: ["Criativo"] },
];

const FOLLOWED_CHANNELS = LIVE_CHANNELS.slice(0, 5);

const CHAT_MESSAGES = [
  { id: 1, user: "xGamer_BR", color: "#FF6B00", message: "KKKKKKKK muito bom" },
  { id: 2, user: "ana_plays", color: "#E91E63", message: "VAMO VAMO VAMO!!" },
  { id: 3, user: "felipezin99", color: "#1DB954", message: "pog pog pog" },
  { id: 4, user: "lucastv", color: "#3498DB", message: "Esse cara eh craque demais" },
  { id: 5, user: "memes_ls", color: "#FFD700", message: "OMEGALUL" },
  { id: 6, user: "ju_ferreira", color: "#9B59B6", message: "gg ez" },
  { id: 7, user: "rafinha_gol", color: "#E67E22", message: "quem veio pelo twitter da like" },
  { id: 8, user: "dark_knight22", color: "#FF0000", message: "LUL caiu denovo" },
  { id: 9, user: "samurai_br", color: "#1DA1F2", message: "so vim ver o caos KKKK" },
  { id: 10, user: "nina_cosplay", color: "#FF69B4", message: "CATJAM CATJAM" },
];

const NOTIFICATIONS = [
  { id: 1, type: "live", channel: "Gaules", message: "esta ao vivo: GTA RP", time: "Agora", color: "#FF6B00", initial: "G" },
  { id: 2, type: "live", channel: "Casimiro", message: "esta ao vivo: Just Chatting", time: "2h", color: "#FFCA28", initial: "C" },
  { id: 3, type: "raid", channel: "Felps", message: "fez raid com 12K viewers", time: "3h", color: "#FF0000", initial: "F" },
  { id: 4, type: "follow", channel: "alanzoka", message: "seguiu voce de volta!", time: "5h", color: "#E91E63", initial: "A" },
  { id: 5, type: "sub", channel: "LOUD Coringa", message: "agradeceu sua inscricao", time: "1d", color: "#1DB954", initial: "LC" },
];

// ---------- Inline SVG Icons ----------
const TwitchLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <svg width={22} height={24} viewBox="0 0 24 28">
      <path d="M4.265 0L1 3.265v17.47h5.735V24l3.265-3.265h2.612L22.347 12V0H4.265zm16.082 11.143l-3.612 3.612h-3.612l-3.163 3.163v-3.163H5.735V2h14.612v9.143z" fill="#9146FF" />
      <path d="M17.735 4h-2v5.143h2V4zm-5.143 0h-2v5.143h2V4z" fill="#9146FF" />
    </svg>
    <span style={{ color: "#fff", fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Twitch</span>
  </div>
);
const BackArrow = () => (<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
const SearchSvg = ({ size = 20, color = "#aaa" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const HomeSvg = ({ active = false }) => (<svg width={22} height={22} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth={active ? 2 : 1.5}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />{!active && <polyline points="9 22 9 12 15 12 15 22" />}</svg>);
const BrowseSvg = ({ active = false }) => (<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={active ? 2 : 1.5}><circle cx="12" cy="12" r="10" /><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill={active ? "#fff" : "none"} /></svg>);
const ProfileSvg = ({ active = false }) => (<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={active ? 2 : 1.5}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" fill={active ? "#fff" : "none"} /></svg>);
const ChatSvg = () => (<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const SettingsSvg = () => (<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
const LiveDot = () => (<div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF0000", animation: "twitch-pulse 1.5s ease-in-out infinite" }}><style>{`@keyframes twitch-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style></div>);

export default function TwitchApp({ onNavigate }) {
  const [view, setView] = useState("home");
  const [selectedChannel, setSelectedChannel] = useState(LIVE_CHANNELS[0]);
  const [followedChannelIds, setFollowedChannelIds] = useState(
    Object.fromEntries(FOLLOWED_CHANNELS.map((c) => [c.id, true]))
  );
  const [showChat, setShowChat] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [browseSearch, setBrowseSearch] = useState("");
  const [browseFilter, setBrowseFilter] = useState("Todos");
  const [profileTab, setProfileTab] = useState("seguindo");

  const toggleFollow = useCallback((channelId) => { setFollowedChannelIds((p) => ({ ...p, [channelId]: !p[channelId] })); }, []);
  const openStream = useCallback((channel) => { setSelectedChannel(channel); setView("player"); }, []);

  const BROWSE_FILTERS = ["Todos", "GTA RP", "FPS", "MOBA", "IRL", "Criativo"];
  const filteredCategories = browseFilter === "Todos" ? CATEGORIES : CATEGORIES.filter((c) => c.tags.some((t) => t.toLowerCase() === browseFilter.toLowerCase()));
  const searchedCategories = browseSearch.trim() ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(browseSearch.toLowerCase())) : filteredCategories;

  // Bottom nav helper
  const BottomNav = ({ activeKey }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0 10px", borderTop: "1px solid #1a1a2e", background: "#0e0e10", flexShrink: 0 }}>
      {[
        { key: "home", label: "Inicio", icon: <HomeSvg active={activeKey === "home"} /> },
        { key: "browse", label: "Explorar", icon: <BrowseSvg active={activeKey === "browse"} /> },
        { key: "profile", label: "Perfil", icon: <ProfileSvg active={activeKey === "profile"} /> },
      ].map((item) => (
        <button key={item.key} onClick={() => setView(item.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer" }}>
          {item.icon}
          <span style={{ color: activeKey === item.key ? "#fff" : "#aaa", fontSize: 10, fontWeight: activeKey === item.key ? 600 : 400 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );

  // ============================================================
  // PLAYER VIEW
  // ============================================================
  if (view === "player") {
    const ch = selectedChannel;
    const isFollowed = followedChannelIds[ch.id] || false;
    return (
      <div style={{ width: "100%", height: "100%", background: "#0e0e10", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", position: "relative", flexShrink: 0 }}>
          <iframe src={`https://player.twitch.tv/?channel=${ch.channel}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}&muted=false`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
          <div style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 4, background: "#FF0000", borderRadius: 4, padding: "2px 8px" }}><span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>AO VIVO</span></div>
          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: "2px 8px" }}><LiveDot /><span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{ch.viewers}</span></div>
          <button onClick={() => setView("home")} style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}><BackArrow /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: "1px solid #1a1a2e" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: ch.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", border: "2px solid #9146FF" }}>{ch.initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.displayName}</div>
            <div style={{ color: "#aaa", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ color: "#9146FF", fontSize: 11, fontWeight: 600 }}>{ch.category}</span>
              <span style={{ color: "#666", fontSize: 11 }}>{ch.uptime}</span>
            </div>
          </div>
          <button onClick={() => toggleFollow(ch.id)} style={{ padding: "6px 14px", borderRadius: 6, flexShrink: 0, background: isFollowed ? "#333" : "#9146FF", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 200ms" }}>{isFollowed ? "Seguindo" : "Seguir"}</button>
        </div>
        <div style={{ display: "flex", gap: 6, padding: "6px 12px", flexShrink: 0 }}>
          {ch.tags.map((tag) => (<span key={tag} style={{ background: "#1a1a2e", borderRadius: 12, padding: "3px 10px", color: "#aaa", fontSize: 11, fontWeight: 500 }}>{tag}</span>))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", borderBottom: "1px solid #1a1a2e", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Chat da live</span>
          <button onClick={() => setShowChat(!showChat)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9146FF", fontSize: 12, fontWeight: 600 }}>{showChat ? "Ocultar" : "Mostrar"}</button>
        </div>
        {showChat && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 12px" }}>
              {CHAT_MESSAGES.map((msg) => (
                <div key={msg.id} style={{ padding: "3px 0", lineHeight: 1.5 }}>
                  <span style={{ color: msg.color, fontSize: 12, fontWeight: 700 }}>{msg.user}</span>
                  <span style={{ color: "#efeff1", fontSize: 12 }}>: {msg.message}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderTop: "1px solid #1a1a2e", flexShrink: 0 }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Enviar mensagem" style={{ flex: 1, background: "#1a1a2e", border: "none", borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              <button style={{ background: "#9146FF", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700 }}>Chat</button>
            </div>
          </div>
        )}
        <BottomNav activeKey="" />
      </div>
    );
  }

  // ============================================================
  // BROWSE VIEW
  // ============================================================
  if (view === "browse") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0e0e10", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a2e", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Explorar</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a2e", borderRadius: 8, padding: "8px 12px" }}>
            <SearchSvg size={16} color="#666" />
            <input value={browseSearch} onChange={(e) => setBrowseSearch(e.target.value)} placeholder="Pesquisar categorias" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", paddingBottom: 2 }}>
            {BROWSE_FILTERS.map((f) => (
              <button key={f} onClick={() => { setBrowseFilter(f); setBrowseSearch(""); }} style={{ padding: "5px 14px", borderRadius: 16, whiteSpace: "nowrap", background: browseFilter === f ? "#9146FF" : "#1a1a2e", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 200ms" }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {searchedCategories.map((cat) => (
              <button key={cat.id} onClick={() => { const ch = LIVE_CHANNELS.find((c) => c.category === cat.name); if (ch) openStream(ch); }} style={{ background: "#18181b", borderRadius: 10, overflow: "hidden", border: "1px solid #1a1a2e", cursor: "pointer", textAlign: "left", transition: "border-color 200ms" }}>
                <div style={{ width: "100%", aspectRatio: "4/5", background: `linear-gradient(135deg, ${cat.color}, ${cat.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", opacity: 0.3 }}>{cat.name.substring(0, 2).toUpperCase()}</span>
                  <div style={{ position: "absolute", bottom: 6, left: 6, display: "flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: "2px 6px" }}>
                    <LiveDot /><span style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>{cat.viewers}</span>
                  </div>
                </div>
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {cat.tags.map((tag) => (<span key={tag} style={{ background: "#1a1a2e", borderRadius: 8, padding: "1px 8px", color: "#aaa", fontSize: 10 }}>{tag}</span>))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <BottomNav activeKey="browse" />
      </div>
    );
  }

  // ============================================================
  // PROFILE VIEW
  // ============================================================
  if (view === "profile") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0e0e10", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #1a1a2e", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Perfil</span>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}><SettingsSvg /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 16px", borderBottom: "1px solid #1a1a2e" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: CURRENT_USER.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff", border: "3px solid #9146FF" }}>{CURRENT_USER.initial}</div>
            <div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{CURRENT_USER.displayName}</div>
              <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                <div><span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{CURRENT_USER.following}</span><span style={{ color: "#aaa", fontSize: 12, marginLeft: 4 }}>Seguindo</span></div>
                <div><span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{CURRENT_USER.followers}</span><span style={{ color: "#aaa", fontSize: 12, marginLeft: 4 }}>Seguidores</span></div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", borderBottom: "1px solid #1a1a2e", flexShrink: 0 }}>
            {["seguindo", "notificacoes"].map((tab) => (
              <button key={tab} onClick={() => setProfileTab(tab)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer", color: profileTab === tab ? "#9146FF" : "#aaa", fontSize: 14, fontWeight: 600, borderBottom: profileTab === tab ? "2px solid #9146FF" : "2px solid transparent", transition: "all 200ms" }}>
                {tab === "seguindo" ? "Seguindo" : "Notificacoes"}
              </button>
            ))}
          </div>
          {profileTab === "seguindo" ? (
            <div>
              {LIVE_CHANNELS.filter((ch) => followedChannelIds[ch.id]).map((ch) => (
                <button key={ch.id} onClick={() => openStream(ch)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #1a1a2e", textAlign: "left" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", border: ch.isLive ? "2px solid #FF0000" : "2px solid #333" }}>{ch.initial}</div>
                    {ch.isLive && (<div style={{ position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", background: "#FF0000", borderRadius: 4, padding: "0 4px", fontSize: 8, fontWeight: 700, color: "#fff", border: "1px solid #0e0e10" }}>LIVE</div>)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{ch.displayName}</div>
                    <div style={{ color: "#aaa", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.category}</div>
                  </div>
                  {ch.isLive && (<div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><LiveDot /><span style={{ color: "#FF0000", fontSize: 12, fontWeight: 600 }}>{ch.viewers}</span></div>)}
                </button>
              ))}
              <div style={{ padding: "14px 16px 6px" }}><span style={{ color: "#aaa", fontSize: 13, fontWeight: 600 }}>Canais offline</span></div>
              {LIVE_CHANNELS.filter((ch) => !followedChannelIds[ch.id]).slice(0, 3).map((ch) => (
                <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid #1a1a2e" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#666" }}>{ch.initial}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#aaa", fontSize: 14, fontWeight: 600 }}>{ch.displayName}</div>
                    <div style={{ color: "#666", fontSize: 12 }}>Offline</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {NOTIFICATIONS.map((notif) => (
                <div key={notif.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #1a1a2e" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: notif.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{notif.initial}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ lineHeight: 1.4 }}><span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{notif.channel}</span><span style={{ color: "#aaa", fontSize: 13 }}> {notif.message}</span></div>
                    <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>{notif.time}</div>
                  </div>
                  {notif.type === "live" && (<div style={{ display: "flex", alignItems: "center", gap: 3, background: "#FF0000", borderRadius: 4, padding: "3px 8px" }}><LiveDot /><span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>LIVE</span></div>)}
                </div>
              ))}
            </div>
          )}
        </div>
        <BottomNav activeKey="profile" />
      </div>
    );
  }

  // ============================================================
  // HOME VIEW
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#0e0e10", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #1a1a2e", flexShrink: 0 }}>
        <TwitchLogo />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setView("browse")} style={{ background: "none", border: "none", cursor: "pointer" }}><SearchSvg size={22} color="#fff" /></button>
          <button onClick={() => onNavigate?.("home")} style={{ background: "none", border: "none", cursor: "pointer" }}><ChatSvg /></button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ position: "relative" }}>
          <button onClick={() => openStream(LIVE_CHANNELS[0])} style={{ width: "100%", aspectRatio: "16/9", border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${LIVE_CHANNELS[0].color}, ${LIVE_CHANNELS[0].color}66)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#fff", opacity: 0.15 }}>LIVE</div>
            <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 4, background: "#FF0000", borderRadius: 4, padding: "3px 8px" }}><LiveDot /><span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>AO VIVO</span></div>
            <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: "3px 8px" }}><span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{LIVE_CHANNELS[0].viewers} viewers</span></div>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: LIVE_CHANNELS[0].color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", border: "2px solid #FF0000" }}>{LIVE_CHANNELS[0].initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{LIVE_CHANNELS[0].displayName}</div>
              <div style={{ color: "#aaa", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{LIVE_CHANNELS[0].title}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "6px 14px 8px" }}><div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Canais que voce segue</div></div>
        <div style={{ display: "flex", gap: 10, padding: "0 14px 16px", overflowX: "auto" }}>
          {LIVE_CHANNELS.slice(0, 6).map((ch) => (
            <button key={ch.id} onClick={() => openStream(ch)} style={{ minWidth: 72, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", border: "2px solid #FF0000" }}>{ch.initial}</div>
                <div style={{ position: "absolute", bottom: -3, left: "50%", transform: "translateX(-50%)", background: "#FF0000", borderRadius: 4, padding: "0 5px", fontSize: 8, fontWeight: 700, color: "#fff", border: "2px solid #0e0e10" }}>LIVE</div>
              </div>
              <span style={{ color: "#ccc", fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 72, textAlign: "center" }}>{ch.displayName.length > 8 ? ch.displayName.substring(0, 8) + "..." : ch.displayName}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "0 14px" }}>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recomendados para voce</div>
          {LIVE_CHANNELS.slice(1).map((ch) => (
            <button key={ch.id} onClick={() => openStream(ch)} style={{ display: "flex", gap: 10, width: "100%", padding: "8px 0", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #1a1a2e", textAlign: "left" }}>
              <div style={{ width: 140, aspectRatio: "16/9", borderRadius: 6, flexShrink: 0, background: `linear-gradient(135deg, ${ch.color}88, ${ch.color}33)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", opacity: 0.2 }}>{ch.initial}</span>
                <div style={{ position: "absolute", top: 4, left: 4, background: "#FF0000", borderRadius: 3, padding: "1px 5px" }}><span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>LIVE</span></div>
                <div style={{ position: "absolute", bottom: 4, left: 4, display: "flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.7)", borderRadius: 3, padding: "1px 5px" }}><LiveDot /><span style={{ color: "#fff", fontSize: 9, fontWeight: 600 }}>{ch.viewers}</span></div>
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.displayName}</div>
                <div style={{ color: "#aaa", fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.title}</div>
                <div style={{ color: "#9146FF", fontSize: 11, fontWeight: 600, marginTop: 3 }}>{ch.category}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {ch.tags.slice(0, 2).map((tag) => (<span key={tag} style={{ background: "#1a1a2e", borderRadius: 8, padding: "1px 8px", color: "#aaa", fontSize: 10 }}>{tag}</span>))}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ height: 16 }} />
      </div>
      <BottomNav activeKey="home" />
    </div>
  );
}

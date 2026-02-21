import React, { useState, useCallback, useEffect } from "react";
import { fetchBackend } from '../hooks/useNui';

// ============================================================
// YouTube App — Pixel-perfect 2025/2026 dark mode replica
// Telas: home | player | shorts | favorites | search
// Videos REAIS via iframe do YouTube
// V0 layout: 100% preservado | Backend: fetchBackend integrado
// ============================================================

// ---------- Helpers ----------

function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}

function getInitial(name) {
  return (name || '?')[0].toUpperCase();
}

function getColor(id) {
  const colors = ['#FF0000','#FFD700','#1DB954','#0A66C2','#FF6B00','#9B59B6','#E91E63'];
  return colors[(id || 0) % colors.length];
}

// ---------- Dados mock FALLBACK (GTA RP / Los Santos) ----------

const MOCK_CHANNELS = [
  { id: 1, name: "Weazel News LS", color: "#FF0000", initial: "W", subscribers: "15K" },
  { id: 2, name: "Memes de LS", color: "#FFD700", initial: "M", subscribers: "28K" },
  { id: 3, name: "LS Music", color: "#1DB954", initial: "♫", subscribers: "42K" },
  { id: 4, name: "LS Tutoriais", color: "#0A66C2", initial: "T", subscribers: "8.5K" },
  { id: 5, name: "Street Racing LS", color: "#FF6B00", initial: "R", subscribers: "19K" },
];

const MOCK_VIDEOS = [
  { id: 1, channel_id: 3, youtube_id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up - Rick Astley", category: "musica", views: "1.5M", time: "ha 2d", duration: "3:33", is_short: false, likes: "45K", dislikes: "1.2K" },
  { id: 2, channel_id: 2, youtube_id: "J---aiyznGQ", title: "Keyboard Cat - O Classico dos Memes", category: "memes", views: "850K", time: "ha 1s", duration: "0:54", is_short: true, likes: "32K", dislikes: "420" },
  { id: 3, channel_id: 3, youtube_id: "kJQP7kiw5Fk", title: "Despacito - Luis Fonsi ft. Daddy Yankee", category: "musica", views: "2.8M", time: "ha 3d", duration: "4:42", is_short: false, likes: "89K", dislikes: "3.1K" },
  { id: 4, channel_id: 1, youtube_id: "HEfHFsfGIhQ", title: "URGENTE: Tiroteio em Vinewood Boulevard", category: "noticias", views: "120K", time: "ha 5h", duration: "2:15", is_short: false, likes: "8.7K", dislikes: "230" },
  { id: 5, channel_id: 4, youtube_id: "rfscVS0vtbw", title: "Python para Iniciantes - Curso Completo", category: "tutorial", views: "340K", time: "ha 1s", duration: "10:24", is_short: false, likes: "21K", dislikes: "890" },
  { id: 6, channel_id: 5, youtube_id: "2MtOpB_S0IA", title: "DRIFT INSANO - Compilacao Street Racing LS", category: "carros", views: "560K", time: "ha 4d", duration: "5:17", is_short: false, likes: "34K", dislikes: "670" },
  { id: 7, channel_id: 3, youtube_id: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody - Queen (Classico)", category: "musica", views: "3.2M", time: "ha 1s", duration: "5:55", is_short: false, likes: "120K", dislikes: "2.1K" },
  { id: 8, channel_id: 2, youtube_id: "QH2-TGUlwu4", title: "Nyan Cat mas em Los Santos", category: "memes", views: "1.2M", time: "ha 2s", duration: "0:30", is_short: true, likes: "56K", dislikes: "1.5K" },
];

const CATEGORIES = ["Todos", "Musica", "Memes", "Noticias", "Carros", "Tutoriais"];
const RECENT_SEARCHES = ["drift los santos", "weazel news ao vivo", "memes gta", "musica chill", "tutorial mecanico"];

// ---------- Inline SVG Icons (100% V0) ----------

const YouTubeLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    <svg width={28} height={20} viewBox="0 0 28 20">
      <rect x="0" y="0" width="28" height="20" rx="4" fill="#FF0000" />
      <polygon points="11,4 11,16 21,10" fill="#fff" />
    </svg>
    <span style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>YouTube</span>
  </div>
);

const BackArrow = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const SearchSvg = ({ size = 22, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CastSvg = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
    <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
    <line x1="2" y1="20" x2="2.01" y2="20" />
  </svg>
);

const HomeSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    {!active && <polyline points="9 22 9 12 15 12 15 22" />}
  </svg>
);

const ShortsSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <rect x="7" y="2" width="10" height="20" rx="3" />
    <polygon points="11,8 11,16 16,12" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth="1.5" />
  </svg>
);

const FavSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ProfileSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ThumbUpSvg = ({ filled = false }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill={filled ? "#3EA6FF" : "none"} stroke={filled ? "#3EA6FF" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ThumbDownSvg = ({ filled = false }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill={filled ? "#3EA6FF" : "none"} stroke={filled ? "#3EA6FF" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

const ShareSvg = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const SaveSvg = ({ filled = false }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill={filled ? "#fff" : "none"} stroke="#fff" strokeWidth="1.5">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const PlayOverlay = ({ size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "rgba(0,0,0,0.65)", display: "flex",
    alignItems: "center", justifyContent: "center",
  }}>
    <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="#fff">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  </div>
);

const HeartSvg = ({ filled = false, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#FF0000" : "none"} stroke={filled ? "#FF0000" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentSvg = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const RepeatSvg = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const CloseSvg = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ============================================================
// Component
// ============================================================

export default function YouTube({ onNavigate }) {
  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [likedVideos, setLikedVideos] = useState({});
  const [dislikedVideos, setDislikedVideos] = useState({});
  const [savedVideos, setSavedVideos] = useState({});
  const [subscribedChannels, setSubscribedChannels] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [shortsIndex, setShortsIndex] = useState(0);
  const [shortsLiked, setShortsLiked] = useState({});

  // Backend state
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [channels, setChannels] = useState(MOCK_CHANNELS);

  // Channel lookup helper
  const getChannel = (channelId) => channels.find((c) => c.id === channelId) || { id: 0, name: 'Canal', color: '#666', initial: '?', subscribers: '0' };

  // Derived data
  const shortVideos = videos.filter((v) => v.is_short);
  const longVideos = videos.filter((v) => !v.is_short);

  const filteredVideos = activeCategory === "Todos"
    ? videos
    : videos.filter((v) => {
        const cat = activeCategory.toLowerCase();
        const vcat = (v.category || '').toLowerCase();
        return vcat === cat || vcat === cat.replace('musica', 'musica').replace('noticias', 'noticias').replace('tutoriais', 'tutorial');
      });

  const searchResults = searchQuery.trim()
    ? videos.filter((v) =>
      (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      getChannel(v.channel_id).name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  // ---- Load data from backend ----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchBackend('youtube_init');
        if (res?.ok) {
          if (res.channels?.length) {
            setChannels(res.channels.map(c => ({
              id: c.id,
              name: c.name,
              color: c.color || getColor(c.id),
              initial: c.initial || getInitial(c.name),
              subscribers: formatCount(c.subscribers_count || 0),
            })));
          }
          if (res.videos?.length) {
            setVideos(res.videos.map(v => ({
              id: v.id,
              channel_id: v.channel_id,
              youtube_id: v.youtube_id,
              title: v.title,
              category: v.category || '',
              views: formatCount(v.views_count || 0),
              time: '',
              duration: v.duration || '0:00',
              is_short: v.is_short ? true : false,
              likes: formatCount(v.likes_count || 0),
              dislikes: '0',
            })));
          }
        }
      } catch (e) { console.log('[YouTube] Init fallback to mock'); }
    })();
  }, []);

  // ---- Actions ----
  const toggleLike = useCallback(async (videoId) => {
    setLikedVideos((p) => ({ ...p, [videoId]: !p[videoId] }));
    setDislikedVideos((p) => ({ ...p, [videoId]: false }));
    try { await fetchBackend('youtube_toggle_favorite', { videoId }); } catch (e) {}
  }, []);

  const toggleDislike = useCallback((videoId) => {
    setDislikedVideos((p) => ({ ...p, [videoId]: !p[videoId] }));
    setLikedVideos((p) => ({ ...p, [videoId]: false }));
  }, []);

  const toggleSave = useCallback(async (videoId) => {
    setSavedVideos((p) => ({ ...p, [videoId]: !p[videoId] }));
    try { await fetchBackend('youtube_toggle_favorite', { videoId }); } catch (e) {}
  }, []);

  const toggleSubscribe = useCallback((channelId) => {
    setSubscribedChannels((p) => ({ ...p, [channelId]: !p[channelId] }));
  }, []);

  const openVideo = useCallback((video) => {
    setSelectedVideo(video);
    setView("player");
    fetchBackend('youtube_add_history', { videoId: video.id }).catch(() => {});
  }, []);

  const savedList = videos.filter((v) => savedVideos[v.id]);

  // ============================================================
  // SEARCH VIEW
  // ============================================================
  if (view === "search") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderBottom: "1px solid #333", flexShrink: 0,
        }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 }}>
            <BackArrow />
          </button>
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            background: "#222", borderRadius: 20, padding: "8px 14px", gap: 8,
          }}>
            <SearchSvg size={16} color="#888" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar no YouTube"
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#fff", fontSize: 14, fontFamily: "inherit",
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <CloseSvg />
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {!searchQuery.trim() ? (
            <div style={{ padding: "16px" }}>
              <div style={{ color: "#aaa", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Pesquisas recentes</div>
              {RECENT_SEARCHES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(s)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%",
                    padding: "10px 0", background: "none", border: "none", cursor: "pointer",
                    borderBottom: "1px solid #1a1a1a",
                  }}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span style={{ color: "#fff", fontSize: 14 }}>{s}</span>
                </button>
              ))}
            </div>
          ) : (
            <div>
              {searchResults.length === 0 && (
                <div style={{ padding: 32, textAlign: "center", color: "#666", fontSize: 14 }}>
                  Nenhum resultado encontrado
                </div>
              )}
              {searchResults.map((video) => {
                const channel = getChannel(video.channel_id);
                return (
                  <button
                    key={video.id}
                    onClick={() => openVideo(video)}
                    style={{
                      display: "flex", flexDirection: "column", width: "100%",
                      background: "none", border: "none", cursor: "pointer",
                      borderBottom: "1px solid #1a1a1a",
                    }}
                  >
                    <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", background: "#1a1a1a" }}>
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                        alt={video.title}
                        crossOrigin="anonymous"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{
                        position: "absolute", bottom: 6, right: 6,
                        background: "rgba(0,0,0,0.85)", borderRadius: 4,
                        padding: "2px 6px", fontSize: 12, color: "#fff", fontWeight: 600,
                      }}>
                        {video.duration}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, padding: "10px 12px" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: channel.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: "#fff",
                      }}>
                        {channel.initial}
                      </div>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {video.title}
                        </div>
                        <div style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
                          {channel.name} · {video.views} visualizacoes · {video.time}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // SHORTS VIEW
  // ============================================================
  if (view === "shorts") {
    const currentShort = shortVideos[shortsIndex] || shortVideos[0];
    if (!currentShort) return <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>Nenhum Short disponivel</div>;
    const channel = getChannel(currentShort.channel_id);
    const isLiked = shortsLiked[currentShort.id] || false;

    return (
      <div style={{
        width: "100%", height: "100%", background: "#000",
        display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
      }}>
        <button
          onClick={() => setView("home")}
          style={{
            position: "absolute", top: 12, left: 12, zIndex: 20,
            background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer",
            borderRadius: "50%", width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <BackArrow />
        </button>

        <div style={{ flex: 1, position: "relative", background: "#000" }}>
          <iframe
            src={`https://www.youtube.com/embed/${currentShort.youtube_id}?autoplay=1&rel=0&modestbranding=1&loop=1`}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />

          <div style={{
            position: "absolute", right: 10, bottom: 120,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 20, zIndex: 10,
          }}>
            <button
              onClick={() => setShortsLiked((p) => ({ ...p, [currentShort.id]: !p[currentShort.id] }))}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              <HeartSvg filled={isLiked} size={28} />
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{currentShort.likes}</span>
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <CommentSvg size={28} />
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>1.2K</span>
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <RepeatSvg size={28} />
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Share</span>
            </button>
          </div>

          <div style={{
            position: "absolute", bottom: 16, left: 12, right: 60, zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: channel.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#fff",
              }}>
                {channel.initial}
              </div>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{channel.name}</span>
              <button
                onClick={() => toggleSubscribe(channel.id)}
                style={{
                  padding: "4px 12px", borderRadius: 20,
                  background: subscribedChannels[channel.id] ? "#333" : "#fff",
                  border: "none", cursor: "pointer",
                  color: subscribedChannels[channel.id] ? "#aaa" : "#000",
                  fontSize: 12, fontWeight: 700,
                }}
              >
                {subscribedChannels[channel.id] ? "Inscrito" : "Inscrever-se"}
              </button>
            </div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, lineHeight: 1.3, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              {currentShort.title}
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 8, zIndex: 15,
        }}>
          {shortsIndex > 0 && (
            <button
              onClick={() => setShortsIndex((p) => p - 1)}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
            </button>
          )}
          {shortsIndex < shortVideos.length - 1 && (
            <button
              onClick={() => setShortsIndex((p) => p + 1)}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          )}
        </div>

        <YTNav active="shorts" setView={setView} />
      </div>
    );
  }

  // ============================================================
  // FAVORITES VIEW
  // ============================================================
  if (view === "favorites") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderBottom: "1px solid #222", flexShrink: 0,
        }}>
          <YouTubeLogo />
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button onClick={() => setView("search")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <SearchSvg />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 10 }}>
            <SaveSvg filled />
            <div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Videos salvos</div>
              <div style={{ color: "#aaa", fontSize: 13 }}>{savedList.length} videos</div>
            </div>
          </div>

          {savedList.length === 0 ? (
            <div style={{ padding: "60px 32px", textAlign: "center" }}>
              <SaveSvg filled={false} />
              <div style={{ color: "#aaa", fontSize: 14, marginTop: 16 }}>
                Nenhum video salvo ainda. Toque no icone de salvar em qualquer video para adicionar aqui.
              </div>
            </div>
          ) : (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 2, padding: "0 2px",
            }}>
              {savedList.map((video) => {
                const channel = getChannel(video.channel_id);
                return (
                  <button
                    key={video.id}
                    onClick={() => openVideo(video)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", flexDirection: "column",
                    }}
                  >
                    <div style={{
                      width: "100%", aspectRatio: "16/9", position: "relative",
                      background: "#1a1a1a", borderRadius: 8, overflow: "hidden",
                    }}>
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                        alt={video.title}
                        crossOrigin="anonymous"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.25)",
                      }}>
                        <PlayOverlay size={32} />
                      </div>
                      <div style={{
                        position: "absolute", bottom: 4, right: 4,
                        background: "rgba(0,0,0,0.85)", borderRadius: 4,
                        padding: "1px 4px", fontSize: 10, color: "#fff", fontWeight: 600,
                      }}>
                        {video.duration}
                      </div>
                    </div>
                    <div style={{ padding: "6px 4px", textAlign: "left" }}>
                      <div style={{ color: "#fff", fontSize: 12, fontWeight: 500, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {video.title}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>{channel.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <YTNav active="favorites" setView={setView} />
      </div>
    );
  }

  // ============================================================
  // PLAYER VIEW
  // ============================================================
  if (view === "player" && selectedVideo) {
    const channel = getChannel(selectedVideo.channel_id);
    const isLiked = likedVideos[selectedVideo.id] || false;
    const isDisliked = dislikedVideos[selectedVideo.id] || false;
    const isSaved = savedVideos[selectedVideo.id] || false;
    const isSubscribed = subscribedChannels[channel.id] || false;
    const nextVideos = videos.filter((v) => v.id !== selectedVideo.id).slice(0, 4);

    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", flexShrink: 0, background: "#111" }}>
          <iframe
            src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          <button
            onClick={() => setView("home")}
            style={{
              position: "absolute", top: 8, left: 8,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
            }}
          >
            <BackArrow />
          </button>
        </div>

        <div style={{ width: "100%", height: 3, background: "#333", flexShrink: 0 }}>
          <div style={{ width: "35%", height: "100%", background: "#FF0000", borderRadius: 2 }} />
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "12px 14px 8px" }}>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600, lineHeight: 1.3, marginBottom: 6 }}>
              {selectedVideo.title}
            </div>
            <div style={{ color: "#aaa", fontSize: 12 }}>
              {selectedVideo.views} visualizacoes · {selectedVideo.time}
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 14px 12px", overflowX: "auto",
          }}>
            <button
              onClick={() => toggleLike(selectedVideo.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: isLiked ? "rgba(62,166,255,0.15)" : "#272727", borderRadius: 20,
                padding: "8px 14px", border: "none", cursor: "pointer",
              }}
            >
              <ThumbUpSvg filled={isLiked} />
              <span style={{ color: isLiked ? "#3EA6FF" : "#fff", fontSize: 13, fontWeight: 600 }}>{selectedVideo.likes}</span>
              <div style={{ width: 1, height: 16, background: "#555", margin: "0 4px" }} />
              <button
                onClick={(e) => { e.stopPropagation(); toggleDislike(selectedVideo.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}
              >
                <ThumbDownSvg filled={isDisliked} />
              </button>
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#272727", borderRadius: 20,
              padding: "8px 14px", border: "none", cursor: "pointer",
            }}>
              <ShareSvg />
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Compartilhar</span>
            </button>
            <button
              onClick={() => toggleSave(selectedVideo.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: isSaved ? "rgba(255,255,255,0.15)" : "#272727", borderRadius: 20,
                padding: "8px 14px", border: "none", cursor: "pointer",
              }}
            >
              <SaveSvg filled={isSaved} />
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{isSaved ? "Salvo" : "Salvar"}</span>
            </button>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 14px 12px",
            borderBottom: "1px solid #222",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: channel.color, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "#fff",
            }}>
              {channel.initial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{channel.name}</div>
              <div style={{ color: "#aaa", fontSize: 12 }}>{channel.subscribers} inscritos</div>
            </div>
            <button
              onClick={() => toggleSubscribe(channel.id)}
              style={{
                padding: "8px 16px", borderRadius: 20,
                background: isSubscribed ? "#333" : "#CC0000",
                border: "none", cursor: "pointer",
                color: isSubscribed ? "#aaa" : "#fff",
                fontSize: 13, fontWeight: 700,
              }}
            >
              {isSubscribed ? "Inscrito" : "Inscrever-se"}
            </button>
          </div>

          <div style={{ padding: "12px 14px 4px" }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Proximos videos</div>
          </div>
          {nextVideos.map((video) => {
            const ch = getChannel(video.channel_id);
            return (
              <button
                key={video.id}
                onClick={() => openVideo(video)}
                style={{
                  display: "flex", gap: 10, padding: "6px 14px 10px", width: "100%",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                <div style={{
                  width: 160, aspectRatio: "16/9", flexShrink: 0,
                  borderRadius: 8, overflow: "hidden", position: "relative",
                  background: "#1a1a1a",
                }}>
                  <img
                    src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                    alt={video.title}
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute", bottom: 4, right: 4,
                    background: "rgba(0,0,0,0.85)", borderRadius: 4,
                    padding: "1px 5px", fontSize: 11, color: "#fff", fontWeight: 600,
                  }}>
                    {video.duration}
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {video.title}
                  </div>
                  <div style={{ color: "#aaa", fontSize: 11, marginTop: 4 }}>
                    {ch.name}
                  </div>
                  <div style={{ color: "#aaa", fontSize: 11 }}>
                    {video.views} · {video.time}
                  </div>
                </div>
              </button>
            );
          })}
          <div style={{ height: 16 }} />
        </div>
      </div>
    );
  }

  // ============================================================
  // HOME VIEW (default)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", flexShrink: 0,
      }}>
        <YouTubeLogo />
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button onClick={() => setView("search")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <SearchSvg />
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <CastSvg />
          </button>
          <button onClick={() => onNavigate?.("home")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #FF0000, #CC0000)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
            }}>
              C
            </div>
          </button>
        </div>
      </div>

      <div style={{
        display: "flex", gap: 8, padding: "6px 14px 10px",
        overflowX: "auto", flexShrink: 0,
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "7px 14px", borderRadius: 8,
              background: activeCategory === cat ? "#fff" : "#333",
              border: "none", cursor: "pointer",
              color: activeCategory === cat ? "#000" : "#fff",
              fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredVideos.map((video) => {
          const channel = getChannel(video.channel_id);
          return (
            <button
              key={video.id}
              onClick={() => openVideo(video)}
              style={{
                display: "flex", flexDirection: "column", width: "100%",
                background: "none", border: "none", cursor: "pointer",
                marginBottom: 12,
              }}
            >
              <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", background: "#1a1a1a" }}>
                <img
                  src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                  alt={video.title}
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute", bottom: 6, right: 6,
                  background: "rgba(0,0,0,0.85)", borderRadius: 4,
                  padding: "2px 6px", fontSize: 12, color: "#fff", fontWeight: 600,
                }}>
                  {video.duration}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, padding: "10px 14px" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: channel.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#fff",
                }}>
                  {channel.initial}
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{
                    color: "#fff", fontSize: 14, fontWeight: 500, lineHeight: 1.3,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {video.title}
                  </div>
                  <div style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
                    {channel.name} · {video.views} visualizacoes · {video.time}
                  </div>
                </div>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="#aaa" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                </svg>
              </div>
            </button>
          );
        })}
        <div style={{ height: 8 }} />
      </div>

      <YTNav active="home" setView={setView} />
    </div>
  );
}

// ---------- YouTube Bottom Navigation (100% V0) ----------
function YTNav({ active, setView }) {
  const tabs = [
    { id: "home", label: "Inicio", icon: <HomeSvg active={active === "home"} /> },
    { id: "shorts", label: "Shorts", icon: <ShortsSvg active={active === "shorts"} /> },
    { id: "favorites", label: "Salvos", icon: <FavSvg active={active === "favorites"} /> },
    { id: "profile", label: "Voce", icon: <ProfileSvg active={active === "profile"} /> },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "6px 0 4px", borderTop: "1px solid #222", background: "#0d0d0d", flexShrink: 0,
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            if (tab.id === "home" || tab.id === "shorts" || tab.id === "favorites") {
              setView(tab.id);
            }
          }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
          }}
        >
          {tab.icon}
          <span style={{
            color: active === tab.id ? "#fff" : "#aaa",
            fontSize: 10, fontWeight: active === tab.id ? 700 : 500,
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

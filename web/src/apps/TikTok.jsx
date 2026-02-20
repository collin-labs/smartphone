import React, { useState, useCallback, useRef, useEffect } from "react";
import { fetchBackend } from '../hooks/useNui';

// ============================================================
// TikTok App — Pixel-perfect 2025/2026 dark mode replica
// Telas: feed | discover | inbox | profile
// Videos REAIS via iframe do YouTube
// V0 layout: 100% preservado | Backend: fetchBackend integrado
// ============================================================

// ---------- Dados mock FALLBACK (GTA RP / Los Santos) ----------

const MOCK_VIDEOS = [
  {
    id: 1,
    youtube_id: "dQw4w9WgXcQ",
    username: "marina.weazel",
    display_name: "Marina Oliveira",
    avatar: "",
    user_color: "#FF0000",
    user_initial: "M",
    verified: true,
    caption: "Cobertura ao vivo do evento beneficente em Vinewood! #WeazelNews #LosSantos #Evento",
    music: "Som Original - Marina Oliveira",
    likes_count: 45200,
    comments_count: 3100,
    views_count: 120000,
    shares: "890",
    bookmarks: "2.1K",
    is_liked: 0,
  },
  {
    id: 2,
    youtube_id: "kJQP7kiw5Fk",
    username: "rafael.customs",
    display_name: "Rafael Santos",
    avatar: "",
    user_color: "#FF6B00",
    user_initial: "R",
    verified: false,
    caption: "Transformacao INSANA desse Elegy!! De sucata a carro de corrida em 48h #LSCustoms #Drift #CarrosLS",
    music: "Despacito - Luis Fonsi",
    likes_count: 128000,
    comments_count: 8700,
    views_count: 560000,
    shares: "4.2K",
    bookmarks: "15K",
    is_liked: 0,
  },
  {
    id: 3,
    youtube_id: "J---aiyznGQ",
    username: "memes.ls",
    display_name: "Memes de LS",
    avatar: "",
    user_color: "#FFD700",
    user_initial: "M",
    verified: true,
    caption: "POV: voce esta atrasado pro trabalho na Maze Bank e o Uber cancelou pela 3a vez KKKKK #MemesLS #LosSantos #GTA",
    music: "Keyboard Cat Theme",
    likes_count: 256000,
    comments_count: 12000,
    views_count: 890000,
    shares: "34K",
    bookmarks: "8.9K",
    is_liked: 0,
  },
  {
    id: 4,
    youtube_id: "fJ9rUzIMcZQ",
    username: "ls.music",
    display_name: "LS Music Official",
    avatar: "",
    user_color: "#1DB954",
    user_initial: "L",
    verified: true,
    caption: "Bohemian Rhapsody no palco do Bahama Mamas! Show historico ontem a noite #Musica #BahamaMamas #LosSantos",
    music: "Bohemian Rhapsody - Queen",
    likes_count: 89500,
    comments_count: 5400,
    views_count: 340000,
    shares: "12K",
    bookmarks: "22K",
    is_liked: 0,
  },
  {
    id: 5,
    youtube_id: "QH2-TGUlwu4",
    username: "ana.pillbox",
    display_name: "Ana Costa",
    avatar: "",
    user_color: "#1DB954",
    user_initial: "A",
    verified: false,
    caption: "Dia a dia no Pillbox Medical: salvando vidas desde as 6h da manha! #Medicina #Pillbox #LosSantos #Rotina",
    music: "Nyan Cat Theme",
    likes_count: 34100,
    comments_count: 2800,
    views_count: 98000,
    shares: "1.5K",
    bookmarks: "4.3K",
    is_liked: 0,
  },
  {
    id: 6,
    youtube_id: "2MtOpB_S0IA",
    username: "street.racing.ls",
    display_name: "Street Racing LS",
    avatar: "",
    user_color: "#FF6B00",
    user_initial: "S",
    verified: true,
    caption: "DRIFT COMPILATION - As melhores manobras da semana no circuito de Sandy Shores! #StreetRacing #Drift #LosSantos",
    music: "Tokyo Drift - Teriyaki Boyz",
    likes_count: 198000,
    comments_count: 9200,
    views_count: 450000,
    shares: "25K",
    bookmarks: "31K",
    is_liked: 0,
  },
  {
    id: 7,
    youtube_id: "HEfHFsfGIhQ",
    username: "marina.weazel",
    display_name: "Marina Oliveira",
    avatar: "",
    user_color: "#FF0000",
    user_initial: "M",
    verified: true,
    caption: "URGENTE: Perseguicao policial em alta velocidade pela LS Freeway! Acompanhe ao vivo #WeazelNews #Urgente",
    music: "Breaking News Theme",
    likes_count: 312000,
    comments_count: 18000,
    views_count: 780000,
    shares: "42K",
    bookmarks: "5.6K",
    is_liked: 0,
  },
  {
    id: 8,
    youtube_id: "rfscVS0vtbw",
    username: "tech.ls",
    display_name: "LS Tutoriais",
    avatar: "",
    user_color: "#0A66C2",
    user_initial: "T",
    verified: false,
    caption: "Aprenda Python em 5 minutos! Tutorial rapido pra quem quer comecar na programacao #Tech #Tutorial #Python",
    music: "Lo-fi Study Beats",
    likes_count: 67300,
    comments_count: 4100,
    views_count: 230000,
    shares: "8.9K",
    bookmarks: "45K",
    is_liked: 0,
  },
];

const MOCK_PROFILE = {
  id: 1,
  username: "carlos.silva",
  display_name: "Carlos Silva",
  bio: "Los Santos lifestyle | Maze Bank employee\nGaming & Cars",
  following_count: 342,
  followers_count: 12800,
  likes_count: 45200,
  color: "#E91E63",
  initial: "C",
};

const DISCOVER_TRENDING = [
  { id: 1, tag: "#LosSantos", views: "12.5M videos", color: "#FF0000" },
  { id: 2, tag: "#MazeBank", views: "3.2M videos", color: "#00A550" },
  { id: 3, tag: "#LSCustoms", views: "8.1M videos", color: "#FF6B00" },
  { id: 4, tag: "#WeazelNews", views: "5.7M videos", color: "#FF0000" },
  { id: 5, tag: "#VinewoodHills", views: "2.9M videos", color: "#9B59B6" },
  { id: 6, tag: "#BahamaMamas", views: "1.8M videos", color: "#E91E63" },
  { id: 7, tag: "#PillboxMedical", views: "4.3M videos", color: "#1DB954" },
  { id: 8, tag: "#StreetRacing", views: "6.6M videos", color: "#FF6B00" },
];

const DISCOVER_CATEGORIES = ["Tendencias", "Musica", "Comedia", "Games", "Noticias", "Carros", "Lifestyle"];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "like", user: "Marina Oliveira", color: "#FF0000", initial: "M", message: "curtiu seu video", time: "2h" },
  { id: 2, type: "follow", user: "Rafael Santos", color: "#FF6B00", initial: "R", message: "comecou a seguir voce", time: "3h" },
  { id: 3, type: "comment", user: "Ana Costa", color: "#1DB954", initial: "A", message: "comentou: Incrivel demais!!", time: "5h" },
  { id: 4, type: "like", user: "Pedro Almeida", color: "#9B59B6", initial: "P", message: "curtiu seu video", time: "6h" },
  { id: 5, type: "mention", user: "Julia Ferreira", color: "#E67E22", initial: "J", message: "mencionou voce em um comentario", time: "8h" },
  { id: 6, type: "follow", user: "Lucas Martins", color: "#3498DB", initial: "L", message: "comecou a seguir voce", time: "10h" },
  { id: 7, type: "comment", user: "Fernanda Lima", color: "#E74C3C", initial: "F", message: "comentou: Manda mais desse conteudo!", time: "12h" },
  { id: 8, type: "like", user: "Memes de LS", color: "#FFD700", initial: "M", message: "curtiu seu comentario", time: "1d" },
];

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

function getColor(name) {
  const colors = ['#FF0000','#FF6B00','#FFD700','#1DB954','#0A66C2','#9B59B6','#E91E63','#E74C3C','#3498DB'];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h + (name || '').charCodeAt(i)) % colors.length;
  return colors[h];
}

// ---------- Inline SVG Icons (100% V0) ----------

const TikTokLogo = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34c3.5 0 6.34-2.84 6.34-6.34V9.44a8.16 8.16 0 0 0 4.76 1.52V7.51a4.85 4.85 0 0 1-1-.82z" fill="#25F4EE" />
    <path d="M16.37 2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-1.8-.63 2.89 2.89 0 0 0 4.68-2.26V2h3.45z" fill="#FE2C55" />
    <path d="M19.59 7.51v3.45a8.16 8.16 0 0 1-4.76-1.52v6.86a6.34 6.34 0 0 1-6.34 6.34 6.3 6.3 0 0 1-3.65-1.16 6.34 6.34 0 0 0 5.45 3.1c3.5 0 6.34-2.84 6.34-6.34V11.4a8.16 8.16 0 0 0 4.76 1.52V9.47a4.83 4.83 0 0 1-1.8-1.96z" fill="#FE2C55" />
  </svg>
);

const HomeSvg = ({ active = false }) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    {!active && <polyline points="9 22 9 12 15 12 15 22" />}
  </svg>
);

const DiscoverSvg = ({ active = false }) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill={active ? "#fff" : "none"} />
  </svg>
);

const PlusSvg = () => (
  <svg width={38} height={28} viewBox="0 0 38 28">
    <rect x="0" y="0" width="38" height="28" rx="8" fill="#25F4EE" />
    <rect x="3" y="0" width="35" height="28" rx="8" fill="#FE2C55" />
    <rect x="5" y="0" width="28" height="28" rx="8" fill="#fff" />
    <line x1="19" y1="8" x2="19" y2="20" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="13" y1="14" x2="25" y2="14" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const InboxSvg = ({ active = false }) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ProfileSvg = ({ active = false }) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" fill={active ? "#fff" : "none"} />
  </svg>
);

const HeartSvg = ({ filled = false, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#FE2C55" : "none"} stroke={filled ? "#FE2C55" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentSvg = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const BookmarkSvg = ({ filled = false, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#FFFC00" : "none"} stroke={filled ? "#FFFC00" : "#fff"} strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareSvg = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const MusicNoteSvg = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" fill="#fff" />
    <circle cx="18" cy="16" r="3" fill="#fff" />
  </svg>
);

const VolumeSvg = ({ muted = false, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fff" />
    {muted ? (
      <>
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    ) : (
      <>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </>
    )}
  </svg>
);

const SearchSvg = ({ size = 20, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BackArrow = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const GridSvg = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

const HeartSmallSvg = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LockSvg = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ---------- Spinning Music Disc (100% V0) ----------
const MusicDisc = ({ color, initial }) => (
  <div style={{
    width: 40, height: 40, borderRadius: "50%",
    background: `conic-gradient(from 0deg, ${color}, #000, ${color}, #000, ${color})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    animation: "tiktok-spin 3s linear infinite",
    border: "2px solid #333",
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: "50%", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 8, fontWeight: 700, color: "#fff",
    }}>
      {initial}
    </div>
    <style>{`@keyframes tiktok-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ============================================================
// Component
// ============================================================

export default function TikTok({ onNavigate }) {
  const [view, setView] = useState("feed");
  const [feedTab, setFeedTab] = useState("foryou");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState({});
  const [bookmarkedVideos, setBookmarkedVideos] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});
  const [isMuted, setIsMuted] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileTab, setProfileTab] = useState("videos");
  const [discoverCategory, setDiscoverCategory] = useState("Tendencias");

  // Backend state
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [myProfileId, setMyProfileId] = useState(null);

  const containerRef = useRef(null);
  const touchStartY = useRef(0);

  // ---- Load data from backend on mount ----
  useEffect(() => {
    (async () => {
      try {
        const feedRes = await fetchBackend('tiktok_feed');
        if (feedRes?.ok && feedRes.videos?.length > 0) {
          const mapped = feedRes.videos.map(v => ({
            id: v.id,
            youtube_id: v.youtube_id || '',
            username: v.username || 'user',
            display_name: v.display_name || v.username || 'User',
            avatar: v.avatar || '',
            user_color: getColor(v.username),
            user_initial: getInitial(v.display_name || v.username),
            verified: false,
            caption: v.caption || '',
            music: 'Som Original',
            likes_count: v.likes_count || 0,
            comments_count: v.comments_count || 0,
            views_count: v.views_count || 0,
            shares: formatCount(Math.floor((v.views_count || 0) * 0.05)),
            bookmarks: formatCount(Math.floor((v.views_count || 0) * 0.02)),
            is_liked: v.is_liked || 0,
          }));
          setVideos(mapped);
          setMyProfileId(feedRes.myProfileId);
          // Pre-populate liked state
          const liked = {};
          mapped.forEach(v => { if (v.is_liked) liked[v.id] = true; });
          setLikedVideos(liked);
        }
      } catch (e) { console.log('[TikTok] Feed fallback to mock'); }

      try {
        const profRes = await fetchBackend('tiktok_profile');
        if (profRes?.ok && profRes.profile) {
          const p = profRes.profile;
          setProfile({
            id: p.id,
            username: p.username || 'user',
            display_name: p.display_name || 'User',
            bio: p.bio || '',
            following_count: p.following_count || 0,
            followers_count: p.followers_count || 0,
            likes_count: p.likes_count || 0,
            color: getColor(p.username),
            initial: getInitial(p.display_name || p.username),
          });
        }
      } catch (e) { console.log('[TikTok] Profile fallback to mock'); }
    })();
  }, []);

  // ---- Actions with backend ----
  const toggleLike = useCallback(async (videoId) => {
    setLikedVideos((p) => ({ ...p, [videoId]: !p[videoId] }));
    setVideos(prev => prev.map(v => v.id === videoId ? {
      ...v,
      likes_count: likedVideos[videoId] ? v.likes_count - 1 : v.likes_count + 1,
    } : v));
    try { await fetchBackend('tiktok_like', { videoId }); } catch (e) {}
  }, [likedVideos]);

  const toggleBookmark = useCallback((videoId) => {
    setBookmarkedVideos((p) => ({ ...p, [videoId]: !p[videoId] }));
  }, []);

  const toggleFollow = useCallback(async (userName, profileId) => {
    setFollowedUsers((p) => ({ ...p, [userName]: !p[userName] }));
    if (profileId) {
      try { await fetchBackend('tiktok_follow', { targetId: profileId }); } catch (e) {}
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 60) {
      if (delta > 0 && currentIndex < videos.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (delta < 0 && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    }
  }, [currentIndex, videos.length]);

  const handleWheel = useCallback((e) => {
    if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    }
  }, [currentIndex, videos.length]);

  // ============================================================
  // DISCOVER VIEW
  // ============================================================
  if (view === "discover") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #222", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#1a1a1a", borderRadius: 8, padding: "10px 14px",
          }}>
            <SearchSvg size={18} color="#666" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar"
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#fff", fontSize: 14, fontFamily: "inherit",
              }}
            />
          </div>
          {/* Categories */}
          <div style={{
            display: "flex", gap: 8, marginTop: 12, overflowX: "auto",
            paddingBottom: 4,
          }}>
            {DISCOVER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setDiscoverCategory(cat)}
                style={{
                  padding: "6px 16px", borderRadius: 20, whiteSpace: "nowrap",
                  background: discoverCategory === cat ? "#fff" : "#1a1a1a",
                  color: discoverCategory === cat ? "#000" : "#fff",
                  border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                  transition: "all 200ms",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Trending */}
          <div style={{ padding: "16px" }}>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Trending</div>
            {DISCOVER_TRENDING.map((trend) => (
              <div key={trend.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 0", borderBottom: "1px solid #1a1a1a",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `linear-gradient(135deg, ${trend.color}, ${trend.color}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: "#fff",
                }}>
                  #
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{trend.tag}</div>
                  <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{trend.views}</div>
                </div>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            ))}
          </div>

          {/* Suggested Videos Grid */}
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Videos sugeridos</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
              {videos.slice(0, 6).map((video) => (
                <button
                  key={video.id}
                  onClick={() => { setCurrentIndex(videos.findIndex((v) => v.id === video.id)); setView("feed"); }}
                  style={{
                    aspectRatio: "9/16", background: "#1a1a1a", border: "none",
                    cursor: "pointer", position: "relative", overflow: "hidden",
                    borderRadius: 4,
                  }}
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                    alt={video.caption}
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute", bottom: 4, left: 4,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21" /></svg>
                    <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                      {formatCount(video.likes_count)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <BottomNav view={view} setView={setView} />
      </div>
    );
  }

  // ============================================================
  // INBOX VIEW
  // ============================================================
  if (view === "inbox") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", borderBottom: "1px solid #222", flexShrink: 0,
        }}>
          <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Caixa de Entrada</span>
          <div style={{ display: "flex", gap: 16 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="12" y1="8" x2="12" y2="14" /><line x1="9" y1="11" x2="15" y2="11" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Activity section */}
          <div style={{ padding: "12px 16px 4px" }}>
            <div style={{ color: "#aaa", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Atividades</div>
          </div>

          {notifications.map((notif) => {
            const iconBg =
              notif.type === "like" ? "#FE2C55" :
              notif.type === "follow" ? "#25F4EE" :
              notif.type === "comment" ? "#FE2C55" :
              "#FFFC00";

            return (
              <div key={notif.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderBottom: "1px solid #111",
              }}>
                {/* Avatar with icon badge */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: notif.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, color: "#fff",
                  }}>
                    {notif.initial}
                  </div>
                  <div style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 18, height: 18, borderRadius: "50%",
                    background: iconBg, border: "2px solid #000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {notif.type === "like" && <svg width={9} height={9} viewBox="0 0 24 24" fill="#fff"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>}
                    {notif.type === "follow" && <svg width={9} height={9} viewBox="0 0 24 24" fill="#000"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                    {notif.type === "comment" && <svg width={9} height={9} viewBox="0 0 24 24" fill="#fff"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>}
                    {notif.type === "mention" && <span style={{ fontSize: 8, fontWeight: 700, color: "#000" }}>@</span>}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.4 }}>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{notif.user}</span>
                    <span style={{ color: "#aaa" }}> {notif.message}</span>
                  </div>
                  <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{notif.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        <BottomNav view={view} setView={setView} />
      </div>
    );
  }

  // ============================================================
  // PROFILE VIEW
  // ============================================================
  if (view === "profile") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "14px 16px", position: "relative", flexShrink: 0,
        }}>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>@{profile.username}</span>
          <button
            onClick={() => onNavigate?.("settings")}
            style={{
              position: "absolute", right: 16, background: "none", border: "none", cursor: "pointer",
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Profile Info */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 16px 20px" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: profile.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 700, color: "#fff",
              marginBottom: 12,
            }}>
              {profile.initial}
            </div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>@{profile.username}</div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 24, margin: "16px 0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{formatCount(profile.following_count)}</div>
                <div style={{ color: "#aaa", fontSize: 12 }}>Seguindo</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{formatCount(profile.followers_count)}</div>
                <div style={{ color: "#aaa", fontSize: 12 }}>Seguidores</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{formatCount(profile.likes_count)}</div>
                <div style={{ color: "#aaa", fontSize: 12 }}>Curtidas</div>
              </div>
            </div>

            {/* Edit profile button */}
            <button style={{
              padding: "10px 48px", borderRadius: 4,
              background: "#1a1a1a", border: "1px solid #333",
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}>
              Editar perfil
            </button>

            {/* Bio */}
            <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", marginTop: 12, lineHeight: 1.5, whiteSpace: "pre-line" }}>
              {profile.bio}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #333" }}>
            {[
              { key: "videos", icon: <GridSvg /> },
              { key: "liked", icon: <HeartSmallSvg /> },
              { key: "private", icon: <LockSvg /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setProfileTab(tab.key)}
                style={{
                  flex: 1, padding: "12px 0",
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderBottom: profileTab === tab.key ? "2px solid #fff" : "2px solid transparent",
                  opacity: profileTab === tab.key ? 1 : 0.5,
                  transition: "all 200ms",
                }}
              >
                {tab.icon}
              </button>
            ))}
          </div>

          {/* Videos grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, padding: 2 }}>
            {profileTab === "videos" && videos.slice(0, 6).map((video) => (
              <button
                key={video.id}
                onClick={() => { setCurrentIndex(videos.findIndex((v) => v.id === video.id)); setView("feed"); }}
                style={{
                  aspectRatio: "9/16", background: "#1a1a1a", border: "none",
                  cursor: "pointer", position: "relative", overflow: "hidden",
                }}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                  alt={video.caption}
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute", bottom: 4, left: 4,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21" /></svg>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                    {formatCount(video.likes_count)}
                  </span>
                </div>
              </button>
            ))}
            {profileTab === "liked" && (
              <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center" }}>
                <HeartSvg size={40} />
                <div style={{ color: "#aaa", fontSize: 14, marginTop: 12 }}>Videos curtidos ficam aqui</div>
              </div>
            )}
            {profileTab === "private" && (
              <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center" }}>
                <LockSvg />
                <div style={{ color: "#aaa", fontSize: 14, marginTop: 12 }}>Videos privados</div>
              </div>
            )}
          </div>
        </div>

        <BottomNav view={view} setView={setView} />
      </div>
    );
  }

  // ============================================================
  // FEED VIEW (For You / Following)
  // ============================================================
  const currentVideo = videos[currentIndex] || videos[0];
  if (!currentVideo) return <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Carregando...</div>;

  const isLiked = likedVideos[currentVideo.id] || false;
  const isBookmarked = bookmarkedVideos[currentVideo.id] || false;
  const isFollowing = followedUsers[currentVideo.username] || false;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{
        width: "100%", height: "100%", background: "#000",
        display: "flex", flexDirection: "column", overflow: "hidden",
        position: "relative", userSelect: "none",
      }}
    >
      {/* Top header overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "12px 16px",
        background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)",
      }}>
        {/* Live icon placeholder */}
        <div style={{ position: "absolute", left: 16 }}>
          <TikTokLogo />
        </div>

        {/* Feed tabs */}
        <div style={{ display: "flex", gap: 20 }}>
          <button
            onClick={() => setFeedTab("following")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: feedTab === "following" ? "#fff" : "rgba(255,255,255,0.5)",
              fontSize: 16, fontWeight: feedTab === "following" ? 700 : 500,
              borderBottom: feedTab === "following" ? "2px solid #fff" : "2px solid transparent",
              paddingBottom: 4,
            }}
          >
            Seguindo
          </button>
          <button
            onClick={() => setFeedTab("foryou")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: feedTab === "foryou" ? "#fff" : "rgba(255,255,255,0.5)",
              fontSize: 16, fontWeight: feedTab === "foryou" ? 700 : 500,
              borderBottom: feedTab === "foryou" ? "2px solid #fff" : "2px solid transparent",
              paddingBottom: 4,
            }}
          >
            Para voce
          </button>
        </div>

        {/* Mute toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            position: "absolute", right: 16,
            background: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer",
            borderRadius: "50%", width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <VolumeSvg muted={isMuted} size={16} />
        </button>
      </div>

      {/* Video area - fullscreen */}
      <div style={{ flex: 1, position: "relative", background: "#000" }}>
        {/* Only render iframe for current video */}
        {currentVideo.youtube_id ? (
          <iframe
            key={`${currentVideo.youtube_id}-${isMuted}`}
            src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&rel=0&modestbranding=1&playsinline=1&playlist=${currentVideo.youtube_id}`}
            style={{
              width: "100%", height: "100%", border: "none",
              position: "absolute", top: 0, left: 0,
              pointerEvents: "none",
            }}
            allow="autoplay; encrypted-media"
          />
        ) : (
          <div style={{
            width: "100%", height: "100%", background: "#111",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#666", fontSize: 14,
          }}>
            Video indisponivel
          </div>
        )}

        {/* Right side action buttons */}
        <div style={{
          position: "absolute", right: 10, bottom: 100,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          zIndex: 10,
        }}>
          {/* Profile pic */}
          <div style={{ position: "relative", marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: currentVideo.user_color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#fff",
              border: "2px solid #fff",
            }}>
              {currentVideo.user_initial}
            </div>
            {!isFollowing && (
              <button
                onClick={() => toggleFollow(currentVideo.username, currentVideo.profile_id)}
                style={{
                  position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#FE2C55", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
          </div>

          {/* Like */}
          <button
            onClick={() => toggleLike(currentVideo.id)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <HeartSvg filled={isLiked} size={32} />
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
              {formatCount(isLiked ? currentVideo.likes_count + (currentVideo.is_liked ? 0 : 1) : currentVideo.likes_count)}
            </span>
          </button>

          {/* Comment */}
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CommentSvg size={32} />
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{formatCount(currentVideo.comments_count)}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => toggleBookmark(currentVideo.id)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <BookmarkSvg filled={isBookmarked} size={32} />
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{currentVideo.bookmarks}</span>
          </button>

          {/* Share */}
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <ShareSvg size={32} />
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{currentVideo.shares}</span>
          </button>

          {/* Spinning disc */}
          <MusicDisc color={currentVideo.user_color} initial={currentVideo.user_initial} />
        </div>

        {/* Bottom info overlay */}
        <div style={{
          position: "absolute", bottom: 58, left: 12, right: 70, zIndex: 10,
        }}>
          {/* Username */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{
              color: "#fff", fontSize: 16, fontWeight: 700,
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            }}>
              @{currentVideo.username}
            </span>
            {currentVideo.verified && (
              <svg width={14} height={14} viewBox="0 0 24 24" fill="#20D5EC">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 12c0 2.378.69 4.595 1.882 6.455A11.95 11.95 0 0 0 12 21.044a11.95 11.95 0 0 0 7.118-2.589A11.98 11.98 0 0 0 21 12c0-.944-.11-1.862-.318-2.742A11.955 11.955 0 0 1 20.618 7.984z" />
              </svg>
            )}
            {!isFollowing && (
              <button
                onClick={() => toggleFollow(currentVideo.username, currentVideo.profile_id)}
                style={{
                  padding: "2px 10px", borderRadius: 4,
                  background: "transparent", border: "1px solid #fff",
                  color: "#fff", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", marginLeft: 4,
                }}
              >
                Seguir
              </button>
            )}
          </div>

          {/* Description */}
          <div style={{
            color: "#fff", fontSize: 13, lineHeight: 1.4,
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            marginBottom: 8,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {currentVideo.caption}
          </div>

          {/* Music */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <MusicNoteSvg size={12} />
            <div style={{
              color: "#fff", fontSize: 12,
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              overflow: "hidden", whiteSpace: "nowrap",
              maxWidth: "80%",
            }}>
              <span style={{ display: "inline-block", animation: "tiktok-marquee 8s linear infinite" }}>
                {currentVideo.music}
              </span>
              <style>{`@keyframes tiktok-marquee { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-30px); } }`}</style>
            </div>
          </div>
        </div>

        {/* Video progress dots */}
        <div style={{
          position: "absolute", bottom: 56, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 4, zIndex: 15,
        }}>
          {videos.map((_, i) => (
            <div key={i} style={{
              width: i === currentIndex ? 16 : 4, height: 4, borderRadius: 2,
              background: i === currentIndex ? "#fff" : "rgba(255,255,255,0.3)",
              transition: "all 200ms",
            }} />
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav view={view} setView={setView} />
    </div>
  );
}

// ============================================================
// Bottom Navigation (100% V0)
// ============================================================

function BottomNav({ view, setView }) {
  const items = [
    { key: "feed", label: "Inicio", icon: (a) => <HomeSvg active={a} /> },
    { key: "discover", label: "Descobrir", icon: (a) => <DiscoverSvg active={a} /> },
    { key: "create", label: "", icon: () => <PlusSvg /> },
    { key: "inbox", label: "Caixa", icon: (a) => <InboxSvg active={a} /> },
    { key: "profile", label: "Perfil", icon: (a) => <ProfileSvg active={a} /> },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "6px 0 8px", background: view === "feed" ? "rgba(0,0,0,0.95)" : "#000",
      borderTop: view === "feed" ? "none" : "1px solid #222",
      flexShrink: 0,
    }}>
      {items.map((item) => {
        const isActive = view === item.key;
        if (item.key === "create") {
          return (
            <button key={item.key} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
              {item.icon(false)}
            </button>
          );
        }
        return (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              background: "none", border: "none", cursor: "pointer",
              padding: "4px 12px",
            }}
          >
            {item.icon(isActive)}
            <span style={{
              color: "#fff", fontSize: 10,
              fontWeight: isActive ? 700 : 400,
              opacity: isActive ? 1 : 0.6,
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import React, { useState, useCallback, useEffect } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Twitter/X App — Visual V0 pixel-perfect + Backend FiveM
// Telas: feed | compose | viewProfile
// V0 layout: 100% preservado | Backend: fetchBackend integrado
// ============================================================

// SVG Icons (100% V0)
const XLogo = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="#E7E9EA">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const HomeIcon = ({ active = false }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill={active ? "#E7E9EA" : "none"} stroke="#E7E9EA" strokeWidth={active ? 0 : 1.5}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>{!active && <polyline points="9 22 9 12 15 12 15 22"/>}
  </svg>
);
const SearchIcon = ({ active = false }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#E7E9EA" strokeWidth={active ? 2.5 : 1.5}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const NotifIcon = () => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#E7E9EA" strokeWidth="1.5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const MailIcon = () => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#E7E9EA" strokeWidth="1.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const ReplyIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#71767B" strokeWidth="1.5">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);
const RetweetIcon = ({ active = false, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#00BA7C" : "#71767B"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const HeartIcon = ({ filled = false, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#F91880" : "none"} stroke={filled ? "#F91880" : "#71767B"} strokeWidth="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const ViewsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#71767B" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const ShareIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#71767B" strokeWidth="1.5">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);
const BackArrow = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#E7E9EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

// ---------- Dados fallback (100% V0) ----------
const FALLBACK_TWEETS = [
  { id: 1, name: "Maria Santos", handle: "@maria_ls", avatar: null, avatarColor: "#E1306C", text: "Noite insana no Bahama Mamas! Quem mais tava la? A cidade nunca dorme", image: null, imageGradient: "linear-gradient(135deg, #667eea, #764ba2)", likes: 234, retweets: 45, replies: 18, views: 4523, timeAgo: "2h", liked: false, retweeted: false },
  { id: 2, name: "Joao Grau", handle: "@joao_grau", avatar: null, avatarColor: "#F77737", text: "Carro novo blindado, quem quer dar um role pela cidade? Bora pro corre!", image: null, imageGradient: "linear-gradient(135deg, #f093fb, #f5576c)", likes: 567, retweets: 89, replies: 42, views: 8901, timeAgo: "3h", liked: true, retweeted: false },
  { id: 3, name: "WeazelNews", handle: "@weazelnews", avatar: null, avatarColor: "#1DA1F2", text: "URGENTE: Perseguicao policial na Route 68 termina com 3 detidos. Helicoptero foi acionado para a operacao. Mais detalhes em breve.", image: null, imageGradient: null, likes: 1203, retweets: 456, replies: 89, views: 23456, timeAgo: "4h", liked: false, retweeted: true },
  { id: 4, name: "Ana Belle", handle: "@ana_belle", avatar: null, avatarColor: "#C13584", text: "Golden hour em Vespucci Beach e coisa de outro mundo. Essa cidade tem seus momentos", image: null, imageGradient: "linear-gradient(135deg, #4facfe, #00f2fe)", likes: 891, retweets: 123, replies: 67, views: 12345, timeAgo: "5h", liked: false, retweeted: false },
  { id: 5, name: "Pedro MG", handle: "@pedro_mg", avatar: null, avatarColor: "#405DE6", text: "Dia de leg no Iron Gym. Sem desculpas, sem dia de descanso. Bora monstrar!", image: null, imageGradient: null, likes: 156, retweets: 12, replies: 8, views: 2345, timeAgo: "6h", liked: false, retweeted: false },
  { id: 6, name: "Lari Santos", handle: "@lari_santos", avatar: null, avatarColor: "#833AB4", text: "Inauguracao da loja amanha! Rolezinho por la, muita promo e brindes. Quem vem?", image: null, imageGradient: "linear-gradient(135deg, #fa709a, #fee140)", likes: 423, retweets: 67, replies: 31, views: 6789, timeAgo: "8h", liked: true, retweeted: true },
];
const FALLBACK_PROFILE = {
  name: "Carlos Silva", handle: "@carlos_rp", bio: "Vida loka na cidade grande. Photographer | Explorer | Los Santos native",
  location: "Los Santos, SA", joined: "Janeiro 2024", following: 312, followers: 1823, tweets: 234,
  bannerGradient: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", avatarColor: "#405DE6",
};

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
const timeAgo = (d) => {
  if (!d) return "";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return Math.floor(s / 60) + "min";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
};
function mapTweet(t) {
  return { id: t.id, name: t.display_name || t.username || "?", handle: "@" + (t.username || "unknown"), avatar: null, avatarColor: t.avatar_color || "#405DE6", text: t.content || "", image: null, imageGradient: null, likes: t.likes_count || 0, retweets: t.retweets_count || 0, replies: t.replies_count || 0, views: t.views_count || 0, timeAgo: t.created_at ? timeAgo(t.created_at) : "", liked: !!t.is_liked, retweeted: !!t.is_retweeted, profile_id: t.profile_id };
}

export default function Twitter({ onNavigate }) {
  const [view, setView] = useState("feed");
  const [tweets, setTweets] = useState(FALLBACK_TWEETS);
  const [composeText, setComposeText] = useState("");
  const [activeNav, setActiveNav] = useState("home");
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [profileTweets, setProfileTweets] = useState([]);
  const [viewProfileData, setViewProfileData] = useState(null);
  const [viewProfileTweets, setViewProfileTweets] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetchBackend("tw_feed");
      if (res?.tweets?.length) setTweets(res.tweets.map(mapTweet));
    })();
    (async () => {
      const res = await fetchBackend("tw_profile");
      if (res?.profile) {
        setProfile({ ...FALLBACK_PROFILE, name: res.profile.display_name || FALLBACK_PROFILE.name, handle: "@" + (res.profile.username || "carlos_rp"), bio: res.profile.bio || FALLBACK_PROFILE.bio, avatarColor: res.profile.avatar_color || FALLBACK_PROFILE.avatarColor, followers: res.profile.followers_count || FALLBACK_PROFILE.followers, following: res.profile.following_count || FALLBACK_PROFILE.following, tweets: res.profile.tweets_count || FALLBACK_PROFILE.tweets, id: res.profile.id });
      }
      if (res?.tweets?.length) setProfileTweets(res.tweets.map(mapTweet));
    })();
  }, []);

  const toggleLike = useCallback(async (id) => {
    const upd = (t) => t.id === id ? { ...t, liked: !t.liked, likes: t.liked ? t.likes - 1 : t.likes + 1 } : t;
    setTweets((p) => p.map(upd)); setViewProfileTweets((p) => p.map(upd));
    await fetchBackend("tw_like", { tweetId: id });
  }, []);
  const toggleRetweet = useCallback((id) => {
    setTweets((p) => p.map((t) => t.id === id ? { ...t, retweeted: !t.retweeted, retweets: t.retweeted ? t.retweets - 1 : t.retweets + 1 } : t));
  }, []);
  const postTweet = useCallback(async () => {
    if (!composeText.trim()) return;
    setTweets((p) => [{ id: Date.now(), name: profile.name, handle: profile.handle, avatar: null, avatarColor: profile.avatarColor, text: composeText.trim(), image: null, imageGradient: null, likes: 0, retweets: 0, replies: 0, views: 0, timeAgo: "agora", liked: false, retweeted: false }, ...p]);
    setComposeText(""); setView("feed");
    await fetchBackend("tw_tweet", { content: composeText.trim() });
  }, [composeText, profile]);
  const openProfile = useCallback(async (profileId) => {
    if (!profileId) return;
    const res = await fetchBackend("tw_profile", { profileId });
    if (res?.profile) {
      setViewProfileData({ ...FALLBACK_PROFILE, name: res.profile.display_name || "?", handle: "@" + (res.profile.username || "unknown"), bio: res.profile.bio || "", avatarColor: res.profile.avatar_color || "#405DE6", followers: res.profile.followers_count || 0, following: res.profile.following_count || 0, tweets: res.profile.tweets_count || 0 });
      setViewProfileTweets((res.tweets || []).map(mapTweet)); setView("viewProfile");
    }
  }, []);

  // ============================================================
  // COMPOSE VIEW (100% V0)
  // ============================================================
  if (view === "compose") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2F3336" }}>
          <button onClick={() => setView("feed")} style={{ background: "none", border: "none", cursor: "pointer", color: "#E7E9EA", fontSize: 15 }}>Cancelar</button>
          <button onClick={postTweet} disabled={!composeText.trim()} style={{ background: composeText.trim() ? "#1D9BF0" : "rgba(29,155,240,0.5)", color: "#fff", border: "none", borderRadius: 9999, padding: "8px 18px", fontWeight: 700, fontSize: 14, cursor: composeText.trim() ? "pointer" : "default", opacity: composeText.trim() ? 1 : 0.5 }}>Postar</button>
        </div>
        <div style={{ flex: 1, padding: "16px", display: "flex", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: profile.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>{profile.name.charAt(0)}</div>
          <textarea autoFocus value={composeText} onChange={(e) => setComposeText(e.target.value.slice(0, 280))} placeholder="O que esta acontecendo?" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#E7E9EA", fontSize: 18, fontFamily: "inherit", resize: "none", minHeight: 120 }} />
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #2F3336", display: "flex", justifyContent: "flex-end" }}>
          <span style={{ color: "#71767B", fontSize: 13 }}>{composeText.length}/280</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW PROFILE (100% V0)
  // ============================================================
  if (view === "viewProfile") {
    const p = viewProfileData || profile;
    const pTweets = viewProfileData ? viewProfileTweets : profileTweets;
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", flexShrink: 0 }}>
          <button onClick={() => { setView("feed"); setViewProfileData(null); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><BackArrow /></button>
          <div>
            <div style={{ color: "#E7E9EA", fontSize: 18, fontWeight: 800 }}>{p.name}</div>
            <div style={{ color: "#71767B", fontSize: 13 }}>{p.tweets} posts</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ height: 120, background: p.bannerGradient || "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)" }} />
          <div style={{ padding: "0 16px", marginTop: -34, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: p.avatarColor || "#405DE6", border: "4px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff" }}>{p.name.charAt(0)}</div>
            <button style={{ background: "transparent", border: "1px solid #536471", color: "#E7E9EA", borderRadius: 9999, padding: "6px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Seguir</button>
          </div>
          <div style={{ padding: "12px 16px" }}>
            <div style={{ color: "#E7E9EA", fontSize: 20, fontWeight: 800 }}>{p.name}</div>
            <div style={{ color: "#71767B", fontSize: 15 }}>{p.handle}</div>
            {p.bio && <div style={{ color: "#E7E9EA", fontSize: 15, lineHeight: 1.4, marginTop: 10 }}>{p.bio}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              {p.location && <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#71767B", fontSize: 14 }}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#71767B" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>{p.location}</div>}
              {p.joined && <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#71767B", fontSize: 14 }}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#71767B" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{p.joined}</div>}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <span style={{ color: "#E7E9EA", fontSize: 14, fontWeight: 700 }}>{formatCount(p.following)} <span style={{ color: "#71767B", fontWeight: 400 }}>Seguindo</span></span>
              <span style={{ color: "#E7E9EA", fontSize: 14, fontWeight: 700 }}>{formatCount(p.followers)} <span style={{ color: "#71767B", fontWeight: 400 }}>Seguidores</span></span>
            </div>
          </div>
          <div style={{ display: "flex", borderBottom: "1px solid #2F3336" }}>
            {["Posts", "Respostas", "Midia", "Curtidas"].map((tab, i) => (
              <button key={tab} style={{ flex: 1, padding: "14px 0", background: "none", border: "none", color: i === 0 ? "#E7E9EA" : "#71767B", fontSize: 14, fontWeight: i === 0 ? 700 : 500, cursor: "pointer", position: "relative" }}>
                {tab}
                {i === 0 && <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 50, height: 4, borderRadius: 2, background: "#1D9BF0" }} />}
              </button>
            ))}
          </div>
          {(pTweets.length > 0 ? pTweets : tweets.filter((t) => t.handle === p.handle || t.liked).slice(0, 3)).map((tweet) => (
            <TweetItem key={tweet.id} tweet={tweet} toggleLike={toggleLike} toggleRetweet={toggleRetweet} />
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // FEED VIEW (default — 100% V0)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #2F3336", flexShrink: 0 }}>
        <button onClick={() => { setViewProfileData(null); setView("viewProfile"); }} style={{ width: 32, height: 32, borderRadius: "50%", background: profile.avatarColor, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{profile.name.charAt(0)}</button>
        <XLogo />
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#E7E9EA" strokeWidth="1.5"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/></svg>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #2F3336", flexShrink: 0 }}>
        {["Para voce", "Seguindo"].map((tab, i) => (
          <button key={tab} style={{ flex: 1, padding: "14px 0", background: "none", border: "none", color: i === 0 ? "#E7E9EA" : "#71767B", fontSize: 14, fontWeight: i === 0 ? 700 : 500, cursor: "pointer", position: "relative" }}>
            {tab}
            {i === 0 && <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 60, height: 4, borderRadius: 2, background: "#1D9BF0" }} />}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tweets.map((tweet) => (
          <TweetItem key={tweet.id} tweet={tweet} toggleLike={toggleLike} toggleRetweet={toggleRetweet} onProfileClick={openProfile} />
        ))}
      </div>
      <button onClick={() => setView("compose")} style={{ position: "absolute", bottom: 64, right: 16, width: 54, height: 54, borderRadius: "50%", background: "#1D9BF0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(29,155,240,0.4)" }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="#fff"><path d="M23 3c-6.62-.1-10.38 2.42-13.11 6.44C7.12 13.46 5.02 19.45 4 23l10.55-7.37c-1.19-.16-2.33-.76-3.16-1.76-1.45-1.72-1.5-4.17-.11-5.93C13.29 5.85 17.93 3.61 23 3z"/></svg>
      </button>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 0", borderTop: "1px solid #2F3336", background: "#000", flexShrink: 0 }}>
        <button onClick={() => setActiveNav("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex" }}><HomeIcon active={activeNav === "home"} /></button>
        <button onClick={() => setActiveNav("search")} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex" }}><SearchIcon active={activeNav === "search"} /></button>
        <button onClick={() => setActiveNav("notif")} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex" }}><NotifIcon /></button>
        <button onClick={() => setActiveNav("mail")} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex" }}><MailIcon /></button>
      </div>
    </div>
  );
}

// ---------- Tweet Item Component (100% V0) ----------
function TweetItem({ tweet, toggleLike, toggleRetweet, onProfileClick }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid #2F3336" }}>
      <div onClick={() => onProfileClick?.(tweet.profile_id)} style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: tweet.avatar ? `url(${tweet.avatar})` : tweet.avatarColor, backgroundSize: "cover", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
        {!tweet.avatar && tweet.name.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: "#E7E9EA", fontSize: 15, fontWeight: 700 }}>{tweet.name}</span>
          <span style={{ color: "#71767B", fontSize: 14 }}>{tweet.handle}</span>
          <span style={{ color: "#71767B", fontSize: 14 }}>·</span>
          <span style={{ color: "#71767B", fontSize: 14 }}>{tweet.timeAgo}</span>
        </div>
        <div style={{ color: "#E7E9EA", fontSize: 15, lineHeight: 1.4, marginTop: 2, wordBreak: "break-word" }}>{tweet.text}</div>
        {tweet.imageGradient && (
          <div style={{ width: "100%", height: 180, borderRadius: 16, marginTop: 10, background: tweet.image ? `url(${tweet.image})` : tweet.imageGradient, backgroundSize: "cover", border: "1px solid #2F3336" }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, maxWidth: 300 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}><ReplyIcon /><span style={{ color: "#71767B", fontSize: 13 }}>{formatCount(tweet.replies)}</span></button>
          <button onClick={() => toggleRetweet(tweet.id)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}><RetweetIcon active={tweet.retweeted} /><span style={{ color: tweet.retweeted ? "#00BA7C" : "#71767B", fontSize: 13 }}>{formatCount(tweet.retweets)}</span></button>
          <button onClick={() => toggleLike(tweet.id)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}><HeartIcon filled={tweet.liked} /><span style={{ color: tweet.liked ? "#F91880" : "#71767B", fontSize: 13 }}>{formatCount(tweet.likes)}</span></button>
          <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}><ViewsIcon /><span style={{ color: "#71767B", fontSize: 13 }}>{formatCount(tweet.views)}</span></button>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><ShareIcon /></button>
        </div>
      </div>
    </div>
  );
}

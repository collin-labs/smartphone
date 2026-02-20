import React, { useState, useCallback, useRef, useEffect } from "react";
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// ============================================================
// Instagram App — Visual V0 pixel-perfect + Backend FiveM
// Views: feed | stories | profile | comments | newPost | search | viewProfile
// ============================================================

const fmtCount = (n) => {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e4) return (n / 1e3).toFixed(0) + "K";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};
const timeAgo = (d) => {
  if (!d) return "";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return Math.floor(s / 60) + "min";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
};

const GRADS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];
const ACOLS = ["#E1306C", "#F77737", "#C13584", "#405DE6", "#833AB4", "#FD1D1D", "#FCAF45", "#3897f0"];
const getGrad = (id) => GRADS[(id || 0) % GRADS.length];
const getACol = (id) => ACOLS[(id || 0) % ACOLS.length];

// ===== SVG Icons (100% V0) =====
const HeartIcon = ({ filled = false, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ED4956" : "none"} stroke={filled ? "#ED4956" : "#F5F5F5"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CommentIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);
const ShareIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const SaveIcon = ({ filled = false, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#F5F5F5" : "none"} stroke="#F5F5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const HomeIcon = ({ active = false }) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill={active ? "#F5F5F5" : "none"} stroke="#F5F5F5" strokeWidth={active ? 2.5 : 1.5}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>{!active && <polyline points="9 22 9 12 15 12 15 22"/>}
  </svg>
);
const SearchIcon = ({ active = false }) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth={active ? 2.5 : 1.5}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const ReelsIcon = ({ active = false }) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth={active ? 2.5 : 1.5}>
    <rect x="2" y="2" width="20" height="20" rx="5"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="8" y1="2" x2="14" y2="8"/><line x1="14" y1="2" x2="20" y2="8"/><polygon points="10 13 16 16 10 19" fill={active ? "#F5F5F5" : "none"}/>
  </svg>
);
const PlusSquareIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const GridIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const ReelsTabIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="1.5">
    <rect x="2" y="2" width="20" height="20" rx="5"/><polygon points="10 8 17 12 10 16"/>
  </svg>
);
const TagIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="1.5">
    <path d="M16 3H8a2 2 0 0 0-2 2v14l6-3 6 3V5a2 2 0 0 0-2-2z"/>
  </svg>
);
const MenuIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const BackIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const Avatar = ({ name, size = 32, ring = false, color }) => (
  <div style={{ width: size + (ring ? 6 : 0), height: size + (ring ? 6 : 0), borderRadius: "50%", background: ring ? "linear-gradient(135deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)" : "transparent", padding: ring ? 3 : 0, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: size, height: size, borderRadius: "50%", background: ring ? "#000" : "transparent", padding: ring ? 2 : 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: color || "#363636", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 700, color: "#fff" }}>
        {name?.[0]?.toUpperCase() || "?"}
      </div>
    </div>
  </div>
);

const B = { background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, alignItems: "center", justifyContent: "center" };

// ===== MAIN COMPONENT =====
export default function Instagram({ onNavigate }) {
  const [view, setView] = useState("feed");
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState([]);
  const [myProfileId, setMyProfileId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [viewProfileData, setViewProfileData] = useState(null);
  const [viewComments, setViewComments] = useState({ postId: null, comments: [] });
  const [loading, setLoading] = useState(true);
  const [newCaption, setNewCaption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [likeAnim, setLikeAnim] = useState(null);
  const [saved, setSaved] = useState({});
  const [activeStory, setActiveStory] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [profileTab, setProfileTab] = useState("grid");
  const feedRef = useRef(null);
  const storyTimerRef = useRef(null);

  // ===== Backend =====
  const loadFeed = useCallback(async () => { setLoading(true); const r = await fetchBackend('ig_feed'); if (r?.posts) setPosts(r.posts); if (r?.myProfileId) setMyProfileId(r.myProfileId); setLoading(false); }, []);
  const loadExplore = useCallback(async () => { setLoading(true); const r = await fetchBackend('ig_explore'); if (r?.posts) setPosts(r.posts); if (r?.myProfileId) setMyProfileId(r.myProfileId); setLoading(false); }, []);
  const loadMyProfile = useCallback(async () => { setLoading(true); const r = await fetchBackend('ig_profile'); if (r?.profile) setMyProfile(r.profile); if (r?.myProfileId) setMyProfileId(r.myProfileId); setLoading(false); }, []);

  useEffect(() => { if (tab === 'feed') loadFeed(); else if (tab === 'explore') loadExplore(); else if (tab === 'profile') loadMyProfile(); }, [tab, loadFeed, loadExplore, loadMyProfile]);
  usePusherEvent('IG_NOTIFICATION', useCallback(() => {}, []));

  const handleLike = async (id) => { const r = await fetchBackend('ig_like', { postId: id }); if (r?.ok) { setPosts(p => p.map(x => x.id === id ? { ...x, is_liked: r.liked ? 1 : 0, likes_count: x.likes_count + (r.liked ? 1 : -1) } : x)); if (r.liked) { setLikeAnim(id); setTimeout(() => setLikeAnim(null), 800); } } };
  const doubleTap = async (id) => { const p = posts.find(x => x.id === id); if (p && !p.is_liked) handleLike(id); else { setLikeAnim(id); setTimeout(() => setLikeAnim(null), 800); } };
  const openComments = async (id) => { setViewComments({ postId: id, comments: [] }); setView('comments'); const r = await fetchBackend('ig_comments', { postId: id }); if (r?.comments) setViewComments({ postId: id, comments: r.comments }); };
  const sendComment = async () => { if (!commentText.trim()) return; const r = await fetchBackend('ig_comment', { postId: viewComments.postId, text: commentText }); if (r?.ok) { setViewComments(p => ({ ...p, comments: [...p.comments, r.comment] })); setCommentText(''); setPosts(p => p.map(x => x.id === viewComments.postId ? { ...x, comments_count: x.comments_count + 1 } : x)); } };
  const handlePost = async () => { if (!newCaption.trim()) return; const r = await fetchBackend('ig_post', { caption: newCaption }); if (r?.ok) { setNewCaption(''); setTab('feed'); setView('feed'); loadFeed(); } };
  const openProfile = async (id) => { const r = await fetchBackend('ig_profile', { profileId: id }); if (r?.profile) { setViewProfileData({ ...r.profile, isFollowing: r.isFollowing }); setView('viewProfile'); } };
  const handleFollow = async () => { if (!viewProfileData) return; const r = await fetchBackend('ig_follow', { profileId: viewProfileData.id }); if (r?.ok) setViewProfileData(p => ({ ...p, isFollowing: r.following, followers: p.followers + (r.following ? 1 : -1) })); };
  const handleSearch = async () => { if (!searchQuery.trim()) return; const r = await fetchBackend('ig_search', { query: searchQuery }); if (r?.results) setSearchResults(r.results); };
  const deletePost = async (postId) => { const r = await fetchBackend('ig_delete_post', { postId }); if (r?.ok) setPosts(p => p.filter(x => x.id !== postId)); };
  const toggleSave = useCallback((postId) => { setSaved(prev => ({ ...prev, [postId]: !prev[postId] })); }, []);

  const storyUsers = posts.slice(0, 7).map((p, i) => ({ id: p.profile_id || i + 1, username: p.username, color: getACol(p.profile_id || i), hasStory: true, content: p.caption || "" }));

  // Story timer
  useEffect(() => {
    if (view !== "stories") return;
    setStoryProgress(0);
    if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    storyTimerRef.current = setInterval(() => {
      setStoryProgress((p) => {
        if (p >= 100) {
          if (activeStory < storyUsers.length - 1) { setActiveStory((a) => a + 1); return 0; }
          else { setView("feed"); return 0; }
        }
        return p + 2;
      });
    }, 60);
    return () => { if (storyTimerRef.current) clearInterval(storyTimerRef.current); };
  }, [view, activeStory, storyUsers.length]);

  const openStory = useCallback((i) => { setActiveStory(i); setStoryProgress(0); setView("stories"); }, []);

  // ============================================================
  // COMMENTS
  // ============================================================
  if (view === "comments") return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #262626", gap: 12 }}>
        <button onClick={() => setView("feed")} style={B}><BackIcon /></button>
        <span style={{ color: "#F5F5F5", fontSize: 16, fontWeight: 700 }}>Comentários</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {viewComments.comments.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#A8A8A8", fontSize: 14 }}>Nenhum comentário ainda</div>}
        {viewComments.comments.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <Avatar name={c.username} size={32} color={getACol(i)} />
            <div style={{ flex: 1 }}>
              <div><span style={{ color: "#F5F5F5", fontSize: 13, fontWeight: 600 }}>{c.username}</span>{" "}<span style={{ color: "#F5F5F5", fontSize: 13 }}>{c.text}</span></div>
              <div style={{ color: "#737373", fontSize: 12, marginTop: 4 }}>{timeAgo(c.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: "1px solid #262626" }}>
        <Avatar name="E" size={28} color="#405DE6" />
        <input type="text" placeholder="Adicione um comentário..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendComment()} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5F5F5", fontSize: 14, fontFamily: "inherit" }} />
        {commentText.trim() && <button onClick={sendComment} style={{ ...B, color: "#0095F6", fontSize: 14, fontWeight: 600 }}>Publicar</button>}
      </div>
    </div>
  );

  // ============================================================
  // VIEW PROFILE (outro usuário)
  // ============================================================
  if (view === "viewProfile" && viewProfileData) return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #262626", gap: 12 }}>
        <button onClick={() => { setView("feed"); setViewProfileData(null); }} style={B}><BackIcon /></button>
        <span style={{ color: "#F5F5F5", fontSize: 16, fontWeight: 700 }}>{viewProfileData.username}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
            <Avatar name={viewProfileData.name || viewProfileData.username} size={80} color={getACol(viewProfileData.id)} />
            <div style={{ display: "flex", flex: 1, justifyContent: "space-around" }}>
              {[{ label: "posts", value: (viewProfileData.posts || []).length }, { label: "seguidores", value: fmtCount(viewProfileData.followers || 0) }, { label: "seguindo", value: fmtCount(viewProfileData.following || 0) }].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}><div style={{ color: "#F5F5F5", fontSize: 17, fontWeight: 700 }}>{s.value}</div><div style={{ color: "#A8A8A8", fontSize: 13 }}>{s.label}</div></div>
              ))}
            </div>
          </div>
          <div style={{ color: "#F5F5F5", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{viewProfileData.name}</div>
          {viewProfileData.bio && <div style={{ color: "#F5F5F5", fontSize: 14, whiteSpace: "pre-line", lineHeight: 1.4, marginBottom: 2 }}>{viewProfileData.bio}</div>}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, marginTop: 12 }}>
            <button onClick={handleFollow} style={{ flex: 1, height: 34, borderRadius: 8, background: viewProfileData.isFollowing ? "#363636" : "#0095F6", border: "none", color: "#F5F5F5", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{viewProfileData.isFollowing ? "Seguindo" : "Seguir"}</button>
            <button style={{ flex: 1, height: 34, borderRadius: 8, background: "#363636", border: "none", color: "#F5F5F5", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Mensagem</button>
          </div>
        </div>
        <div style={{ display: "flex", borderTop: "1px solid #262626", borderBottom: "1px solid #262626" }}>
          <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", background: "none", border: "none", borderBottom: "1px solid #F5F5F5" }}><GridIcon /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, padding: 2 }}>
          {(viewProfileData.posts || []).map((p, i) => (<div key={p.id || i} style={{ aspectRatio: "1/1", background: getGrad(p.id || i), display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 10, textAlign: "center", padding: 4, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{p.caption?.substring(0, 30) || "📷"}</span></div>))}
          {(!viewProfileData.posts || viewProfileData.posts.length === 0) && <div style={{ gridColumn: "1/4", textAlign: "center", padding: 40, color: "#A8A8A8" }}><div style={{ fontSize: 40, marginBottom: 8 }}>📷</div><div style={{ fontSize: 14 }}>Nenhuma publicação</div></div>}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // NEW POST
  // ============================================================
  if (view === "newPost") return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #262626" }}>
        <button onClick={() => setView("feed")} style={{ ...B, color: "#F5F5F5", fontSize: 18 }}>✕</button>
        <span style={{ color: "#F5F5F5", fontSize: 16, fontWeight: 700 }}>Nova publicação</span>
        <button onClick={handlePost} style={{ ...B, color: "#0095F6", fontSize: 16, fontWeight: 600 }}>Compartilhar</button>
      </div>
      <div style={{ flex: 1, padding: 16 }}>
        <div style={{ background: "#262626", borderRadius: 8, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 8 }}>📸</div><div style={{ color: "#A8A8A8", fontSize: 13 }}>Foto do RP</div></div>
        </div>
        <textarea placeholder="Escreva uma legenda..." value={newCaption} onChange={e => setNewCaption(e.target.value)} style={{ width: "100%", minHeight: 100, background: "transparent", border: "none", outline: "none", color: "#F5F5F5", fontSize: 16, fontFamily: "inherit", resize: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
      </div>
    </div>
  );

  // ============================================================
  // SEARCH / EXPLORE
  // ============================================================
  if (view === "search") return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", background: "#262626", borderRadius: 10, padding: "8px 12px", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input type="text" placeholder="Pesquisar" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} autoFocus style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5F5F5", fontSize: 16, fontFamily: "inherit" }} />
          {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} style={{ ...B, color: "#A8A8A8" }}>✕</button>}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {searchResults.length > 0 ? searchResults.map(r => (
          <div key={r.id} onClick={() => openProfile(r.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer" }}>
            <Avatar name={r.username} size={44} color={getACol(r.id)} />
            <div><div style={{ color: "#F5F5F5", fontSize: 14, fontWeight: 600 }}>{r.username}</div><div style={{ color: "#A8A8A8", fontSize: 13 }}>{r.name}</div></div>
          </div>
        )) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, padding: "2px 0" }}>
            {posts.map((p, i) => (<div key={p.id} onClick={() => openProfile(p.profile_id)} style={{ aspectRatio: "1", background: getGrad(p.id || i), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span style={{ color: "#fff", fontSize: 10, textAlign: "center", padding: 4, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{p.caption?.substring(0, 20) || "📷"}</span></div>))}
          </div>
        )}
      </div>
      <BottomNav tab={tab} setTab={setTab} setView={setView} />
    </div>
  );

  // ============================================================
  // STORIES (100% V0)
  // ============================================================
  if (view === "stories" && storyUsers.length > 0) {
    const story = storyUsers[activeStory];
    return (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 3, padding: "10px 10px 0", zIndex: 10 }}>
          {storyUsers.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, background: "#fff", width: i < activeStory ? "100%" : i === activeStory ? `${storyProgress}%` : "0%", transition: i === activeStory ? "width 60ms linear" : "none" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 12px 0", gap: 10, zIndex: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: story?.color || "#888", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{story?.username?.charAt(0).toUpperCase()}</div>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, flex: 1 }}>{story?.username}</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>2h</span>
          <button onClick={() => setView("feed")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", position: "relative" }}>
          <div onClick={() => activeStory > 0 && (setActiveStory(activeStory - 1), setStoryProgress(0))} style={{ position: "absolute", left: 0, top: 0, width: "30%", height: "100%", zIndex: 5, cursor: "pointer" }} />
          <div onClick={() => { if (activeStory < storyUsers.length - 1) { setActiveStory(activeStory + 1); setStoryProgress(0); } else setView("feed"); }} style={{ position: "absolute", right: 0, top: 0, width: "70%", height: "100%", zIndex: 5, cursor: "pointer" }} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
            <p style={{ color: "#fff", fontSize: 22, fontWeight: 600, textAlign: "center", lineHeight: 1.5 }}>{story?.content}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px 16px", zIndex: 10 }}>
          <div style={{ flex: 1, height: 40, borderRadius: 20, border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", paddingLeft: 16, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Enviar mensagem...</div>
          <HeartIcon size={22} />
          <ShareIcon size={22} />
        </div>
      </div>
    );
  }

  // ============================================================
  // PROFILE (próprio — layout V0)
  // ============================================================
  if (tab === "profile") return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #262626" }}>
        <button onClick={() => setTab("feed")} style={B}><BackIcon /></button>
        <span style={{ color: "#F5F5F5", fontSize: 16, fontWeight: 700 }}>{myProfile?.username || "Perfil"}</span>
        <div style={{ display: "flex", gap: 16 }}><button onClick={() => { setNewCaption(''); setView('newPost'); }} style={B}><PlusSquareIcon /></button><button style={B}><MenuIcon /></button></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}><div style={{ width: 24, height: 24, border: "2px solid #262626", borderTopColor: "#F5F5F5", borderRadius: "50%", animation: "igSpin 0.8s linear infinite" }} /></div>
        ) : myProfile ? (<>
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)", padding: 3, flexShrink: 0 }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#000", padding: 2 }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, #405DE6, #833AB4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff" }}>{(myProfile.username || "?").charAt(0).toUpperCase()}</div>
                </div>
              </div>
              <div style={{ display: "flex", flex: 1, justifyContent: "space-around" }}>
                {[{ label: "posts", value: (myProfile.posts || []).length }, { label: "seguidores", value: fmtCount(myProfile.followers || 0) }, { label: "seguindo", value: fmtCount(myProfile.following || 0) }].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}><div style={{ color: "#F5F5F5", fontSize: 17, fontWeight: 700 }}>{s.value}</div><div style={{ color: "#A8A8A8", fontSize: 13 }}>{s.label}</div></div>
                ))}
              </div>
            </div>
            <div style={{ color: "#F5F5F5", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{myProfile.name}</div>
            {myProfile.bio && <div style={{ color: "#F5F5F5", fontSize: 14, whiteSpace: "pre-line", lineHeight: 1.4, marginBottom: 2 }}>{myProfile.bio}</div>}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, marginTop: 12 }}>
              <button style={{ flex: 1, height: 34, borderRadius: 8, background: "#363636", border: "none", color: "#F5F5F5", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Editar perfil</button>
              <button style={{ flex: 1, height: 34, borderRadius: 8, background: "#363636", border: "none", color: "#F5F5F5", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Compartilhar perfil</button>
              <button style={{ width: 34, height: 34, borderRadius: 8, background: "#363636", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#F5F5F5" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", borderTop: "1px solid #262626", borderBottom: "1px solid #262626" }}>
            {[{ key: "grid", icon: <GridIcon /> }, { key: "reels", icon: <ReelsTabIcon /> }, { key: "tags", icon: <TagIcon /> }].map((t) => (
              <button key={t.key} onClick={() => setProfileTab(t.key)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", background: "none", border: "none", cursor: "pointer", borderBottom: profileTab === t.key ? "1px solid #F5F5F5" : "1px solid transparent", opacity: profileTab === t.key ? 1 : 0.5 }}>{t.icon}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, padding: 2 }}>
            {(myProfile.posts || []).map((p, i) => (<div key={p.id || i} style={{ aspectRatio: "1/1", background: getGrad(p.id || i), display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 10, textAlign: "center", padding: 4, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{p.caption?.substring(0, 30) || "📷"}</span></div>))}
            {(!myProfile.posts || myProfile.posts.length === 0) && <div style={{ gridColumn: "1/4", textAlign: "center", padding: 40, color: "#A8A8A8" }}><div style={{ fontSize: 40, marginBottom: 8 }}>📷</div><div style={{ fontSize: 14 }}>Nenhuma publicação</div></div>}
          </div>
        </>) : null}
      </div>
      <BottomNav tab={tab} setTab={setTab} setView={setView} />
      <style>{`@keyframes igSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ============================================================
  // FEED (default — layout 100% V0)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #262626", flexShrink: 0 }}>
        <svg width={105} height={28} viewBox="0 0 105 28"><text x="0" y="24" fill="#F5F5F5" fontFamily="Georgia, 'Times New Roman', serif" fontSize="24" fontStyle="italic" fontWeight="400">Instagram</text></svg>
        <div style={{ display: "flex", gap: 20 }}>
          <button onClick={() => { setNewCaption(''); setView('newPost'); }} style={B}><PlusSquareIcon /></button>
          <button style={B}><HeartIcon size={24} /></button>
          <button style={B}><ShareIcon size={24} /></button>
        </div>
      </div>
      <div ref={feedRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}><div style={{ width: 24, height: 24, border: "2px solid #262626", borderTopColor: "#F5F5F5", borderRadius: "50%", animation: "igSpin 0.8s linear infinite" }} /></div>
        ) : (<>
          {/* Stories (V0) */}
          <div style={{ display: "flex", gap: 12, padding: "12px 12px", overflowX: "auto", borderBottom: "1px solid #262626" }}>
            <button style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0, width: 66 }}>
              <div style={{ width: 62, height: 62, borderRadius: "50%", background: "#363636", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#3897f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff" }}>{(myProfile?.username || "?").charAt(0).toUpperCase()}</div>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: "#0095F6", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
              </div>
              <span style={{ color: "#A8A8A8", fontSize: 11 }}>Seu story</span>
            </button>
            {storyUsers.map((s, i) => (
              <button key={s.id || i} onClick={() => openStory(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0, width: 66 }}>
                <div style={{ width: 62, height: 62, borderRadius: "50%", background: "linear-gradient(135deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)", padding: 2.5, position: "relative" }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#000", padding: 2 }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff" }}>{s.username?.charAt(0).toUpperCase()}</div>
                  </div>
                </div>
                <span style={{ color: "#F5F5F5", fontSize: 11, maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.username}</span>
              </button>
            ))}
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#A8A8A8" }}><div style={{ fontSize: 48, marginBottom: 12 }}>📷</div><div style={{ fontSize: 16, fontWeight: 600, color: "#F5F5F5" }}>Siga pessoas para ver posts</div></div>
          ) : posts.map((post, idx) => (
            <div key={post.id} style={{ borderBottom: "1px solid #262626" }}>
              <div onClick={() => openProfile(post.profile_id)} style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: getACol(post.profile_id || idx), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{(post.username || "?").charAt(0).toUpperCase()}</div>
                <span style={{ color: "#F5F5F5", fontSize: 13, fontWeight: 600, flex: 1 }}>{post.username}</span>
                {post.profile_id === myProfileId && <button onClick={(e) => { e.stopPropagation(); if (confirm('Excluir post?')) deletePost(post.id); }} style={{ ...B, padding: 4 }}><svg width={16} height={16} viewBox="0 0 24 24" fill="#F5F5F5"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>}
                <span style={{ color: "#A8A8A8", fontSize: 12 }}>{timeAgo(post.created_at)}</span>
              </div>
              <div onDoubleClick={() => doubleTap(post.id)} style={{ width: "100%", aspectRatio: "1/1", background: getGrad(post.id || idx), backgroundSize: "cover", backgroundPosition: "center", position: "relative", cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {post.caption && <span style={{ color: "#fff", fontSize: 14, padding: 20, textAlign: "center", lineHeight: 1.6, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{post.caption}</span>}
                {likeAnim === post.id && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><svg width="80" height="80" viewBox="0 0 24 24" style={{ animation: "igLike 0.8s ease-out forwards", opacity: 0 }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#fff"/></svg></div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 16 }}>
                <button onClick={() => handleLike(post.id)} style={B}><HeartIcon filled={!!post.is_liked} size={24} /></button>
                <button onClick={() => openComments(post.id)} style={B}><CommentIcon size={24} /></button>
                <button style={B}><ShareIcon size={24} /></button>
                <div style={{ flex: 1 }} />
                <button onClick={() => toggleSave(post.id)} style={B}><SaveIcon filled={!!saved[post.id]} size={24} /></button>
              </div>
              {post.likes_count > 0 && <div style={{ padding: "0 12px", color: "#F5F5F5", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{fmtCount(post.likes_count)} curtida{post.likes_count !== 1 ? "s" : ""}</div>}
              {post.caption && <div style={{ padding: "0 12px", marginBottom: 4 }}><span style={{ color: "#F5F5F5", fontSize: 13, fontWeight: 600 }}>{post.username}</span>{" "}<span style={{ color: "#F5F5F5", fontSize: 13 }}>{post.caption}</span></div>}
              {post.comments_count > 0 && <div onClick={() => openComments(post.id)} style={{ padding: "0 12px", marginBottom: 4, color: "#A8A8A8", fontSize: 13, cursor: "pointer" }}>Ver todos os {post.comments_count} comentários</div>}
              <div style={{ padding: "0 12px 12px", color: "#A8A8A8", fontSize: 11 }}>{timeAgo(post.created_at)}</div>
            </div>
          ))}
          <div style={{ height: 60 }} />
        </>)}
      </div>
      <BottomNav tab={tab} setTab={setTab} setView={setView} />
      <style>{`@keyframes igSpin{to{transform:rotate(360deg)}} @keyframes igLike{0%{opacity:0;transform:scale(.2)}15%{opacity:1;transform:scale(1.3)}30%{transform:scale(.95)}45%{transform:scale(1.05)}80%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1)}}`}</style>
    </div>
  );
}

// ===== Bottom Navigation (V0) =====
function BottomNav({ tab, setTab, setView }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0", borderTop: "1px solid #262626", background: "#000", flexShrink: 0 }}>
      <button onClick={() => { setTab("feed"); setView("feed"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex" }}><HomeIcon active={tab === "feed"} /></button>
      <button onClick={() => { setTab("explore"); setView("search"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex" }}><SearchIcon active={tab === "explore"} /></button>
      <button onClick={() => setView("newPost")} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex" }}><PlusSquareIcon /></button>
      <button style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex" }}><ReelsIcon /></button>
      <button onClick={() => { setTab("profile"); setView("feed"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", border: tab === "profile" ? "2px solid #F5F5F5" : "none", background: "linear-gradient(135deg, #405DE6, #833AB4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>C</div>
      </button>
    </div>
  );
}

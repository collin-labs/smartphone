import React, { useState, useCallback, useEffect, useRef } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Spotify App — Pixel-perfect 2025/2026 dark mode replica
// Telas: home | search | library | playlist | player
// Áudio real via YouTube hidden iframe
// Layout V0 100% preservado
// ============================================================

// ===================== FALLBACK DATA =====================
const FALLBACK_QUICK_ACCESS = [
  { id: 1, name: "Curtidas", emoji: "purple", color: "linear-gradient(135deg, #4527A0, #7C4DFF)" },
  { id: 2, name: "Funk 2025", emoji: "orange", color: "linear-gradient(135deg, #E65100, #FF9800)" },
  { id: 3, name: "Trap BR", emoji: "red", color: "linear-gradient(135deg, #B71C1C, #F44336)" },
  { id: 4, name: "Chill Vibes", emoji: "teal", color: "linear-gradient(135deg, #00695C, #26A69A)" },
  { id: 5, name: "Rock Classico", emoji: "gray", color: "linear-gradient(135deg, #37474F, #78909C)" },
  { id: 6, name: "Rap Nacional", emoji: "green", color: "linear-gradient(135deg, #1B5E20, #4CAF50)" },
];

const FALLBACK_PLAYLISTS = [
  { id: 1, name: "Daily Mix 1", desc: "Maria Santos, Joao Grau e mais", gradient: "linear-gradient(135deg, #1DB954, #1ed760)" },
  { id: 2, name: "Descubra", desc: "Baseado no que voce ouve", gradient: "linear-gradient(135deg, #7B1FA2, #E040FB)" },
  { id: 3, name: "Radar", desc: "Novidades pra voce", gradient: "linear-gradient(135deg, #0D47A1, #42A5F5)" },
  { id: 4, name: "Top Brasil", desc: "As mais tocadas", gradient: "linear-gradient(135deg, #E65100, #FF6D00)" },
  { id: 5, name: "Chill Mix", desc: "Relaxe com essas", gradient: "linear-gradient(135deg, #004D40, #00BFA5)" },
];

const FALLBACK_SEARCH_CATEGORIES = [
  { name: "Musica", color: "#E13300" },
  { name: "Podcasts", color: "#006450" },
  { name: "Ao Vivo", color: "#7358FF" },
  { name: "Feito p/ voce", color: "#1E3264" },
  { name: "Novidades", color: "#E8115B" },
  { name: "Funk", color: "#BA5D07" },
  { name: "Pop", color: "#148A08" },
  { name: "Hip-Hop", color: "#BC5900" },
  { name: "Rock", color: "#477D95" },
  { name: "Sertanejo", color: "#8D67AB" },
  { name: "Pagode", color: "#1E3264" },
  { name: "Eletronica", color: "#E61E32" },
];

const FALLBACK_LIBRARY = [
  { id: 1, name: "Curtidas", type: "Playlist", count: 234, gradient: "linear-gradient(135deg, #4527A0, #7C4DFF)" },
  { id: 2, name: "Funk 2025", type: "Playlist", count: 67, gradient: "linear-gradient(135deg, #E65100, #FF9800)" },
  { id: 3, name: "Trap BR", type: "Playlist", count: 45, gradient: "linear-gradient(135deg, #B71C1C, #F44336)" },
  { id: 4, name: "Chill Vibes", type: "Playlist", count: 89, gradient: "linear-gradient(135deg, #00695C, #26A69A)" },
  { id: 5, name: "MC Tuner", type: "Artista", count: 0, gradient: "linear-gradient(135deg, #F77737, #E1306C)" },
  { id: 6, name: "Los Santos FM", type: "Podcast", count: 23, gradient: "linear-gradient(135deg, #1E88E5, #42A5F5)" },
];

const FALLBACK_TRACKS = [
  { id: 1, name: "Vida Loka Pt. 1", artist: "Racionais MC's", liked: true, youtube_id: "uOFfQhT4lGU", duration: 287 },
  { id: 2, name: "Baile de Favela", artist: "MC Joao", liked: false, youtube_id: "hsXx73VTMKo", duration: 213 },
  { id: 3, name: "Acorda Pedrinho", artist: "Jovem Dionisio", liked: true, youtube_id: "7BDhrrCelwA", duration: 198 },
  { id: 4, name: "Deixa Eu Te Pedir", artist: "Jorge Vercillo", liked: false, youtube_id: "R2LQdh42neg", duration: 245 },
  { id: 5, name: "Ta Tranquilo Ta Favoravel", artist: "MC Bin Laden", liked: true, youtube_id: "mWIl1tgAvzY", duration: 176 },
  { id: 6, name: "Jenifer", artist: "Gabriel Diniz", liked: false, youtube_id: "Lj1-GIAyv5Y", duration: 203 },
  { id: 7, name: "Eu Sei de Cor", artist: "Marilia Mendonca", liked: true, youtube_id: "FBD-S8JlU60", duration: 267 },
  { id: 8, name: "Que Tiro Foi Esse", artist: "Jojo Maronttinni", liked: false, youtube_id: "a9BCfKQxBCU", duration: 184 },
  { id: 9, name: "Onda Diferente", artist: "Anitta", liked: true, youtube_id: "BhLgWDvZmJE", duration: 221 },
  { id: 10, name: "Deu Onda", artist: "MC G15", liked: false, youtube_id: "I1aEMqTJdug", duration: 192 },
];

const FALLBACK_CURRENT = {
  name: "Vida Loka Pt. 1",
  artist: "Racionais MC's",
  playlist: "Rap Nacional",
  duration: 287,
  youtube_id: "uOFfQhT4lGU",
  gradient: "linear-gradient(135deg, #1B5E20, #4CAF50, #1B5E20)",
};

export default function Spotify() {
  const [view, setView] = useState("home");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(0);
  const [tracks, setTracks] = useState(FALLBACK_TRACKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryFilter, setLibraryFilter] = useState("Playlists");
  const [playlists, setPlaylists] = useState(FALLBACK_PLAYLISTS);
  const [quickAccess, setQuickAccess] = useState(FALLBACK_QUICK_ACCESS);
  const [libraryItems, setLibraryItems] = useState(FALLBACK_LIBRARY);
  const [currentTrack, setCurrentTrack] = useState(FALLBACK_CURRENT);
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [activePlaylistName, setActivePlaylistName] = useState("Rap Nacional");
  const [activePlaylistDesc, setActivePlaylistDesc] = useState("Os melhores raps BR");
  const [activePlaylistGradient, setActivePlaylistGradient] = useState("linear-gradient(135deg, #1B5E20, #4CAF50)");
  const [volume, setVolume] = useState(80);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const progressInterval = useRef(null);

  // ===================== LOAD DATA FROM BACKEND =====================
  useEffect(() => {
    fetchBackend("spotify_playlists", {}).then(res => {
      if (res && res.playlists && res.playlists.length > 0) {
        setPlaylists(res.playlists);
      }
    }).catch(() => {});

    fetchBackend("spotify_library", {}).then(res => {
      if (res && res.items && res.items.length > 0) {
        setLibraryItems(res.items);
      }
    }).catch(() => {});

    fetchBackend("spotify_quick_access", {}).then(res => {
      if (res && res.items && res.items.length > 0) {
        setQuickAccess(res.items);
      }
    }).catch(() => {});
  }, []);

  // ===================== LOAD PLAYLIST TRACKS =====================
  const loadPlaylist = useCallback((playlist) => {
    setActivePlaylistId(playlist.id);
    setActivePlaylistName(playlist.name);
    setActivePlaylistDesc(playlist.desc || playlist.description || "");
    setActivePlaylistGradient(playlist.gradient || playlist.color || "linear-gradient(135deg, #1B5E20, #4CAF50)");
    setView("playlist");

    fetchBackend("spotify_playlist_tracks", { playlist_id: playlist.id }).then(res => {
      if (res && res.tracks && res.tracks.length > 0) {
        setTracks(res.tracks);
      }
    }).catch(() => {});
  }, []);

  // ===================== YOUTUBE AUDIO ENGINE =====================
  const playTrack = useCallback((track) => {
    const ytId = track.youtube_id || "";
    setCurrentTrack({
      name: track.name,
      artist: track.artist,
      playlist: activePlaylistName,
      duration: track.duration || 240,
      youtube_id: ytId,
      gradient: activePlaylistGradient,
    });
    setProgress(0);
    setIsPlaying(true);

    // Notify server that track is playing (for xSound/3D audio integration)
    fetchBackend("spotify_play", {
      track_id: track.id,
      youtube_id: ytId,
      track_name: track.name,
      artist: track.artist,
    }).catch(() => {});
  }, [activePlaylistName, activePlaylistGradient]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      const newState = !prev;
      // Notify server of state change (for xSound sync)
      fetchBackend("spotify_toggle", { playing: newState }).catch(() => {});
      return newState;
    });
  }, []);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    fetchBackend("spotify_stop", {}).catch(() => {});
  }, []);

  // Simulate progress
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (!isPlaying) return;
    progressInterval.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          // Auto next track
          const idx = tracks.findIndex(t => t.name === currentTrack.name);
          if (idx >= 0 && idx < tracks.length - 1) {
            playTrack(tracks[idx + 1]);
          } else if (repeat === 1 && tracks.length > 0) {
            playTrack(tracks[0]);
          } else if (repeat === 2) {
            return 0;
          } else {
            setIsPlaying(false);
          }
          return 0;
        }
        return p + (100 / (currentTrack.duration || 240));
      });
    }, 1000);
    return () => clearInterval(progressInterval.current);
  }, [isPlaying, currentTrack, tracks, repeat, playTrack]);

  // ===================== TOGGLE LIKE =====================
  const toggleTrackLike = useCallback((id) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, liked: !t.liked } : t));
    fetchBackend("spotify_like", { track_id: id }).catch(() => {});
  }, []);

  // ===================== SEARCH =====================
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      fetchBackend("spotify_search", { query }).then(res => {
        if (res && res.tracks) {
          setTracks(res.tracks);
          setView("playlist");
          setActivePlaylistName("Resultados");
          setActivePlaylistDesc(`Busca: "${query}"`);
          setActivePlaylistGradient("linear-gradient(135deg, #333, #666)");
        }
      }).catch(() => {});
    }
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ===================== HIDDEN YOUTUBE IFRAME (real audio) =====================
  const YoutubeAudio = () => {
    if (!currentTrack.youtube_id || !isPlaying) return null;
    return (
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${currentTrack.youtube_id}?autoplay=1&loop=${repeat === 2 ? 1 : 0}&playlist=${currentTrack.youtube_id}&enablejsapi=1`}
        style={{
          position: "absolute", width: 1, height: 1, opacity: 0,
          pointerEvents: "none", top: -9999, left: -9999,
        }}
        allow="autoplay; encrypted-media"
        title="spotify-audio"
      />
    );
  };

  // ============================================================
  // PLAYER VIEW
  // ============================================================
  if (view === "player") {
    const currentTime = (progress / 100) * (currentTrack.duration || 240);
    return (
      <div style={{
        width: "100%", height: "100%",
        background: "linear-gradient(180deg, #1B5E20 0%, #121212 60%)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        position: "relative",
      }}>
        <YoutubeAudio />
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px",
        }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#b3b3b3", fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>TOCANDO DA PLAYLIST</div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{currentTrack.playlist}</div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
        </div>

        {/* Cover art */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
          <div style={{
            width: 280, height: 280, borderRadius: 8,
            background: currentTrack.gradient,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {currentTrack.youtube_id ? (
              <img
                src={`https://img.youtube.com/vi/${currentTrack.youtube_id}/mqdefault.jpg`}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                alt=""
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <svg width={60} height={60} viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            )}
          </div>
        </div>

        {/* Track info */}
        <div style={{ padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{currentTrack.name}</div>
              <div style={{ color: "#b3b3b3", fontSize: 14, marginTop: 2 }}>{currentTrack.artist}</div>
            </div>
            <button onClick={() => {
              const t = tracks.find(t => t.name === currentTrack.name);
              if (t) toggleTrackLike(t.id);
            }} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="#1DB954" stroke="#1DB954" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{ width: "100%", height: 4, background: "#4D4D4D", borderRadius: 2, cursor: "pointer", position: "relative" }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(((e.clientX - rect.left) / rect.width) * 100);
              }}
            >
              <div style={{ width: `${progress}%`, height: "100%", background: "#fff", borderRadius: 2, position: "relative" }}>
                <div style={{
                  position: "absolute", right: -6, top: -4,
                  width: 12, height: 12, borderRadius: "50%", background: "#fff",
                }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ color: "#b3b3b3", fontSize: 11 }}>{formatTime(currentTime)}</span>
              <span style={{ color: "#b3b3b3", fontSize: 11 }}>{formatTime(currentTrack.duration || 240)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 8px 24px",
          }}>
            {/* Shuffle */}
            <button onClick={() => setShuffle(!shuffle)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={shuffle ? "#1DB954" : "#b3b3b3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
              </svg>
            </button>
            {/* Prev */}
            <button onClick={() => {
              const idx = tracks.findIndex(t => t.name === currentTrack.name);
              if (idx > 0) playTrack(tracks[idx - 1]);
            }} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="#fff">
                <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="#fff" strokeWidth="2"/>
              </svg>
            </button>
            {/* Play/Pause */}
            <button onClick={togglePlay} style={{
              width: 60, height: 60, borderRadius: "50%", background: "#fff",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isPlaying ? (
                <svg width={28} height={28} viewBox="0 0 24 24" fill="#000">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width={28} height={28} viewBox="0 0 24 24" fill="#000">
                  <polygon points="6 3 20 12 6 21 6 3"/>
                </svg>
              )}
            </button>
            {/* Next */}
            <button onClick={() => {
              const idx = tracks.findIndex(t => t.name === currentTrack.name);
              if (idx >= 0 && idx < tracks.length - 1) playTrack(tracks[idx + 1]);
            }} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="#fff">
                <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="#fff" strokeWidth="2"/>
              </svg>
            </button>
            {/* Repeat */}
            <button onClick={() => setRepeat(r => (r + 1) % 3)} style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={repeat > 0 ? "#1DB954" : "#b3b3b3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              {repeat === 2 && <span style={{ position: "absolute", top: -2, right: -2, color: "#1DB954", fontSize: 9, fontWeight: 800 }}>1</span>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PLAYLIST VIEW
  // ============================================================
  if (view === "playlist") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#121212", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <YoutubeAudio />
        {/* Header gradient */}
        <div style={{
          background: "linear-gradient(180deg, #1B5E20 0%, #121212 100%)",
          padding: "12px 16px 20px",
          flexShrink: 0,
        }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 12, display: "flex" }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
            <div style={{
              width: 100, height: 100, borderRadius: 4,
              background: activePlaylistGradient,
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width={40} height={40} viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{activePlaylistName}</div>
              <div style={{ color: "#b3b3b3", fontSize: 13, marginTop: 4 }}>{activePlaylistDesc}</div>
              <div style={{ color: "#b3b3b3", fontSize: 12, marginTop: 4 }}>Carlos Silva - {tracks.length} musicas</div>
            </div>
          </div>
        </div>

        {/* Action row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 16px", flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 20 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="#1DB954" stroke="#1DB954" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2">
                <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setShuffle(!shuffle)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={shuffle ? "#1DB954" : "#b3b3b3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
              </svg>
            </button>
            <button onClick={() => { if (tracks.length > 0) { playTrack(tracks[0]); setView("player"); } }} style={{
              width: 48, height: 48, borderRadius: "50%", background: "#1DB954",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="#000">
                <polygon points="6 3 20 12 6 21 6 3"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Track list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tracks.map((track, i) => (
            <button
              key={track.id}
              onClick={() => { playTrack(track); setView("player"); }}
              style={{
                display: "flex", alignItems: "center", width: "100%",
                padding: "10px 16px", gap: 12,
                background: "none", border: "none", cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{ color: "#b3b3b3", fontSize: 14, width: 20, textAlign: "right" }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: currentTrack.name === track.name ? "#1DB954" : "#fff", fontSize: 15, fontWeight: 500 }}>{track.name}</div>
                <div style={{ color: "#b3b3b3", fontSize: 13, marginTop: 1 }}>{track.artist}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleTrackLike(track.id); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill={track.liked ? "#1DB954" : "none"} stroke={track.liked ? "#1DB954" : "#b3b3b3"} strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </button>
          ))}
        </div>

        {/* Mini player */}
        <MiniPlayer currentTrack={currentTrack} isPlaying={isPlaying} onToggle={togglePlay} onTap={() => setView("player")} />

        {/* Bottom nav */}
        <SpotifyNav active="home" onNavigate={setView} />
      </div>
    );
  }

  // ============================================================
  // SEARCH VIEW
  // ============================================================
  if (view === "search") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#121212", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <YoutubeAudio />
        <div style={{ padding: "16px 16px 8px", flexShrink: 0 }}>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Buscar</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#fff", borderRadius: 8, padding: "10px 12px",
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(searchQuery); }}
              placeholder="O que voce quer ouvir?"
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#000", fontSize: 15, fontWeight: 500,
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Explorar tudo</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {FALLBACK_SEARCH_CATEGORIES.map((cat) => (
              <div key={cat.name} onClick={() => handleSearch(cat.name)} style={{
                height: 90, borderRadius: 8, background: cat.color,
                padding: 12, position: "relative", overflow: "hidden", cursor: "pointer",
              }}>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
        <MiniPlayer currentTrack={currentTrack} isPlaying={isPlaying} onToggle={togglePlay} onTap={() => setView("player")} />
        <SpotifyNav active="search" onNavigate={setView} />
      </div>
    );
  }

  // ============================================================
  // LIBRARY VIEW
  // ============================================================
  if (view === "library") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#121212", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <YoutubeAudio />
        <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "#405DE6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff",
              }}>C</div>
              <span style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>Sua Biblioteca</span>
            </div>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 12 }}>
            {["Playlists", "Artistas", "Albums"].map((filter) => (
              <button
                key={filter}
                onClick={() => setLibraryFilter(filter)}
                style={{
                  padding: "6px 16px", borderRadius: 20,
                  background: libraryFilter === filter ? "#fff" : "transparent",
                  border: "1px solid " + (libraryFilter === filter ? "#fff" : "#b3b3b3"),
                  color: libraryFilter === filter ? "#000" : "#fff",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {libraryItems.filter(item =>
            libraryFilter === "Playlists" ? item.type === "Playlist" :
            libraryFilter === "Artistas" ? item.type === "Artista" :
            true
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => loadPlaylist(item)}
              style={{
                display: "flex", alignItems: "center", width: "100%",
                padding: "8px 16px", gap: 12,
                background: "none", border: "none", cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: item.type === "Artista" ? "50%" : 4,
                background: item.gradient, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.type === "Playlist" && (
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                )}
                {item.type === "Artista" && (
                  <span style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{item.name.charAt(0)}</span>
                )}
                {item.type === "Podcast" && (
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  </svg>
                )}
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>{item.name}</div>
                <div style={{ color: "#b3b3b3", fontSize: 13, marginTop: 2 }}>
                  {item.type}{item.count > 0 ? ` - ${item.count} ${item.type === "Playlist" ? "musicas" : "episodios"}` : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
        <MiniPlayer currentTrack={currentTrack} isPlaying={isPlaying} onToggle={togglePlay} onTap={() => setView("player")} />
        <SpotifyNav active="library" onNavigate={setView} />
      </div>
    );
  }

  // ============================================================
  // HOME VIEW (default)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#121212", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <YoutubeAudio />
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", flexShrink: 0,
        background: "linear-gradient(180deg, rgba(27,94,32,0.4) 0%, #121212 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#405DE6",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>C</div>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{greeting}</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
      </div>

      {/* Scrollable */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Quick access grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, padding: "8px 16px 16px",
        }}>
          {quickAccess.map((item) => (
            <button
              key={item.id}
              onClick={() => loadPlaylist(item)}
              style={{
                display: "flex", alignItems: "center", gap: 0,
                background: "#2A2A2A", borderRadius: 4, overflow: "hidden",
                height: 52, border: "none", cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{
                width: 52, height: 52, background: item.color, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, padding: "0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.name}
              </span>
            </button>
          ))}
        </div>

        {/* Made for you */}
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Feito para voce</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => loadPlaylist(pl)}
                style={{
                  width: 140, flexShrink: 0, background: "none", border: "none",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{
                  width: 140, height: 140, borderRadius: 8,
                  background: pl.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 8,
                }}>
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{pl.name}</div>
                <div style={{ color: "#b3b3b3", fontSize: 12, lineHeight: 1.3 }}>{pl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recently played section */}
        <div style={{ padding: "0 16px 100px" }}>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Tocados recentemente</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {libraryItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => loadPlaylist(item)}
                style={{
                  width: 140, flexShrink: 0, background: "none", border: "none",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{
                  width: 140, height: 140, borderRadius: item.type === "Artista" ? "50%" : 8,
                  background: item.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 8,
                }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 32, fontWeight: 700 }}>{item.name.charAt(0)}</span>
                </div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                <div style={{ color: "#b3b3b3", fontSize: 12 }}>{item.type}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mini Player */}
      <MiniPlayer currentTrack={currentTrack} isPlaying={isPlaying} onToggle={togglePlay} onTap={() => setView("player")} />

      {/* Bottom Nav */}
      <SpotifyNav active="home" onNavigate={setView} />
    </div>
  );
}

// ---------- Mini Player ----------
function MiniPlayer({ currentTrack, isPlaying, onToggle, onTap }) {
  return (
    <div
      onClick={onTap}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        margin: "0 8px", padding: "6px 8px",
        background: "#2A2A2A", borderRadius: 8,
        cursor: "pointer", flexShrink: 0,
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 4,
        background: currentTrack.gradient || "linear-gradient(135deg, #1B5E20, #4CAF50)",
        flexShrink: 0, overflow: "hidden",
      }}>
        {currentTrack.youtube_id && (
          <img
            src={`https://img.youtube.com/vi/${currentTrack.youtube_id}/default.jpg`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt=""
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {currentTrack.name}
        </div>
        <div style={{ color: "#b3b3b3", fontSize: 12 }}>{currentTrack.artist}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
        {isPlaying ? (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="#fff">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
        ) : (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="#fff">
            <polygon points="6 3 20 12 6 21 6 3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

// ---------- Spotify Bottom Navigation ----------
function SpotifyNav({ active, onNavigate }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "6px 0 8px", background: "rgba(18,18,18,0.95)",
      borderTop: "1px solid #282828", flexShrink: 0,
    }}>
      {[
        { id: "home", label: "Inicio", icon: (a) => (
          <svg width={24} height={24} viewBox="0 0 24 24" fill={a ? "#fff" : "none"} stroke="#fff" strokeWidth={a ? 0 : 1.5}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
        )},
        { id: "search", label: "Buscar", icon: (a) => (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={a ? 2.5 : 1.5}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        )},
        { id: "library", label: "Biblioteca", icon: (a) => (
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={a ? 2.5 : 1.5}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        )},
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onNavigate(tab.id)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer", padding: 4,
          }}
        >
          {tab.icon(active === tab.id)}
          <span style={{ color: active === tab.id ? "#fff" : "#b3b3b3", fontSize: 10, fontWeight: active === tab.id ? 700 : 400 }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

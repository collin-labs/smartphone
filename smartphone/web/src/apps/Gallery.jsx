import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Gallery App — Pixel-perfect 2025/2026 dark mode replica
// Telas: grid | viewer | albums
// Handlers: gallery_init, gallery_delete, gallery_capture
// ============================================================

const PHOTOS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  gradient: [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    "linear-gradient(135deg, #ffecd2, #fcb69f)",
    "linear-gradient(135deg, #ff9a9e, #fecfef)",
    "linear-gradient(135deg, #2af598, #009efd)",
    "linear-gradient(135deg, #c471f5, #fa71cd)",
    "linear-gradient(135deg, #48c6ef, #6f86d6)",
    "linear-gradient(135deg, #f6d365, #fda085)",
  ][i % 12],
  date: `${(i % 28) + 1}/0${(i % 3) + 1}/2026`,
  time: `${(10 + i % 14).toString().padStart(2, "0")}:${(i * 7 % 60).toString().padStart(2, "0")}`,
  isFavorite: i % 5 === 0,
}));

const ALBUMS = [
  { id: 1, name: "Camera", count: 24, gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
  { id: 2, name: "Screenshots", count: 12, gradient: "linear-gradient(135deg, #4facfe, #00f2fe)" },
  { id: 3, name: "WhatsApp", count: 45, gradient: "linear-gradient(135deg, #43e97b, #38f9d7)" },
  { id: 4, name: "Instagram", count: 8, gradient: "linear-gradient(135deg, #f093fb, #f5576c)" },
  { id: 5, name: "Downloads", count: 16, gradient: "linear-gradient(135deg, #fda085, #f6d365)" },
  { id: 6, name: "Favoritos", count: 5, gradient: "linear-gradient(135deg, #fa709a, #fee140)" },
];

export default function GalleryApp({ onNavigate }) {
  const [view, setView] = useState("grid");
  const [selectedPhoto, setSelectedPhoto] = useState(PHOTOS[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tab, setTab] = useState("fotos");
  const [photos, setPhotos] = useState(PHOTOS);

  // ── gallery_init ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("gallery_init");
      if (res?.photos?.length) {
        setPhotos(res.photos.map((p, i) => ({
          id: p.id || i + 1,
          gradient: PHOTOS[i % PHOTOS.length]?.gradient || "linear-gradient(135deg, #667eea, #764ba2)",
          date: p.date || "", time: p.time || "", isFavorite: !!p.isFavorite,
          url: p.url || null,
        })));
      }
    })();
  }, []);

  const openViewer = useCallback((photo, index) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
    setView("viewer");
  }, []);

  const navigatePhoto = useCallback((dir) => {
    const newIndex = selectedIndex + dir;
    if (newIndex >= 0 && newIndex < photos.length) {
      setSelectedIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  }, [selectedIndex, photos]);

  // ── gallery_delete ──
  const deletePhoto = useCallback(async () => {
    await fetchBackend("gallery_delete", { id: selectedPhoto.id });
    setPhotos((prev) => prev.filter((p) => p.id !== selectedPhoto.id));
    setView("grid");
  }, [selectedPhoto]);

  // ── gallery_capture ──
  const capturePhoto = useCallback(async () => {
    const res = await fetchBackend("gallery_capture");
    if (res?.photo) {
      setPhotos((prev) => [res.photo, ...prev]);
    }
  }, []);

  // ============================================================
  // VIEWER VIEW
  // ============================================================
  if (view === "viewer") {
    return (
      <div style={{
        width: "100%", height: "100%", background: "#000",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", flexShrink: 0,
        }}>
          <button onClick={() => setView("grid")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{selectedPhoto.date}</div>
            <div style={{ color: "#888", fontSize: 11 }}>{selectedPhoto.time}</div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>

        {/* Image */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* Prev / Next tap zones */}
          <div onClick={() => navigatePhoto(-1)} style={{
            position: "absolute", left: 0, top: 0, width: "30%", height: "100%", zIndex: 5, cursor: "pointer",
          }} />
          <div onClick={() => navigatePhoto(1)} style={{
            position: "absolute", right: 0, top: 0, width: "30%", height: "100%", zIndex: 5, cursor: "pointer",
          }} />
          <div style={{
            width: "100%", height: "100%",
            background: selectedPhoto.gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          {/* Counter */}
          <div style={{
            position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.5)", fontSize: 12,
          }}>
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{
          display: "flex", justifyContent: "space-around", alignItems: "center",
          padding: "14px 24px", borderTop: "1px solid #222", flexShrink: 0,
        }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span style={{ color: "#fff", fontSize: 10 }}>Enviar</span>
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill={selectedPhoto.isFavorite ? "#FF4757" : "none"} stroke={selectedPhoto.isFavorite ? "#FF4757" : "#fff"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <span style={{ color: "#fff", fontSize: 10 }}>Favorito</span>
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span style={{ color: "#fff", fontSize: 10 }}>Editar</span>
          </button>
          <button onClick={deletePhoto} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            <span style={{ color: "#FF4444", fontSize: 10 }}>Apagar</span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // GRID / ALBUMS VIEW (default)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", flexShrink: 0,
      }}>
        <button onClick={() => onNavigate?.("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>Galeria</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #222", flexShrink: 0 }}>
        {["fotos", "albums"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer",
            color: tab === t ? "#fff" : "#666",
            fontSize: 14, fontWeight: 600, textTransform: "capitalize",
            borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent",
          }}>
            {t === "fotos" ? "Fotos" : "Albums"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "fotos" ? (
          <>
            {/* Date header */}
            <div style={{ padding: "12px 16px 8px", color: "#888", fontSize: 13, fontWeight: 600 }}>
              Janeiro 2026
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, padding: "0 2px" }}>
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => openViewer(photo, i)}
                  style={{
                    aspectRatio: "1/1",
                    background: photo.gradient,
                    border: "none", cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {photo.isFavorite && (
                    <div style={{ position: "absolute", top: 4, right: 4 }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="#fff" stroke="none">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {ALBUMS.map((album) => (
              <button key={album.id} onClick={() => setTab("fotos")} style={{
                background: "none", border: "none", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{
                  aspectRatio: "1/1", borderRadius: 12, overflow: "hidden",
                  background: album.gradient, marginBottom: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{album.name}</div>
                <div style={{ color: "#888", fontSize: 11 }}>{album.count} itens</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "10px 0 8px", background: "#111",
        borderTop: "1px solid #222", flexShrink: 0,
      }}>
        <button onClick={() => setTab("fotos")} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "none", border: "none", cursor: "pointer",
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill={tab === "fotos" ? "#fff" : "none"} stroke={tab === "fotos" ? "#fff" : "#666"} strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <span style={{ color: tab === "fotos" ? "#fff" : "#666", fontSize: 10, fontWeight: 600 }}>Fotos</span>
        </button>
        <button onClick={() => setTab("albums")} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "none", border: "none", cursor: "pointer",
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={tab === "albums" ? "#fff" : "#666"} strokeWidth="2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
          <span style={{ color: tab === "albums" ? "#fff" : "#666", fontSize: 10, fontWeight: 600 }}>Albums</span>
        </button>
        <button onClick={() => { capturePhoto(); onNavigate?.("camera"); }} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "none", border: "none", cursor: "pointer",
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
          </svg>
          <span style={{ color: "#666", fontSize: 10, fontWeight: 600 }}>Camera</span>
        </button>
      </div>
    </div>
  );
}

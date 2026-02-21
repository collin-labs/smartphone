import React, { useState, useEffect, useCallback } from "react";

// ============================================================
// Camera App — Pixel-perfect 2025/2026 dark mode replica
// Telas: viewfinder | preview
// Sem handlers (app nativo — screenshot-basic)
// ============================================================

const MODES = ["Foto", "Video", "Selfie", "Retrato", "Noturno"];

export default function CameraApp({ onNavigate }) {
  const [view, setView] = useState("viewfinder");
  const [mode, setMode] = useState("Foto");
  const [flash, setFlash] = useState("off");
  const [timer, setTimer] = useState(0);
  const [gridOn, setGridOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [shutterAnim, setShutterAnim] = useState(false);
  const [isFront, setIsFront] = useState(false);

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    const iv = setInterval(() => setRecordTime((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [isRecording]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          triggerShutter();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [countdown]);

  const triggerShutter = useCallback(() => {
    setShutterAnim(true);
    setTimeout(() => {
      setShutterAnim(false);
      setView("preview");
    }, 150);
  }, []);

  const handleShutter = useCallback(() => {
    if (mode === "Video") {
      if (isRecording) {
        setIsRecording(false);
        setRecordTime(0);
        setView("preview");
      } else {
        setIsRecording(true);
      }
      return;
    }
    if (timer > 0) {
      setCountdown(timer);
    } else {
      triggerShutter();
    }
  }, [mode, isRecording, timer, triggerShutter]);

  const cycleFlash = useCallback(() => {
    setFlash((f) => f === "off" ? "on" : f === "on" ? "auto" : "off");
  }, []);

  const cycleTimer = useCallback(() => {
    setTimer((t) => t === 0 ? 3 : t === 3 ? 10 : 0);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ============================================================
  // PREVIEW VIEW
  // ============================================================
  if (view === "preview") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", flexShrink: 0,
        }}>
          <button onClick={() => setView("viewfinder")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Preview</span>
          <div style={{ width: 22 }} />
        </div>
        {/* Image preview */}
        <div style={{
          flex: 1, margin: "0 16px",
          borderRadius: 12, overflow: "hidden",
          background: "linear-gradient(135deg, #1a2a3a 0%, #2d1b3d 50%, #1a3a2a 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.4)", fontSize: 12,
          }}>
            {mode === "Video" ? "Video capturado" : "Foto capturada"}
          </div>
        </div>
        {/* Bottom actions */}
        <div style={{
          display: "flex", justifyContent: "space-around", alignItems: "center",
          padding: "20px 24px", flexShrink: 0,
        }}>
          <button onClick={() => setView("viewfinder")} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer",
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            <span style={{ color: "#FF4444", fontSize: 10 }}>Descartar</span>
          </button>
          <button style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer",
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            <span style={{ color: "#fff", fontSize: 10 }}>Salvar</span>
          </button>
          <button style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer",
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span style={{ color: "#fff", fontSize: 10 }}>Enviar</span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEWFINDER VIEW (default)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Shutter flash */}
      {shutterAnim && (
        <div style={{
          position: "absolute", inset: 0, background: "#fff", zIndex: 100,
          opacity: 0.8, pointerEvents: "none",
        }} />
      )}

      {/* Countdown overlay */}
      {countdown > 0 && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 90,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)",
        }}>
          <span style={{ color: "#fff", fontSize: 72, fontWeight: 800 }}>{countdown}</span>
        </div>
      )}

      {/* Top controls */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", flexShrink: 0, zIndex: 10,
      }}>
        <button onClick={() => onNavigate?.("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {/* Flash */}
          <button onClick={cycleFlash} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", position: "relative" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill={flash === "on" ? "#FFD600" : "none"} stroke={flash === "off" ? "#666" : "#FFD600"} strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            {flash === "auto" && (
              <span style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", color: "#FFD600", fontSize: 8, fontWeight: 700 }}>A</span>
            )}
          </button>
          {/* Timer */}
          <button onClick={cycleTimer} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", position: "relative" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={timer > 0 ? "#FFD600" : "#666"} strokeWidth="2">
              <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3l2 2"/><path d="M19 3l-2 2"/><line x1="12" y1="1" x2="12" y2="3"/>
            </svg>
            {timer > 0 && (
              <span style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", color: "#FFD600", fontSize: 8, fontWeight: 700 }}>{timer}s</span>
            )}
          </button>
          {/* Grid */}
          <button onClick={() => setGridOn(!gridOn)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={gridOn ? "#FFD600" : "#666"} strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
          </button>
        </div>
        {/* Settings */}
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Viewfinder */}
      <div style={{
        flex: 1, margin: "0 2px", borderRadius: 16, overflow: "hidden",
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)",
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Grid lines */}
        {gridOn && (
          <>
            <div style={{ position: "absolute", top: "33.3%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ position: "absolute", top: "66.6%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ position: "absolute", left: "33.3%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ position: "absolute", left: "66.6%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.15)" }} />
          </>
        )}
        {/* Center crosshair */}
        <div style={{
          width: 60, height: 60, border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 4, position: "relative",
        }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div style={{
            position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(0,0,0,0.6)", padding: "4px 12px", borderRadius: 12,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF0000" }} />
            <span style={{ color: "#fff", fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>{formatTime(recordTime)}</span>
          </div>
        )}

        {/* Camera mode info */}
        {isFront && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            padding: "4px 8px", borderRadius: 8,
            background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.6)",
            fontSize: 10, fontWeight: 600,
          }}>
            FRONTAL
          </div>
        )}
      </div>

      {/* Mode selector */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 4,
        padding: "12px 16px 4px", flexShrink: 0,
      }}>
        {MODES.map((m) => (
          <button key={m} onClick={() => { setMode(m); if (m === "Selfie") setIsFront(true); else setIsFront(false); }} style={{
            padding: "4px 12px", borderRadius: 14,
            background: mode === m ? "rgba(255,255,255,0.15)" : "transparent",
            border: "none", cursor: "pointer",
            color: mode === m ? "#FFD600" : "#888",
            fontSize: 12, fontWeight: 600,
          }}>
            {m}
          </button>
        ))}
      </div>

      {/* Bottom controls */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "12px 32px 16px", flexShrink: 0,
      }}>
        {/* Gallery thumbnail */}
        <button onClick={() => onNavigate?.("gallery")} style={{
          width: 40, height: 40, borderRadius: 8,
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          border: "2px solid #333", cursor: "pointer",
        }} />

        {/* Shutter button */}
        <button onClick={handleShutter} style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "transparent",
          border: mode === "Video"
            ? (isRecording ? "4px solid #FF0000" : "4px solid #FF0000")
            : "4px solid #fff",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 0,
        }}>
          <div style={{
            width: mode === "Video" ? (isRecording ? 24 : 52) : 56,
            height: mode === "Video" ? (isRecording ? 24 : 52) : 56,
            borderRadius: mode === "Video" ? (isRecording ? 4 : "50%") : "50%",
            background: mode === "Video" ? "#FF0000" : "#fff",
            transition: "all 0.2s",
          }} />
        </button>

        {/* Flip camera */}
        <button onClick={() => setIsFront(!isFront)} style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M20 16v4H4v-4"/><polyline points="14 12 20 12 20 6"/><path d="M4 8v-4h16v4"/><polyline points="10 12 4 12 4 18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

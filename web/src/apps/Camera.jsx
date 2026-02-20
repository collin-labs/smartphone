import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';

const C = {
  bg:'#000', surface:'#1C1C1E', elevated:'#2C2C2E',
  text:'#fff', textSec:'#8E8E93', accent:'#FFD60A',
  red:'#FF453A', green:'#30D158', blue:'#0A84FF',
};
const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

export default function Camera({ onNavigate }) {
  const [mode, setMode] = useState('photo'); // photo, video, selfie
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [lastPhoto, setLastPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [gallery, setGallery] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);

  // Load last photos
  useEffect(() => {
    fetchBackend('gallery_init').then(r => {
      if (r?.photos?.length > 0) {
        setGallery(r.photos.slice(0, 4));
        setLastPhoto(r.photos[0]);
      }
    });
  }, []);

  // Listen for screenshot result from client.lua
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'screenshot:result') {
        const url = e.data.url || '';
        setCapturing(false);
        if (url) {
          setPreview(url);
          setLastPhoto({ url });
          // Save to gallery
          fetchBackend('gallery_capture', { url, caption: 'Foto' }).then(r => {
            if (r?.ok && r?.photo) setGallery(p => [r.photo, ...p].slice(0, 4));
          });
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Recording timer
  useEffect(() => {
    if (!recording) { setRecTime(0); return; }
    const iv = setInterval(() => setRecTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [recording]);

  const takePhoto = async () => {
    setCapturing(true);
    fetchClient('playSound', { sound: 'camera' });

    // Flash effect
    if (flash) {
      const flashEl = document.getElementById('camera-flash');
      if (flashEl) { flashEl.style.opacity = '1'; setTimeout(() => { flashEl.style.opacity = '0'; }, 150); }
    }

    // Request screenshot from client.lua (GTA)
    const r = await fetchClient('takeScreenshot');
    // If not in GTA (dev mode), simulate
    if (!r?.ok) {
      setTimeout(() => {
        setCapturing(false);
        const fakeUrl = '';
        setPreview(fakeUrl);
        fetchBackend('gallery_capture', { url: fakeUrl, caption: 'Foto' }).then(r => {
          if (r?.ok && r?.photo) { setLastPhoto(r.photo); setGallery(p => [r.photo, ...p].slice(0, 4)); }
        });
      }, 500);
    }
  };

  const timerShot = () => {
    setCountdown(3);
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(iv); takePhoto(); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const fmtRecTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  // ===== PREVIEW =====
  if (preview !== null) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#000' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px' }}>
        <button onClick={() => setPreview(null)} style={{...B, color:C.text, fontSize:15, fontWeight:600}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ color:C.text, fontSize:15, fontWeight:600 }}>Foto</span>
        <div style={{ width:24 }} />
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:8 }}>
        {preview ? (
          <img src={preview} style={{ maxWidth:'100%', maxHeight:'100%', borderRadius:8 }} draggable={false} />
        ) : (
          <div style={{ width:'100%', height:'100%', maxHeight:400, borderRadius:12, background:'linear-gradient(135deg, #1a3a5c, #5c1a3a)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:64 }}>📸</span>
          </div>
        )}
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:24, padding:'16px 16px 24px' }}>
        <button onClick={() => setPreview(null)} style={{
          ...B, flexDirection:'column', gap:4,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          <span style={{ color:C.textSec, fontSize:11 }}>Nova foto</span>
        </button>
        <button onClick={() => { setPreview(null); onNavigate?.('gallery'); }} style={{
          ...B, flexDirection:'column', gap:4,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span style={{ color:C.textSec, fontSize:11 }}>Galeria</span>
        </button>
        <button onClick={() => {
          // Share to WhatsApp
          setPreview(null);
          onNavigate?.('whatsapp');
        }} style={{
          ...B, flexDirection:'column', gap:4,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
          <span style={{ color:C.textSec, fontSize:11 }}>Enviar</span>
        </button>
      </div>
    </div>
  );

  // ===== CAMERA VIEWFINDER =====
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#000', position:'relative' }}>
      {/* Flash overlay */}
      <div id="camera-flash" style={{ position:'absolute', inset:0, background:'#fff', zIndex:10, opacity:0, transition:'opacity 0.15s', pointerEvents:'none' }} />

      {/* Countdown overlay */}
      {countdown > 0 && (
        <div style={{ position:'absolute', inset:0, zIndex:9, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)' }}>
          <span style={{ color:'#fff', fontSize:80, fontWeight:700, textShadow:'0 4px 12px rgba(0,0,0,0.5)' }}>{countdown}</span>
        </div>
      )}

      {/* Top controls */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', zIndex:2 }}>
        <button onClick={() => onNavigate?.('home')} style={B}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div style={{ display:'flex', gap:20 }}>
          <button onClick={() => setFlash(!flash)} style={B}>
            {flash ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill={C.accent}><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M7 2v11h3v9l7-12h-4l4-8z"/><line x1="1" y1="1" x2="23" y2="23" stroke="#fff" strokeWidth="2"/></svg>
            )}
          </button>
          <button onClick={timerShot} style={B}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3l4 3M19 3l-4 3"/></svg>
          </button>
        </div>
      </div>

      {/* Viewfinder */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        {/* Grid lines */}
        <div style={{ position:'absolute', inset:20, border:'1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ position:'absolute', left:'33%', top:0, bottom:0, width:1, background:'rgba(255,255,255,0.1)' }} />
          <div style={{ position:'absolute', left:'66%', top:0, bottom:0, width:1, background:'rgba(255,255,255,0.1)' }} />
          <div style={{ position:'absolute', top:'33%', left:0, right:0, height:1, background:'rgba(255,255,255,0.1)' }} />
          <div style={{ position:'absolute', top:'66%', left:0, right:0, height:1, background:'rgba(255,255,255,0.1)' }} />
        </div>
        {/* Center text */}
        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:14, textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📷</div>
          {capturing ? 'Capturando...' : 'Enquadre e fotografe'}
        </div>

        {/* Recording indicator */}
        {recording && (
          <div style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:8, background:'rgba(0,0,0,0.6)', padding:'6px 14px', borderRadius:16 }}>
            <div style={{ width:8, height:8, borderRadius:4, background:C.red, animation:'blink 1s infinite' }} />
            <span style={{ color:'#fff', fontSize:14, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmtRecTime(recTime)}</span>
          </div>
        )}
      </div>

      {/* Mode selector */}
      <div style={{ display:'flex', justifyContent:'center', gap:20, padding:'8px 0' }}>
        {['photo','video','selfie'].map(m => (
          <button key={m} onClick={() => { setMode(m); if (m !== 'video') setRecording(false); }} style={{
            ...B, padding:'6px 16px',
          }}>
            <span style={{ color: mode === m ? C.accent : C.textSec, fontSize:13, fontWeight:600, textTransform:'uppercase' }}>
              {m === 'photo' ? 'Foto' : m === 'video' ? 'Vídeo' : 'Selfie'}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom controls */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 32px 24px' }}>
        {/* Gallery thumbnail */}
        <button onClick={() => onNavigate?.('gallery')} style={{
          ...B, width:44, height:44, borderRadius:8, overflow:'hidden',
          background: lastPhoto?.url ? 'transparent' : C.elevated,
          border:'2px solid rgba(255,255,255,0.3)',
        }}>
          {lastPhoto?.url ? (
            <img src={lastPhoto.url} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill={C.textSec}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21" fill="none" stroke={C.textSec} strokeWidth="2"/></svg>
          )}
        </button>

        {/* Shutter button */}
        {mode === 'video' ? (
          <button onClick={() => {
            if (recording) { setRecording(false); /* stop recording */ }
            else { setRecording(true); fetchClient('playSound', { sound: 'camera' }); }
          }} style={{
            ...B, width:72, height:72, borderRadius:36, border:'4px solid #fff', padding:4,
          }}>
            <div style={{
              width: recording ? 24 : 56, height: recording ? 24 : 56,
              borderRadius: recording ? 6 : 28, background:C.red,
              transition:'all 0.2s',
            }} />
          </button>
        ) : (
          <button onClick={takePhoto} disabled={capturing} style={{
            ...B, width:72, height:72, borderRadius:36,
            border:'4px solid #fff', background: capturing ? 'rgba(255,255,255,0.3)' : 'transparent',
            opacity: capturing ? 0.5 : 1,
          }}>
            <div style={{ width:56, height:56, borderRadius:28, background:'#fff' }} />
          </button>
        )}

        {/* Flip camera */}
        <button onClick={() => setMode(mode === 'selfie' ? 'photo' : 'selfie')} style={{...B, width:44, height:44}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 16v-4a8 8 0 00-16 0v4"/><polyline points="16 16 20 16 20 12"/><polyline points="8 16 4 16 4 12"/></svg>
        </button>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

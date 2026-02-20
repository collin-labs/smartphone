import { useState, useCallback } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';

const C = {
  bg:'rgba(30,30,30,0.85)', surface:'rgba(50,50,55,0.75)',
  text:'#fff', textSec:'#aaa', active:'#fff', inactive:'rgba(120,120,130,0.6)',
  blue:'#0A84FF', green:'#30D158', orange:'#FF9F0A', red:'#FF453A',
  purple:'#BF5AF2', teal:'#64D2FF',
};

export default function ControlCenter({ onClose }) {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [airplane, setAirplane] = useState(false);
  const [cellular, setCellular] = useState(true);
  const [flashlight, setFlashlight] = useState(false);
  const [dnd, setDnd] = useState(false);
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(60);

  const toggle = (setter, current) => setter(!current);

  const TileBtn = ({ icon, label, active, color, onPress }) => (
    <button onClick={onPress} style={{
      width:'100%', aspectRatio:'1', borderRadius:14,
      background: active ? color || C.blue : C.inactive,
      border:'none', cursor:'pointer', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:4,
      transition:'all 0.15s',
    }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <span style={{ fontSize:9, color: active ? '#000' : C.textSec, fontWeight:500 }}>{label}</span>
    </button>
  );

  const SliderControl = ({ icon, value, onChange, color }) => (
    <div style={{ background:C.surface, borderRadius:16, padding:'12px', display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <div style={{ flex:1, height:6, background:'rgba(255,255,255,0.15)', borderRadius:3, position:'relative', cursor:'pointer' }}
        onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100); onChange(Math.min(100, Math.max(0, pct))); }}>
        <div style={{ width:`${value}%`, height:'100%', background:color||C.text, borderRadius:3, transition:'width 0.1s' }}/>
      </div>
      <span style={{ color:C.textSec, fontSize:11, minWidth:28, textAlign:'right' }}>{value}%</span>
    </div>
  );

  return (
    <div onClick={onClose} style={{
      position:'absolute', top:0, left:0, right:0, bottom:0, zIndex:9998,
      background:'rgba(0,0,0,0.3)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      display:'flex', flexDirection:'column', justifyContent:'flex-start',
      animation:'slideDown 0.25s ease-out',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        margin:'8px', borderRadius:24, background:C.bg,
        backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
        padding:'16px', maxHeight:'85%', overflow:'auto',
      }}>
        {/* Top row: Connectivity */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
          <TileBtn icon={airplane?"✈️":"✈️"} label="Avião" active={airplane} color={C.orange} onPress={()=>{toggle(setAirplane,airplane); if(!airplane){setWifi(false);setCellular(false);}}} />
          <TileBtn icon="📶" label="Celular" active={cellular} color={C.green} onPress={()=>toggle(setCellular,cellular)} />
          <TileBtn icon="📡" label="Wi-Fi" active={wifi} color={C.blue} onPress={()=>toggle(setWifi,wifi)} />
          <TileBtn icon="🦷" label="Bluetooth" active={bluetooth} color={C.blue} onPress={()=>toggle(setBluetooth,bluetooth)} />
        </div>

        {/* Middle row: Utilities */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
          <TileBtn icon="🔦" label="Lanterna" active={flashlight} color={C.text}
            onPress={()=>{toggle(setFlashlight,flashlight); fetchClient('toggleFlashlight');}} />
          <TileBtn icon="🌙" label="Não Pertur." active={dnd} color={C.purple} onPress={()=>toggle(setDnd,dnd)} />
          <TileBtn icon="📷" label="Câmera" active={false} onPress={()=>{onClose(); /* navigate to gallery */}} />
          <TileBtn icon="⏱️" label="Timer" active={false} onPress={()=>{}} />
        </div>

        {/* Brightness */}
        <SliderControl icon="☀️" value={brightness} onChange={setBrightness} color={C.orange} />
        <div style={{ height:8 }}/>
        {/* Volume */}
        <SliderControl icon="🔊" value={volume} onChange={(v)=>{setVolume(v); fetchBackend('settings_save',{key:'volume',value:v});}} color={C.text} />

        {/* Bottom quick actions */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:12 }}>
          <button style={{ padding:'12px', borderRadius:14, background:C.surface, border:'none', cursor:'pointer', textAlign:'center' }}>
            <span style={{ fontSize:18 }}>🔒</span>
            <div style={{ color:C.textSec, fontSize:9, marginTop:2 }}>Bloquear</div>
          </button>
          <button style={{ padding:'12px', borderRadius:14, background:C.surface, border:'none', cursor:'pointer', textAlign:'center' }}>
            <span style={{ fontSize:18 }}>🔄</span>
            <div style={{ color:C.textSec, fontSize:9, marginTop:2 }}>Rotação</div>
          </button>
          <button onClick={()=>{fetchClient('takeScreenshot');}} style={{ padding:'12px', borderRadius:14, background:C.surface, border:'none', cursor:'pointer', textAlign:'center' }}>
            <span style={{ fontSize:18 }}>📸</span>
            <div style={{ color:C.textSec, fontSize:9, marginTop:2 }}>Screenshot</div>
          </button>
          <button style={{ padding:'12px', borderRadius:14, background:C.surface, border:'none', cursor:'pointer', textAlign:'center' }}>
            <span style={{ fontSize:18 }}>🔇</span>
            <div style={{ color:C.textSec, fontSize:9, marginTop:2 }}>Silencioso</div>
          </button>
        </div>

        {/* Drag indicator */}
        <div style={{ textAlign:'center', marginTop:12 }}>
          <div style={{ width:40, height:4, borderRadius:2, background:'rgba(255,255,255,0.2)', margin:'0 auto' }}/>
        </div>
      </div>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

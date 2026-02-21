import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// Uber real dark mode colors
const C = {
  bg:'#000000', surface:'#1C1C1E', elevated:'#2C2C2E',
  text:'#FFFFFF', textSec:'#A0A0A0', textTer:'#6B6B6B',
  sep:'#333333', green:'#276EF1', greenLight:'#4C8BF5',
  accent:'#276EF1', uber:'#FFFFFF',
  cardBg:'#1C1C1E', inputBg:'#2C2C2E',
  success:'#06C167', warning:'#FF9500', error:'#FF453A',
  starActive:'#FFB800', starInactive:'#333333',
};

const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

const Ic = {
  back: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textSec} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4-4"/></svg>,
  pin: <svg width="20" height="20" viewBox="0 0 24 24" fill={C.accent}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  dot: <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill={C.accent}/></svg>,
  car: <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
  comfort: <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill={C.textSec}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>,
  star: (filled) => <svg width="28" height="28" viewBox="0 0 24 24" fill={filled?C.starActive:C.starInactive}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  phone: <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  cancel: <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  steering: <svg width="24" height="24" viewBox="0 0 24 24" fill={C.success}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-2.49 1.14-4.71 2.93-6.17l-.02.17c0 .55.45 1 1 1h.27C7.42 8.63 7 10.27 7 12c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.73-.42-3.37-1.18-4.83h.27c.55 0 1-.45 1-1l-.02-.17C18.86 7.29 20 9.51 20 12c0 4.42-3.58 8-8 8z"/></svg>,
};

const RIDE_TYPES = [
  { id:'uberx', name:'UberX', desc:'Econômico', multiplier:1.0, icon:'🚗', eta:'3' },
  { id:'comfort', name:'Comfort', desc:'Mais espaço', multiplier:1.4, icon:'🚙', eta:'5' },
  { id:'black', name:'Black', desc:'Premium', multiplier:2.2, icon:'🖤', eta:'8' },
];

const fmtMoney = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

export default function Uber({ onNavigate }) {
  const [mode, setMode] = useState(null); // null=choose, 'passenger', 'driver'
  const [view, setView] = useState('home'); // home, search, confirm, waiting, riding, rating, driver_home, driver_ride
  const [destination, setDestination] = useState('');
  const [recentDests, setRecentDests] = useState([]);
  const [selectedType, setSelectedType] = useState('uberx');
  const [ride, setRide] = useState(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [driverOnline, setDriverOnline] = useState(false);
  const [pendingRides, setPendingRides] = useState([]);
  const [driverRide, setDriverRide] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const timerRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  // Load initial data
  useEffect(() => {
    fetchBackend('uber_init').then(r => {
      if (r?.mode) setMode(r.mode);
      if (r?.recentDests) setRecentDests(r.recentDests);
      if (r?.driverOnline) setDriverOnline(r.driverOnline);
      if (r?.activeRide) {
        setRide(r.activeRide);
        if (r.activeRide.status === 'accepted') { setView(r.mode === 'driver' ? 'driver_ride' : 'riding'); startTimer(); }
        else if (r.activeRide.status === 'waiting') setView('waiting');
      }
    });
  }, []);

  // Pusher events
  usePusherEvent('UBER_RIDE_REQUEST', useCallback((d) => {
    if (mode === 'driver' && driverOnline) setPendingRides(p => [...p, d]);
  }, [mode, driverOnline]));

  usePusherEvent('UBER_RIDE_ACCEPTED', useCallback((d) => {
    if (ride?.id === d.rideId || d.rideId) {
      setRide(prev => ({ ...prev, ...d, status: 'accepted' }));
      setView('riding');
      startTimer();
    }
  }, [ride]));

  usePusherEvent('UBER_RIDE_COMPLETED', useCallback((d) => {
    stopTimer();
    setRide(prev => ({ ...prev, ...d, status: 'completed' }));
    setView('rating');
  }, []));

  usePusherEvent('UBER_RIDE_CANCELLED', useCallback((d) => {
    stopTimer();
    setRide(null);
    setDriverRide(null);
    setView(mode === 'driver' ? 'driver_home' : 'home');
  }, [mode]));

  // Timer
  const startTimer = () => { setElapsed(0); timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000); };
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  useEffect(() => () => stopTimer(), []);

  const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  // Actions
  const requestRide = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    const r = await fetchBackend('uber_request', { destination, rideType: selectedType });
    setLoading(false);
    if (r?.ok) { setRide(r.ride); setView('waiting'); }
    if (r?.error) alert(r.error);
  };

  const cancelRide = async () => {
    if (!ride) return;
    await fetchBackend('uber_cancel', { rideId: ride.id });
    stopTimer(); setRide(null); setView(mode === 'driver' ? 'driver_home' : 'home');
  };

  const toggleDriver = async () => {
    const r = await fetchBackend('uber_driver_toggle');
    if (r?.ok) { setDriverOnline(r.online); if (r.online) setPendingRides([]); }
  };

  const acceptRide = async (rideData) => {
    const r = await fetchBackend('uber_accept', { rideId: rideData.id });
    if (r?.ok) {
      setDriverRide({ ...rideData, ...r.ride, status: 'accepted' });
      setPendingRides(p => p.filter(x => x.id !== rideData.id));
      setView('driver_ride');
      startTimer();
    }
  };

  const completeRide = async () => {
    const target = mode === 'driver' ? driverRide : ride;
    if (!target) return;
    const r = await fetchBackend('uber_complete', { rideId: target.id });
    if (r?.ok) {
      stopTimer();
      if (mode === 'driver') { setDriverRide(null); setView('driver_home'); }
      else { setRide(prev => ({ ...prev, ...r, status: 'completed' })); setView('rating'); }
    }
  };

  const submitRating = async () => {
    if (rating === 0) return;
    await fetchBackend('uber_rate', { rideId: ride.id, rating });
    setRide(null); setRating(0); setView('home');
  };

  const loadHistory = async () => {
    const r = await fetchBackend('uber_history');
    if (r?.rides) setHistory(r.rides);
    setShowHistory(true);
  };

  // ===== MODE SELECT =====
  if (!mode) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'20px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <span style={{ color:C.text, fontSize:28, fontWeight:700 }}>Uber</span>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 24px', gap:16 }}>
        <div style={{ color:C.text, fontSize:18, fontWeight:600, textAlign:'center', marginBottom:8 }}>Como deseja usar?</div>
        <button onClick={()=>{setMode('passenger');setView('home');fetchBackend('uber_set_mode',{mode:'passenger'});}}
          style={{ padding:'20px', borderRadius:12, border:'none', cursor:'pointer', background:C.surface, display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontSize:36 }}>🚗</span>
          <div style={{ textAlign:'left' }}>
            <div style={{ color:C.text, fontSize:17, fontWeight:600 }}>Passageiro</div>
            <div style={{ color:C.textSec, fontSize:14 }}>Solicitar corridas</div>
          </div>
        </button>
        <button onClick={()=>{setMode('driver');setView('driver_home');fetchBackend('uber_set_mode',{mode:'driver'});}}
          style={{ padding:'20px', borderRadius:12, border:'none', cursor:'pointer', background:C.surface, display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontSize:36 }}>🏎️</span>
          <div style={{ textAlign:'left' }}>
            <div style={{ color:C.text, fontSize:17, fontWeight:600 }}>Motorista</div>
            <div style={{ color:C.textSec, fontSize:14 }}>Aceitar corridas e ganhar</div>
          </div>
        </button>
      </div>
    </div>
  );

  // ===== RATING =====
  if (view === 'rating') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg, justifyContent:'center', alignItems:'center', padding:24 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
      <div style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:4 }}>Corrida finalizada!</div>
      {ride?.price && <div style={{ color:C.success, fontSize:24, fontWeight:700, marginBottom:20 }}>{fmtMoney(ride.price)}</div>}
      <div style={{ color:C.textSec, fontSize:16, marginBottom:20 }}>Como foi a viagem?</div>
      <div style={{ display:'flex', gap:8, marginBottom:32 }}>
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={()=>setRating(s)} style={B}>{Ic.star(s <= rating)}</button>
        ))}
      </div>
      <button onClick={submitRating} style={{
        width:'100%', padding:'16px', borderRadius:8, border:'none', cursor:'pointer',
        background:rating>0?C.accent:C.elevated, color:'#fff', fontSize:16, fontWeight:600,
        opacity:rating>0?1:0.5,
      }}>Enviar avaliação</button>
    </div>
  );

  // ===== HISTORY =====
  if (showHistory) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>setShowHistory(false)} style={B}>{Ic.back}</button>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Suas viagens</span>
      </div>
      <div style={{ flex:1, overflow:'auto' }}>
        {history.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:C.textSec }}>Nenhuma viagem ainda</div>
        ) : history.map(h => (
          <div key={h.id} style={{ padding:'14px 16px', borderBottom:`0.5px solid ${C.sep}`, display:'flex', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:8, background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {Ic.car}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{h.destination}</div>
              <div style={{ color:C.textSec, fontSize:13, marginTop:2 }}>{new Date(h.created_at).toLocaleDateString('pt-BR')} • {h.ride_type}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ color:C.text, fontSize:15, fontWeight:600 }}>{fmtMoney(h.price)}</div>
              {h.rating > 0 && <div style={{ color:C.starActive, fontSize:12 }}>★ {h.rating}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ===== DRIVER HOME =====
  if (mode === 'driver' && view === 'driver_home') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:C.text, fontSize:22, fontWeight:700 }}>Uber Driver</span>
        <button onClick={()=>{setMode(null);setView('home');}} style={{...B,color:C.textSec,fontSize:13}}>Trocar modo</button>
      </div>

      {/* Status */}
      <div style={{ padding:'0 16px 16px' }}>
        <button onClick={toggleDriver} style={{
          width:'100%', padding:'16px', borderRadius:12, border:'none', cursor:'pointer',
          background: driverOnline ? C.success : C.surface,
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        }}>
          {Ic.steering}
          <span style={{ color:'#fff', fontSize:16, fontWeight:600 }}>
            {driverOnline ? 'Online — Recebendo corridas' : 'Offline — Toque para ficar online'}
          </span>
        </button>
      </div>

      {/* Pending rides */}
      <div style={{ flex:1, overflow:'auto', padding:'0 16px' }}>
        <div style={{ color:C.textSec, fontSize:13, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>
          Corridas disponíveis
        </div>
        {!driverOnline ? (
          <div style={{ textAlign:'center', padding:30, color:C.textTer }}>Fique online para receber corridas</div>
        ) : pendingRides.length === 0 ? (
          <div style={{ textAlign:'center', padding:30, color:C.textTer }}>
            <div style={{ width:24,height:24,border:`2px solid ${C.sep}`,borderTopColor:C.success,borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px' }}/>
            Aguardando corridas...
          </div>
        ) : pendingRides.map(r => (
          <div key={r.id} style={{ background:C.surface, borderRadius:12, padding:16, marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              {Ic.pin}
              <span style={{ color:C.text, fontSize:15, fontWeight:500 }}>{r.destination}</span>
            </div>
            <div style={{ display:'flex', gap:12, marginBottom:12 }}>
              <span style={{ color:C.textSec, fontSize:13 }}>👤 {r.passenger_name}</span>
              <span style={{ color:C.success, fontSize:13, fontWeight:600 }}>{fmtMoney(r.estimated_price)}</span>
              <span style={{ color:C.textSec, fontSize:13 }}>{r.ride_type}</span>
            </div>
            <button onClick={()=>acceptRide(r)} style={{
              width:'100%', padding:'12px', borderRadius:8, border:'none', cursor:'pointer',
              background:C.success, color:'#fff', fontSize:15, fontWeight:600,
            }}>Aceitar corrida</button>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ===== DRIVER RIDING =====
  if (mode === 'driver' && view === 'driver_ride' && driverRide) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ color:C.text, fontSize:18, fontWeight:700 }}>Corrida em andamento</span>
      </div>

      {/* Map placeholder */}
      <div style={{ background:C.surface, height:180, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        <span style={{ color:C.textTer, fontSize:14 }}>📍 Navegue até o destino</span>
        <div style={{ position:'absolute', bottom:12, right:12, background:C.bg+'CC', borderRadius:8, padding:'6px 12px' }}>
          <span style={{ color:C.text, fontSize:16, fontFamily:'monospace', fontWeight:700 }}>{fmtTime(elapsed)}</span>
        </div>
      </div>

      <div style={{ flex:1, padding:16 }}>
        {/* Passenger info */}
        <div style={{ background:C.surface, borderRadius:12, padding:16, marginBottom:12 }}>
          <div style={{ color:C.textSec, fontSize:12, textTransform:'uppercase', marginBottom:6 }}>Passageiro</div>
          <div style={{ color:C.text, fontSize:16, fontWeight:600 }}>{driverRide.passenger_name}</div>
        </div>

        {/* Destination */}
        <div style={{ background:C.surface, borderRadius:12, padding:16, marginBottom:12 }}>
          <div style={{ color:C.textSec, fontSize:12, textTransform:'uppercase', marginBottom:6 }}>Destino</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {Ic.pin}
            <span style={{ color:C.text, fontSize:15 }}>{driverRide.destination}</span>
          </div>
        </div>

        {/* Price */}
        <div style={{ background:C.surface, borderRadius:12, padding:16, marginBottom:20 }}>
          <div style={{ color:C.textSec, fontSize:12, textTransform:'uppercase', marginBottom:6 }}>Valor estimado</div>
          <div style={{ color:C.success, fontSize:22, fontWeight:700 }}>{fmtMoney(driverRide.estimated_price)}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding:'12px 16px 16px', display:'flex', gap:8 }}>
        <button onClick={cancelRide} style={{
          flex:1, padding:'14px', borderRadius:8, border:'none', cursor:'pointer',
          background:C.error, color:'#fff', fontSize:15, fontWeight:600,
        }}>Cancelar</button>
        <button onClick={completeRide} style={{
          flex:2, padding:'14px', borderRadius:8, border:'none', cursor:'pointer',
          background:C.success, color:'#fff', fontSize:15, fontWeight:600,
        }}>Finalizar corrida</button>
      </div>
    </div>
  );

  // ===== PASSENGER: WAITING =====
  if (view === 'waiting') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:24 }}>
        <div style={{ width:40,height:40,border:`3px solid ${C.sep}`,borderTopColor:C.accent,borderRadius:'50%',animation:'spin 1s linear infinite',marginBottom:24 }}/>
        <div style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:8 }}>Procurando motorista...</div>
        <div style={{ color:C.textSec, fontSize:15, textAlign:'center', marginBottom:4 }}>{ride?.destination}</div>
        <div style={{ color:C.textSec, fontSize:14 }}>{RIDE_TYPES.find(t=>t.id===ride?.ride_type)?.name || 'UberX'}</div>
        {ride?.estimated_price && <div style={{ color:C.accent, fontSize:18, fontWeight:600, marginTop:12 }}>{fmtMoney(ride.estimated_price)}</div>}
      </div>
      <div style={{ padding:'12px 16px 16px' }}>
        <button onClick={cancelRide} style={{
          width:'100%', padding:'16px', borderRadius:8, border:'none', cursor:'pointer',
          background:C.elevated, color:C.error, fontSize:16, fontWeight:600,
        }}>Cancelar corrida</button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ===== PASSENGER: RIDING =====
  if (view === 'riding' && ride) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Map placeholder */}
      <div style={{ background:C.surface, height:200, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        <div style={{ textAlign:'center' }}>
          <span style={{ fontSize:40 }}>🚗</span>
          <div style={{ color:C.textSec, fontSize:13, marginTop:4 }}>Em viagem...</div>
        </div>
        <div style={{ position:'absolute', bottom:12, right:12, background:C.bg+'CC', borderRadius:8, padding:'6px 12px' }}>
          <span style={{ color:C.text, fontSize:16, fontFamily:'monospace', fontWeight:700 }}>{fmtTime(elapsed)}</span>
        </div>
      </div>

      <div style={{ flex:1, padding:16 }}>
        {/* Driver info */}
        <div style={{ display:'flex', alignItems:'center', gap:14, background:C.surface, borderRadius:12, padding:16, marginBottom:12 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:22 }}>👤</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ color:C.text, fontSize:16, fontWeight:600 }}>{ride.driver_name || 'Motorista'}</div>
            <div style={{ color:C.textSec, fontSize:13 }}>{ride.ride_type} • ★ {ride.driver_rating || '4.9'}</div>
          </div>
          <button onClick={()=>onNavigate?.('phone',{number:ride.driver_phone})} style={{
            ...B, width:42, height:42, borderRadius:'50%', background:C.accent,
          }}>{Ic.phone}</button>
        </div>

        {/* Destination */}
        <div style={{ display:'flex', alignItems:'center', gap:10, background:C.surface, borderRadius:12, padding:16 }}>
          {Ic.pin}
          <div>
            <div style={{ color:C.textSec, fontSize:12 }}>Destino</div>
            <div style={{ color:C.text, fontSize:15 }}>{ride.destination}</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'12px 16px 16px' }}>
        <button onClick={cancelRide} style={{
          width:'100%', padding:'14px', borderRadius:8, border:'none', cursor:'pointer',
          background:C.elevated, color:C.error, fontSize:15, fontWeight:600,
        }}>Cancelar corrida</button>
      </div>
    </div>
  );

  // ===== PASSENGER: SEARCH =====
  if (view === 'search') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={()=>setView('home')} style={B}>{Ic.back}</button>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:C.inputBg, borderRadius:8, padding:'10px 14px' }}>
            {Ic.search}
            <input type="text" placeholder="Para onde?" value={destination} onChange={e=>setDestination(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&destination.trim()&&setView('confirm')} autoFocus
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:16, fontFamily:'inherit' }} />
          </div>
        </div>
      </div>

      {/* Recent / saved */}
      <div style={{ flex:1, overflow:'auto', padding:'8px 16px' }}>
        <div style={{ color:C.textSec, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Recentes</div>
        {recentDests.length === 0 && (
          <div style={{ color:C.textTer, fontSize:14, padding:'12px 0' }}>Nenhum destino recente</div>
        )}
        {recentDests.map((d,i) => (
          <div key={i} onClick={()=>{setDestination(d);setView('confirm');}}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {Ic.clock}
            </div>
            <span style={{ color:C.text, fontSize:15 }}>{d}</span>
          </div>
        ))}

        {/* Quick locations */}
        <div style={{ color:C.textSec, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginTop:16, marginBottom:8 }}>Locais populares</div>
        {['Prefeitura','Hospital Central','Aeroporto','Praia','Delegacia','Garagem Central'].map(loc => (
          <div key={loc} onClick={()=>{setDestination(loc);setView('confirm');}}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {Ic.pin}
            </div>
            <span style={{ color:C.text, fontSize:15 }}>{loc}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ===== PASSENGER: CONFIRM =====
  if (view === 'confirm') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Map placeholder */}
      <div style={{ background:C.surface, height:180, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        <div style={{ textAlign:'center' }}>
          {Ic.pin}
          <div style={{ color:C.textSec, fontSize:13, marginTop:4 }}>{destination}</div>
        </div>
        <button onClick={()=>setView('search')} style={{
          position:'absolute', top:12, left:12, ...B, width:36, height:36, borderRadius:'50%', background:C.bg+'CC',
        }}>{Ic.back}</button>
      </div>

      {/* Ride types */}
      <div style={{ flex:1, overflow:'auto', padding:'16px' }}>
        <div style={{ color:C.text, fontSize:18, fontWeight:700, marginBottom:16 }}>Escolha uma viagem</div>
        {RIDE_TYPES.map(type => {
          const price = 150 * type.multiplier + Math.floor(Math.random() * 50);
          const isSelected = selectedType === type.id;
          return (
            <div key={type.id} onClick={()=>setSelectedType(type.id)}
              style={{
                display:'flex', alignItems:'center', gap:14, padding:'14px 16px', marginBottom:8,
                borderRadius:12, cursor:'pointer',
                background: isSelected ? C.surface : 'transparent',
                border: isSelected ? `2px solid ${C.accent}` : `1px solid ${C.sep}`,
              }}>
              <span style={{ fontSize:32 }}>{type.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ color:C.text, fontSize:16, fontWeight:600 }}>{type.name}</span>
                  <span style={{ color:C.textSec, fontSize:12 }}>• {type.eta} min</span>
                </div>
                <div style={{ color:C.textSec, fontSize:13 }}>{type.desc}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ color:C.text, fontSize:16, fontWeight:600 }}>{fmtMoney(price)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm button */}
      <div style={{ padding:'12px 16px 16px' }}>
        <button onClick={requestRide} disabled={loading} style={{
          width:'100%', padding:'16px', borderRadius:8, border:'none', cursor:'pointer',
          background:C.accent, color:'#fff', fontSize:16, fontWeight:600,
          opacity:loading?0.6:1,
        }}>{loading ? 'Solicitando...' : `Confirmar ${RIDE_TYPES.find(t=>t.id===selectedType)?.name}`}</button>
      </div>
    </div>
  );

  // ===== PASSENGER: HOME =====
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:C.text, fontSize:28, fontWeight:700 }}>Uber</span>
        <button onClick={()=>{setMode(null);setView('home');}} style={{...B,color:C.textSec,fontSize:13}}>Trocar modo</button>
      </div>

      {/* Map area */}
      <div style={{ background:C.surface, height:180, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 16px', borderRadius:16, overflow:'hidden' }}>
        <div style={{ textAlign:'center' }}>
          <span style={{ fontSize:40 }}>📍</span>
          <div style={{ color:C.textSec, fontSize:13, marginTop:4 }}>Sua localização</div>
        </div>
      </div>

      {/* Where to? */}
      <div style={{ padding:'16px' }}>
        <button onClick={()=>setView('search')} style={{
          width:'100%', display:'flex', alignItems:'center', gap:12,
          background:C.elevated, borderRadius:30, padding:'14px 20px',
          border:'none', cursor:'pointer',
        }}>
          <div style={{ width:6, height:6, borderRadius:3, background:C.accent }} />
          <span style={{ color:C.textSec, fontSize:17, flex:1, textAlign:'left' }}>Para onde?</span>
          <div style={{ display:'flex', alignItems:'center', gap:4, background:C.surface, borderRadius:16, padding:'6px 12px' }}>
            {Ic.clock}
            <span style={{ color:C.text, fontSize:13, fontWeight:500 }}>Agora</span>
          </div>
        </button>
      </div>

      {/* Suggestions / recent */}
      <div style={{ flex:1, overflow:'auto', padding:'0 16px' }}>
        {recentDests.length > 0 && (
          <>
            <div style={{ color:C.textSec, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Recentes</div>
            {recentDests.slice(0,3).map((d,i) => (
              <div key={i} onClick={()=>{setDestination(d);setView('confirm');}}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {Ic.clock}
                </div>
                <span style={{ color:C.text, fontSize:15 }}>{d}</span>
              </div>
            ))}
          </>
        )}

        {/* History button */}
        <button onClick={loadHistory} style={{
          width:'100%', marginTop:16, padding:'14px', borderRadius:12, border:'none', cursor:'pointer',
          background:C.surface, color:C.text, fontSize:15, fontWeight:500,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          {Ic.clock}
          <span>Histórico de viagens</span>
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

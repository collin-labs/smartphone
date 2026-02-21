import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Uber App — V0 100% pixel-perfect + ALL 9 backend handlers
// Handlers: uber_init, uber_request, uber_accept, uber_cancel,
//   uber_complete, uber_rate, uber_history, uber_driver_toggle, uber_set_mode
// Views: home | selectRide | tracking | history | rating
// ============================================================

const RIDE_OPTIONS = [
  { id: "uberx", name: "UberX", time: "4 min", price: "R$ 18,90", seats: 4, desc: "Economico" },
  { id: "comfort", name: "Comfort", time: "6 min", price: "R$ 24,50", seats: 4, desc: "Espaco extra e conforto" },
  { id: "black", name: "Black", time: "8 min", price: "R$ 42,00", seats: 4, desc: "Carros premium" },
  { id: "moto", name: "Moto", time: "3 min", price: "R$ 9,90", seats: 1, desc: "Rapido e economico" },
];
const FALLBACK_PLACES = [
  { id: 1, name: "Apartamento - Los Santos", address: "Rua Alta, 1247, Centro", icon: "home" },
  { id: 2, name: "Mecanica Santos", address: "Av. Santos Dumont, 456", icon: "work" },
  { id: 3, name: "Burger King LS", address: "Vinewood Blvd, 789", icon: "pin" },
  { id: 4, name: "Hospital Central", address: "Rua da Saude, 100", icon: "pin" },
];
const DRIVER = { name: "Roberto M.", rating: 4.92, car: "Honda Civic Preto", plate: "ABC-1D23", avatar: "R", trips: 2847 };

export default function Uber({ onNavigate }) {
  const [view, setView] = useState("home");
  const [destination, setDestination] = useState("");
  const [selectedRide, setSelectedRide] = useState("uberx");
  const [eta, setEta] = useState(4);
  const [isDriver, setIsDriver] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);
  const [ratingValue, setRatingValue] = useState(5);

  useEffect(() => {
    if (view !== "tracking") return;
    const interval = setInterval(() => { setEta((prev) => Math.max(0, prev - 1)); }, 3000);
    return () => clearInterval(interval);
  }, [view]);

  // ── uber_init ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("uber_init");
      if (res?.isDriver !== undefined) setIsDriver(res.isDriver);
    })();
  }, []);

  // ── uber_request ──
  const requestRide = useCallback(async () => {
    const ride = RIDE_OPTIONS.find(r => r.id === selectedRide);
    setEta(ride ? parseInt(ride.time) : 4);
    setView("tracking");
    await fetchBackend("uber_request", { type: selectedRide, destination });
  }, [selectedRide, destination]);

  // ── uber_accept (driver mode) ──
  const acceptRide = useCallback(async () => {
    await fetchBackend("uber_accept");
  }, []);

  // ── uber_cancel ──
  const cancelRide = useCallback(async () => {
    await fetchBackend("uber_cancel");
    setView("home");
  }, []);

  // ── uber_complete ──
  const completeRide = useCallback(async () => {
    await fetchBackend("uber_complete");
    setView("rating");
  }, []);

  // ── uber_rate ──
  const rateRide = useCallback(async () => {
    await fetchBackend("uber_rate", { rating: ratingValue });
    setView("home");
  }, [ratingValue]);

  // ── uber_history ──
  const loadHistory = useCallback(async () => {
    const res = await fetchBackend("uber_history");
    if (res?.rides?.length) setRideHistory(res.rides);
    setView("history");
  }, []);

  // ── uber_driver_toggle ──
  const toggleDriver = useCallback(async () => {
    const res = await fetchBackend("uber_driver_toggle");
    if (res?.isDriver !== undefined) setIsDriver(res.isDriver);
    else setIsDriver((prev) => !prev);
  }, []);

  // ── uber_set_mode ──
  const setMode = useCallback(async (mode) => {
    await fetchBackend("uber_set_mode", { mode });
  }, []);

  // ============================================================
  // RATING VIEW
  // ============================================================
  if (view === "rating") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#276EF1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 16 }}>{DRIVER.avatar}</div>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{DRIVER.name}</div>
        <div style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>{DRIVER.car}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[1,2,3,4,5].map((star) => (
            <button key={star} onClick={() => setRatingValue(star)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill={star <= ratingValue ? "#FFC107" : "#333"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
          ))}
        </div>
        <button onClick={rateRide} style={{ width: "100%", padding: "14px", borderRadius: 8, background: "#276EF1", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Avaliar</button>
      </div>
    );
  }

  // ============================================================
  // HISTORY VIEW
  // ============================================================
  if (view === "history") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #1A1A1A" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Historico</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {rideHistory.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "#666" }}>
              <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <div style={{ fontSize: 14, marginTop: 12 }}>Nenhuma viagem recente</div>
            </div>
          ) : rideHistory.map((ride, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #1A1A1A" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#276EF1" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{ride.destination || "Destino"}</div>
                <div style={{ color: "#888", fontSize: 12 }}>{ride.created_at || ride.date || ""}</div>
              </div>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>R$ {(ride.price || 0).toFixed(2).replace(".", ",")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // TRACKING VIEW (V0 100%)
  // ============================================================
  if (view === "tracking") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, background: "linear-gradient(180deg, #1a2a3a 0%, #0f1f2f 50%, #1a3a2a 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
            {Array.from({ length: 10 }, (_, i) => (<div key={`h${i}`} style={{ position: "absolute", top: `${i * 10}%`, left: 0, right: 0, height: 1, background: "#fff" }} />))}
            {Array.from({ length: 12 }, (_, i) => (<div key={`v${i}`} style={{ position: "absolute", left: `${i * 8.3}%`, top: 0, bottom: 0, width: 1, background: "#fff" }} />))}
          </div>
          <svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%"><path d="M 100 120 C 150 200 250 250 280 350" fill="none" stroke="#276EF1" strokeWidth="4" strokeDasharray="8 4" /></svg>
          <div style={{ position: "absolute", top: 100, left: 80, width: 40, height: 40, borderRadius: "50%", background: "#000", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="#276EF1"><path d="M19 17h2V7H3v10h2m2 0h10M7.5 17a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm9 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/></svg>
          </div>
          <div style={{ position: "absolute", bottom: 120, right: 60, width: 16, height: 16, borderRadius: 4, background: "#276EF1", border: "3px solid #fff" }} />
          <button onClick={cancelRide} style={{ position: "absolute", top: 12, left: 12, width: 40, height: 40, borderRadius: "50%", background: "#000", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ position: "absolute", top: 12, right: 12, padding: "8px 16px", borderRadius: 20, background: "#000" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{eta} min</span>
          </div>
        </div>
        <div style={{ background: "#1A1A1A", borderRadius: "20px 20px 0 0", padding: "16px", marginTop: -20, position: "relative", zIndex: 10 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#333", margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#276EF1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff" }}>{DRIVER.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{DRIVER.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="#FFC107"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{ color: "#FFC107", fontSize: 13, fontWeight: 600 }}>{DRIVER.rating}</span>
                <span style={{ color: "#666", fontSize: 12 }}>({DRIVER.trips} viagens)</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ width: 40, height: 40, borderRadius: "50%", background: "#222", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </button>
              <button style={{ width: 40, height: 40, borderRadius: "50%", background: "#222", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </button>
            </div>
          </div>
          <div style={{ padding: "12px", background: "#222", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#276EF1" strokeWidth="2"><path d="M19 17h2V7H3v10h2m2 0h10M7.5 17a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm9 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/></svg>
            <div>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{DRIVER.car}</div>
              <div style={{ color: "#666", fontSize: 13 }}>{DRIVER.plate}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // SELECT RIDE VIEW (V0 100%)
  // ============================================================
  if (view === "selectRide") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 200, background: "linear-gradient(180deg, #1a2a3a, #0f1f2f)", position: "relative" }}>
          <button onClick={() => setView("home")} style={{ position: "absolute", top: 12, left: 12, width: 40, height: 40, borderRadius: "50%", background: "#000", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%"><path d="M 60 40 Q 120 80 200 100 Q 280 120 320 160" fill="none" stroke="#276EF1" strokeWidth="3" /><circle cx="60" cy="40" r="6" fill="#276EF1" /><rect x="314" y="154" width="12" height="12" rx="2" fill="#276EF1" /></svg>
        </div>
        <div style={{ flex: 1, background: "#1A1A1A", borderRadius: "20px 20px 0 0", marginTop: -20, position: "relative", zIndex: 10, display: "flex", flexDirection: "column" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#333", margin: "12px auto 8px" }} />
          <div style={{ padding: "4px 16px 8px", color: "#fff", fontSize: 16, fontWeight: 700 }}>Escolha uma viagem</div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {RIDE_OPTIONS.map((ride) => (
              <button key={ride.id} onClick={() => setSelectedRide(ride.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", width: "100%", background: selectedRide === ride.id ? "#222" : "transparent", border: "none", cursor: "pointer", textAlign: "left", borderLeft: selectedRide === ride.id ? "3px solid #276EF1" : "3px solid transparent" }}>
                <div style={{ width: 56, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={40} height={24} viewBox="0 0 40 24" fill="none"><rect x="4" y="8" width="32" height="12" rx="4" fill={selectedRide === ride.id ? "#276EF1" : "#444"} /><circle cx="12" cy="20" r="3" fill={selectedRide === ride.id ? "#276EF1" : "#444"} stroke="#1A1A1A" strokeWidth="2" /><circle cx="28" cy="20" r="3" fill={selectedRide === ride.id ? "#276EF1" : "#444"} stroke="#1A1A1A" strokeWidth="2" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{ride.name}</span><span style={{ color: "#888", fontSize: 12 }}>{ride.time}</span></div>
                  <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{ride.desc}</div>
                </div>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{ride.price}</span>
              </button>
            ))}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #222" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 12px", background: "#222", borderRadius: 8 }}>
              <div style={{ width: 24, height: 16, borderRadius: 3, background: "#276EF1" }} />
              <span style={{ color: "#fff", fontSize: 13 }}>Visa ****8432</span>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ marginLeft: "auto" }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <button onClick={requestRide} style={{ width: "100%", padding: "14px 0", borderRadius: 8, background: "#276EF1", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Pedir {RIDE_OPTIONS.find(r => r.id === selectedRide)?.name}</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // HOME VIEW (default — V0 100%)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => onNavigate?.("home")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>Uber</span>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>C</div>
      </div>
      <div style={{ padding: "0 16px 16px" }}>
        <button onClick={() => { setDestination("Mecanica Santos"); setView("selectRide"); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", background: "#1A1A1A", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left" }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span style={{ color: "#888", fontSize: 16 }}>Para onde?</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#222", borderRadius: 20 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" fill="none" stroke="#000" strokeWidth="2"/></svg>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Agora</span>
          </div>
        </button>
      </div>
      <div style={{ display: "flex", gap: 12, padding: "0 16px 20px" }}>
        {[
          { label: "Viagem", icon: <svg width={28} height={28} viewBox="0 0 24 24" fill="#fff"><rect x="3" y="8" width="18" height="10" rx="3"/><circle cx="8" cy="18" r="2.5" fill="#000"/><circle cx="16" cy="18" r="2.5" fill="#000"/></svg> },
          { label: "Historico", icon: <svg width={28} height={28} viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" fill="none" stroke="#000" strokeWidth="2"/></svg>, action: loadHistory },
          { label: isDriver ? "Modo Passag." : "Modo Motorista", icon: <svg width={28} height={28} viewBox="0 0 24 24" fill="#fff"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4" fill="#000"/></svg>, action: toggleDriver },
        ].map((item) => (
          <div key={item.label} onClick={item.action} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", background: "#222", borderRadius: 12, cursor: "pointer" }}>
            {item.icon}
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, textAlign: "center" }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ margin: "0 16px 16px", padding: "16px", background: "linear-gradient(135deg, #222, #1A1A1A)", borderRadius: 12 }}>
        <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Vai a algum lugar?</div>
        <div style={{ color: "#888", fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>Economize ate 20% com UberX Share. Divida a viagem.</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {FALLBACK_PLACES.map((place) => (
          <button key={place.id} onClick={() => { setDestination(place.name); setView("selectRide"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #1A1A1A" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {place.icon === "home" ? (<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>)
                : place.icon === "work" ? (<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>)
                : (<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>)}
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{place.name}</div>
              <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{place.address}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

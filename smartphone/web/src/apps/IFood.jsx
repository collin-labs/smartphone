import React, { useState, useCallback, useEffect } from "react";
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// ============================================================
// iFood App — Visual V0 pixel-perfect + Backend FiveM
// Views: home | menu | tracking
// ============================================================

const fmtMoney = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

const GRADIENTS = [
  "linear-gradient(135deg, #FF8C00, #D2691E)",
  "linear-gradient(135deg, #CC0000, #8B0000)",
  "linear-gradient(135deg, #2E7D32, #1B5E20)",
  "linear-gradient(135deg, #4A148C, #7B1FA2)",
  "linear-gradient(135deg, #BF360C, #E64A19)",
  "linear-gradient(135deg, #F9A825, #F57F17)",
  "linear-gradient(135deg, #8B4513, #A0522D)",
  "linear-gradient(135deg, #DAA520, #B8860B)",
  "linear-gradient(135deg, #3E2723, #5D4037)",
  "linear-gradient(135deg, #B71C1C, #D32F2F)",
];
const getGrad = (id) => GRADIENTS[(id || 0) % GRADIENTS.length];

const CATEGORIES = [
  { id: "all", name: "Lanches", icon: "burger" },
  { id: "pizza", name: "Pizza", icon: "pizza" },
  { id: "japonesa", name: "Japonesa", icon: "sushi" },
  { id: "brasileira", name: "Brasileira", icon: "rice" },
  { id: "acai", name: "Acai", icon: "acai" },
  { id: "doces", name: "Doces", icon: "cake" },
  { id: "bebidas", name: "Bebidas", icon: "drink" },
  { id: "mercado", name: "Mercado", icon: "cart" },
];

// ===== SVG Icons (100% V0) =====
function CategoryIcon({ type }) {
  const icons = {
    burger: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M3 11h18M3 11a2 2 0 01-2-2 8 8 0 0116 0 2 2 0 01-2 2M3 11v1a2 2 0 002 2h14a2 2 0 002-2v-1M5 14v3a2 2 0 002 2h10a2 2 0 002-2v-3"/></svg>,
    pizza: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M12 2L2 22h20L12 2z"/><circle cx="10" cy="14" r="1" fill="#fff"/><circle cx="14" cy="14" r="1" fill="#fff"/><circle cx="12" cy="10" r="1" fill="#fff"/></svg>,
    sushi: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><ellipse cx="12" cy="14" rx="8" ry="4"/><ellipse cx="12" cy="10" rx="8" ry="4"/></svg>,
    rice: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M4 12a8 8 0 0116 0v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4z"/><path d="M4 12c0-1 2-3 8-3s8 2 8 3"/></svg>,
    acai: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M7 4h10l-2 16H9L7 4z"/><path d="M5 8h14"/></svg>,
    cake: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8"/><path d="M4 16h16"/><path d="M12 4v7"/><circle cx="12" cy="3" r="1" fill="#fff"/></svg>,
    drink: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M8 2h8l-1 18H9L8 2z"/><path d="M6 6h12"/></svg>,
    cart: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  };
  return <>{icons[type] || icons.burger}</>;
}

const ORDER_STEPS = [
  { s: "confirmed", label: "Pedido confirmado" },
  { s: "preparing", label: "Restaurante preparando" },
  { s: "delivering", label: "Saiu para entrega" },
  { s: "delivered", label: "Chegou!" },
];

const B = { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 };

// ===== MAIN COMPONENT =====
export default function IFood({ onNavigate }) {
  const [view, setView] = useState("home");
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderStep, setOrderStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // ===== Backend =====
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await fetchBackend('ifood_init');
      if (r?.restaurants) setRestaurants(r.restaurants);
      if (r?.orders) setOrders(r.orders);
      setLoading(false);
    };
    load();
  }, []);

  usePusherEvent('IFOOD_STATUS', useCallback((d) => {
    if (order?.id === d.orderId) {
      setOrder(prev => ({ ...prev, status: d.status }));
      const idx = ORDER_STEPS.findIndex(st => st.s === d.status);
      if (idx >= 0) setOrderStep(idx);
    }
  }, [order]));

  const addToCart = useCallback((item) => {
    const key = selectedRest ? `${selectedRest.id}_${item.id}` : item.id;
    setCart((prev) => {
      const existing = prev.find((c) => (c._key || c.id) === key);
      if (existing) return prev.map((c) => (c._key || c.id) === key ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, _key: key, restId: selectedRest?.id, qty: 1 }];
    });
  }, [selectedRest]);

  const removeFromCart = useCallback((key) => {
    setCart((prev) => {
      const existing = prev.find((c) => (c._key || c.id) === key);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter((c) => (c._key || c.id) !== key);
      return prev.map((c) => (c._key || c.id) === key ? { ...c, qty: c.qty - 1 } : c);
    });
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0) + (selectedRest?.fee || 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const r = await fetchBackend('ifood_order', {
      restaurant: selectedRest?.name, items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
      total: cartTotal, fee: selectedRest?.fee || 0,
    });
    if (r?.ok) {
      setOrder({ id: r.orderId, restaurant: selectedRest?.name, total: cartTotal, status: 'confirmed', items: [...cart] });
      setOrderStep(0);
      setCart([]);
      setView("tracking");
    }
    if (r?.error) alert(r.error);
  };

  // Animate tracking
  useEffect(() => {
    if (view !== "tracking" || !order) return;
    const timer = setTimeout(() => {
      if (orderStep < 3) setOrderStep((s) => s + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [view, orderStep, order]);

  const filteredRestaurants = restaurants.filter(r => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || (r.category || '').toLowerCase().includes(q);
    }
    if (selectedCategory) return (r.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
    return true;
  });

  // ============================================================
  // TRACKING VIEW (V0)
  // ============================================================
  if (view === "tracking" && order) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#1A1A1A", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: "#EA1D2C" }}>
          <button onClick={() => { setOrder(null); setView("home"); }} style={B}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Acompanhar pedido</span>
        </div>

        {/* Map area (V0) */}
        <div style={{
          height: 200, background: "linear-gradient(135deg, #1a2a3a, #0f1f2f, #1a3a2a)",
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={`h${i}`} style={{ position: "absolute", top: i * 25, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.1)" }} />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <div key={`v${i}`} style={{ position: "absolute", left: i * 32, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
          {/* Restaurant pin */}
          <div style={{ position: "absolute", top: 40, left: 80 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EA1D2C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="#fff"><path d="M3 2l18 10-18 10V2z"/></svg>
            </div>
          </div>
          {/* Delivery person */}
          <div style={{ position: "absolute", top: 90, left: 200 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EA1D2C", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff", boxShadow: "0 2px 12px rgba(234,29,44,0.5)" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>
            </div>
          </div>
          {/* Home pin */}
          <div style={{ position: "absolute", bottom: 30, right: 60 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="#fff"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            </div>
          </div>
          {/* Dotted path */}
          <svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%">
            <path d="M 94 54 Q 150 80 218 108 Q 260 130 295 155" fill="none" stroke="#EA1D2C" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
        </div>

        {/* Order status */}
        <div style={{ padding: "20px 16px", flex: 1 }}>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            {orderStep >= 3 ? "Pedido chegou!" : "Seu pedido esta a caminho"}
          </div>
          <div style={{ color: "#999", fontSize: 14, marginBottom: 20 }}>Estimativa: 25-35 min</div>

          {/* Progress steps (V0) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ORDER_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: i <= orderStep ? "#EA1D2C" : "#333",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: i <= orderStep ? "none" : "2px solid #555", flexShrink: 0,
                  }}>
                    {i <= orderStep && (
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  {i < ORDER_STEPS.length - 1 && (
                    <div style={{ width: 2, height: 28, background: i < orderStep ? "#EA1D2C" : "#333" }} />
                  )}
                </div>
                <div style={{ paddingBottom: 16 }}>
                  <span style={{ color: i <= orderStep ? "#fff" : "#666", fontSize: 14, fontWeight: i <= orderStep ? 600 : 400 }}>{step.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurant info */}
        <div style={{ padding: "16px", background: "#222", borderTop: "1px solid #333", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: getGrad(selectedRest?.id || 0), display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M3 2l18 10-18 10V2z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{order.restaurant}</div>
            <div style={{ color: "#999", fontSize: 12 }}>{fmtMoney(order.total)}</div>
          </div>
          <button style={{ padding: "8px 16px", borderRadius: 20, background: "#EA1D2C", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Chat</button>
        </div>

        <IFoodNav active="orders" onNavigate={(t) => t === "home" && setView("home")} />
      </div>
    );
  }

  // ============================================================
  // MENU VIEW (V0)
  // ============================================================
  if (view === "menu" && selectedRest) {
    const menuItems = selectedRest.menu || [];
    return (
      <div style={{ width: "100%", height: "100%", background: "#1A1A1A", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ height: 120, background: getGrad(selectedRest.id), position: "relative" }}>
            <button onClick={() => { setView("home"); setCart([]); }} style={{
              position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          </div>
          <div style={{ padding: "12px 16px", background: "#222" }}>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{selectedRest.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="#FFC107"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{ color: "#FFC107", fontSize: 13, fontWeight: 700 }}>{selectedRest.rating}</span>
              </div>
              <span style={{ color: "#999", fontSize: 13 }}>{selectedRest.category}</span>
              <span style={{ color: "#999", fontSize: 13 }}>{selectedRest.time || selectedRest.deliveryTime || "30-45"} min</span>
              <span style={{ color: (selectedRest.fee || selectedRest.deliveryFee || 0) === 0 ? "#4CAF50" : "#999", fontSize: 13, fontWeight: 600 }}>
                {(selectedRest.fee || selectedRest.deliveryFee || 0) === 0 ? "Gratis" : fmtMoney(selectedRest.fee || selectedRest.deliveryFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Menu items (V0) */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          <div style={{ padding: "8px 16px", color: "#EA1D2C", fontSize: 16, fontWeight: 800 }}>Mais Pedidos</div>
          {menuItems.map((item, idx) => {
            const key = `${selectedRest.id}_${item.id}`;
            const inCart = cart.find((c) => c._key === key);
            return (
              <div key={item.id || idx} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid #2a2a2a" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{item.name}</span>
                    {item.popular && (
                      <span style={{ color: "#EA1D2C", fontSize: 10, fontWeight: 700, background: "rgba(234,29,44,0.15)", padding: "2px 6px", borderRadius: 4 }}>POPULAR</span>
                    )}
                  </div>
                  {item.desc && <div style={{ color: "#999", fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>{item.desc}</div>}
                  <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginTop: 6 }}>{fmtMoney(item.price)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 8, background: getGrad(item.id || idx), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"><path d="M3 2l18 10-18 10V2z"/></svg>
                  </div>
                  {inCart ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => removeFromCart(key)} style={{ width: 28, height: 28, borderRadius: "50%", background: "#333", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#EA1D2C" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{inCart.qty}</span>
                      <button onClick={() => addToCart(item)} style={{ width: 28, height: 28, borderRadius: "50%", background: "#EA1D2C", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} style={{ padding: "4px 16px", borderRadius: 20, background: "#EA1D2C", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Adicionar</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart bar (V0) */}
        {cartCount > 0 && (
          <div onClick={placeOrder} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", margin: "0 12px 8px",
            background: "#EA1D2C", borderRadius: 8, cursor: "pointer",
          }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>{cartCount}</div>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Ver sacola</span>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{fmtMoney(cartTotal)}</span>
          </div>
        )}

        <IFoodNav active="home" onNavigate={(t) => t === "home" && setView("home")} />
      </div>
    );
  }

  // ============================================================
  // HOME VIEW (default — V0)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#1A1A1A", display: "flex", flexDirection: "column" }}>
      {/* Header (V0) */}
      <div style={{ padding: "12px 16px", background: "#EA1D2C", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="#fff"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="#EA1D2C"/></svg>
            <div>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Rua Los Santos, 1247</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Los Santos, SA</div>
            </div>
          </div>
          <button onClick={() => onNavigate?.("home")} style={B}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </button>
        </div>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "8px 12px" }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Busque por item ou loja"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#333", fontSize: 14 }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Categories (V0 SVG icons) */}
        <div style={{ display: "flex", gap: 12, padding: "16px", overflowX: "auto" }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer", flexShrink: 0,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: selectedCategory === cat.name ? "#EA1D2C" : "#2a2a2a",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
              }}>
                <CategoryIcon type={cat.icon} />
              </div>
              <span style={{ color: "#fff", fontSize: 11, whiteSpace: "nowrap" }}>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Promo banner (V0) */}
        {!searchQuery.trim() && (
          <div style={{ margin: "0 16px 16px", padding: "16px", borderRadius: 12, background: "linear-gradient(135deg, #EA1D2C, #B71C1C)" }}>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Frete Gratis</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>Em pedidos acima de R$ 30</div>
          </div>
        )}

        {/* Restaurants */}
        <div style={{ padding: "0 16px" }}>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Perto de voce</div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <div style={{ width: 24, height: 24, border: "2px solid #333", borderTopColor: "#EA1D2C", borderRadius: "50%", animation: "ifSpin 0.8s linear infinite" }} />
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>Nenhum restaurante encontrado</div>
            </div>
          ) : filteredRestaurants.map((rest, idx) => (
            <button key={rest.id || idx} onClick={() => { setSelectedRest(rest); setCart([]); setView("menu"); }} style={{
              display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #2a2a2a",
              background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left",
              borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#2a2a2a",
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 8, background: getGrad(rest.id || idx), flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 20, fontWeight: 800 }}>{rest.emoji || rest.name.charAt(0)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{rest.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="#FFC107"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ color: "#FFC107", fontSize: 12, fontWeight: 700 }}>{rest.rating}</span>
                  <span style={{ color: "#999", fontSize: 12 }}>{rest.category}</span>
                  <span style={{ color: "#999", fontSize: 12 }}>{rest.time || rest.deliveryTime || "30-45"} min</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ color: (rest.fee || rest.deliveryFee || 0) === 0 ? "#4CAF50" : "#999", fontSize: 12, fontWeight: 600 }}>
                    {(rest.fee || rest.deliveryFee || 0) === 0 ? "Entrega gratis" : fmtMoney(rest.fee || rest.deliveryFee)}
                  </span>
                  {rest.promo && (
                    <span style={{ color: "#EA1D2C", fontSize: 11, fontWeight: 700, background: "rgba(234,29,44,0.15)", padding: "2px 6px", borderRadius: 4 }}>{rest.promo}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <IFoodNav active="home" onNavigate={(t) => { if (t === "orders" && order) { setView("tracking"); } }} />
      <style>{`@keyframes ifSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ===== Bottom Navigation (V0) =====
function IFoodNav({ active, onNavigate }) {
  const tabs = [
    { id: "home", label: "Inicio", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill={a ? "#EA1D2C" : "none"} stroke={a ? "#EA1D2C" : "#666"} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
    { id: "search", label: "Busca", icon: () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { id: "orders", label: "Pedidos", icon: (a) => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={a ? "#EA1D2C" : "#666"} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { id: "profile", label: "Perfil", icon: () => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 0 6px", background: "#222", borderTop: "1px solid #333", flexShrink: 0 }}>
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onNavigate(tab.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
          {tab.icon(active === tab.id)}
          <span style={{ color: active === tab.id ? "#EA1D2C" : "#666", fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

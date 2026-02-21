import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Tor Dark Market App — Terminal style, verde matrix #00FF41
// Telas: market | product | cart | terminal
// Handlers: tor_store, tor_buy, tor_messages, tor_send
// ============================================================

const PRODUCTS = [
  { id: 1, name: "VPN Lifetime License", price: 0.0032, btcPrice: "0.0032 BTC", usd: "$195", cat: "Software", seller: "cyph3rpunk", rating: 4.8, reviews: 342, desc: "VPN premium, zero logs, WireGuard protocol. Ativacao imediata." },
  { id: 2, name: "Documentos Falsos Pack", price: 0.015, btcPrice: "0.015 BTC", usd: "$915", cat: "Docs", seller: "ghost_vendor", rating: 4.5, reviews: 128, desc: "Pacote completo de documentacao. Entrega via dead drop." },
  { id: 3, name: "Exploit Kit v4.2", price: 0.085, btcPrice: "0.085 BTC", usd: "$5,185", cat: "Tools", seller: "z3r0day", rating: 4.9, reviews: 56, desc: "Kit completo de exploits 0-day. Atualizacao mensal incluida." },
  { id: 4, name: "Carding Tutorial 2026", price: 0.002, btcPrice: "0.002 BTC", usd: "$122", cat: "Guides", seller: "darktutor", rating: 4.2, reviews: 891, desc: "Guia completo atualizado 2026. Metodos testados." },
  { id: 5, name: "Botnet Rental 30d", price: 0.042, btcPrice: "0.042 BTC", usd: "$2,562", cat: "Tools", seller: "botm4ster", rating: 4.7, reviews: 73, desc: "10k bots ativos, DDoS capabilities, painel incluso." },
  { id: 6, name: "Fullz Pack x50", price: 0.008, btcPrice: "0.008 BTC", usd: "$488", cat: "Data", seller: "d4t4leak", rating: 4.4, reviews: 415, desc: "50 fullz verificados, US/EU mix. Fresh data." },
  { id: 7, name: "Ransomware Builder", price: 0.12, btcPrice: "0.12 BTC", usd: "$7,320", cat: "Tools", seller: "cr1pt0lock", rating: 4.6, reviews: 29, desc: "Builder customizavel, FUD, painel C2 incluso." },
  { id: 8, name: "SSH Root Access x10", price: 0.005, btcPrice: "0.005 BTC", usd: "$305", cat: "Access", seller: "r00tkid", rating: 4.3, reviews: 267, desc: "10 servidores comprometidos, root access confirmado." },
];

const TERMINAL_LINES = [
  "[+] Connecting to Tor network...",
  "[+] Circuit established: Guard -> Middle -> Exit",
  "[+] Encryption: AES-256-GCM",
  "[+] IP masked: 185.xxx.xxx.42 -> HIDDEN",
  "[+] Connected to .onion marketplace",
  "[+] PGP key verified: 0x7F3A9B2C",
  "[+] Session: ENCRYPTED",
  "[$] BTC Wallet: bc1q...x8f3",
  "[$] Balance: 0.2847 BTC",
  "[*] Welcome back, anon",
];

export default function TorApp({ onNavigate }) {
  const [view, setView] = useState("terminal");
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState("All");
  const [terminalIndex, setTerminalIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(PRODUCTS);
  const terminalRef = useRef(null);

  // Terminal animation
  useEffect(() => {
    if (view !== "terminal") return;
    if (terminalIndex >= TERMINAL_LINES.length) {
      const timeout = setTimeout(() => setView("market"), 800);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setTerminalIndex((i) => i + 1), 300);
    return () => clearTimeout(timeout);
  }, [view, terminalIndex]);

  // ── tor_store (init) ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("tor_store");
      if (res?.products?.length) {
        setProducts(res.products.map((p, i) => ({
          id: p.id || i + 1, name: p.name || "?", price: p.price || 0,
          btcPrice: p.btcPrice || "0 BTC", usd: p.usd || "$0",
          cat: p.cat || "Tools", seller: p.seller || "anon",
          rating: p.rating || 4.0, reviews: p.reviews || 0, desc: p.desc || "",
        })));
      }
    })();
  }, []);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  // ── tor_buy ──
  const confirmPurchase = useCallback(async () => {
    await fetchBackend("tor_buy", { items: cart.map((p) => ({ id: p.id, price: p.price })) });
    setCart([]);
    setView("market");
  }, [cart]);

  // ── tor_messages ──
  const openMessages = useCallback(async (seller) => {
    await fetchBackend("tor_messages", { seller });
  }, []);

  // ── tor_send ──
  const sendMessage = useCallback(async (seller, text) => {
    await fetchBackend("tor_send", { seller, text });
  }, []);

  const categories = ["All", "Tools", "Software", "Data", "Docs", "Guides", "Access"];
  const filteredProducts = products.filter((p) => {
    const matchCat = filter === "All" || p.cat === filter;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // ============================================================
  // TERMINAL BOOT VIEW
  // ============================================================
  if (view === "terminal") {
    return (
      <div style={{
        width: "100%", height: "100%", background: "#0a0a0a",
        display: "flex", flexDirection: "column", padding: 16,
        fontFamily: "'Courier New', Courier, monospace",
      }}>
        <div style={{ color: "#00FF41", fontSize: 11, marginBottom: 8 }}>
          {">"} tor_market_v3.2.1 --connect
        </div>
        <div ref={terminalRef} style={{ flex: 1, overflowY: "auto" }}>
          {TERMINAL_LINES.slice(0, terminalIndex).map((line, i) => (
            <div key={i} style={{
              color: line.startsWith("[$]") ? "#FFD700" : line.startsWith("[*]") ? "#00BFFF" : "#00FF41",
              fontSize: 11, lineHeight: 1.8, fontFamily: "'Courier New', Courier, monospace",
            }}>
              {line}
            </div>
          ))}
          {terminalIndex < TERMINAL_LINES.length && (
            <span style={{ color: "#00FF41", animation: "blink 1s infinite" }}>{"_"}</span>
          )}
        </div>
        <style>{`@keyframes blink { 0%,50% { opacity:1 } 51%,100% { opacity:0 } }`}</style>
      </div>
    );
  }

  // ============================================================
  // CART VIEW
  // ============================================================
  if (view === "cart") {
    const total = cart.reduce((sum, p) => sum + p.price, 0);
    return (
      <div style={{
        width: "100%", height: "100%", background: "#0a0a0a",
        display: "flex", flexDirection: "column",
        fontFamily: "'Courier New', Courier, monospace",
      }}>
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 16px",
          borderBottom: "1px solid #1a3a1a",
        }}>
          <button onClick={() => setView("market")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#00FF41", fontSize: 14, fontWeight: 700, marginLeft: 12 }}>[CART]</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {cart.length === 0 ? (
            <div style={{ color: "#00FF41", fontSize: 12, textAlign: "center", padding: 40, opacity: 0.5 }}>
              {">"} cart is empty
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={{
                padding: "12px", marginBottom: 8, borderRadius: 4,
                border: "1px solid #1a3a1a", background: "#0d1a0d",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: "#00FF41", fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                  <button onClick={() => setCart((prev) => prev.filter((p) => p.id !== item.id))} style={{
                    background: "none", border: "none", cursor: "pointer", color: "#FF4136", fontSize: 16,
                  }}>x</button>
                </div>
                <div style={{ color: "#FFD700", fontSize: 12, marginTop: 4 }}>{item.btcPrice}</div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: 16, borderTop: "1px solid #1a3a1a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#00FF41", fontSize: 13 }}>TOTAL:</span>
              <span style={{ color: "#FFD700", fontSize: 15, fontWeight: 700 }}>{total.toFixed(4)} BTC</span>
            </div>
            <button onClick={confirmPurchase} style={{
              width: "100%", padding: "12px", borderRadius: 4,
              background: "#00FF41", border: "none",
              color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer",
              fontFamily: "'Courier New', Courier, monospace",
            }}>
              [CONFIRM PURCHASE]
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // PRODUCT DETAIL VIEW
  // ============================================================
  if (view === "product") {
    return (
      <div style={{
        width: "100%", height: "100%", background: "#0a0a0a",
        display: "flex", flexDirection: "column",
        fontFamily: "'Courier New', Courier, monospace",
      }}>
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 16px",
          borderBottom: "1px solid #1a3a1a",
        }}>
          <button onClick={() => setView("market")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#00FF41", fontSize: 14, fontWeight: 700, marginLeft: 12 }}>[LISTING]</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {/* Product header */}
          <div style={{
            padding: 16, borderRadius: 4, border: "1px solid #1a3a1a",
            background: "#0d1a0d", marginBottom: 16,
          }}>
            <div style={{ color: "#00FF41", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {selectedProduct.name}
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <span style={{
                padding: "2px 8px", borderRadius: 2, background: "#1a3a1a",
                color: "#00FF41", fontSize: 11,
              }}>
                {selectedProduct.cat}
              </span>
              <span style={{ color: "#FFD700", fontSize: 11 }}>
                {"*".repeat(Math.floor(selectedProduct.rating))} {selectedProduct.rating}
              </span>
              <span style={{ color: "#555", fontSize: 11 }}>({selectedProduct.reviews} reviews)</span>
            </div>
            <div style={{ color: "#FFD700", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
              {selectedProduct.btcPrice}
            </div>
            <div style={{ color: "#555", fontSize: 12 }}>~{selectedProduct.usd}</div>
          </div>

          {/* Description */}
          <div style={{
            padding: 16, borderRadius: 4, border: "1px solid #1a3a1a",
            background: "#0d1a0d", marginBottom: 16,
          }}>
            <div style={{ color: "#00FF41", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>[DESCRIPTION]</div>
            <div style={{ color: "#8a8", fontSize: 13, lineHeight: 1.6 }}>
              {selectedProduct.desc}
            </div>
          </div>

          {/* Seller info */}
          <div style={{
            padding: 16, borderRadius: 4, border: "1px solid #1a3a1a",
            background: "#0d1a0d", marginBottom: 16,
          }}>
            <div style={{ color: "#00FF41", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>[VENDOR]</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 4, background: "#1a3a1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#00FF41", fontSize: 14, fontWeight: 700,
              }}>
                {selectedProduct.seller.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ color: "#00FF41", fontSize: 13, fontWeight: 600 }}>{selectedProduct.seller}</div>
                <div style={{ color: "#555", fontSize: 11 }}>PGP Verified | Level 5</div>
              </div>
            </div>
          </div>

          {/* Escrow notice */}
          <div style={{
            padding: 12, borderRadius: 4, border: "1px dashed #1a3a1a",
            background: "rgba(0,255,65,0.05)",
          }}>
            <div style={{ color: "#00FF41", fontSize: 11, textAlign: "center" }}>
              [!] Escrow available | Multisig 2-of-3 | PGP encrypted comms
            </div>
          </div>
        </div>

        {/* Buy button */}
        <div style={{ padding: 16, borderTop: "1px solid #1a3a1a" }}>
          <button onClick={() => { addToCart(selectedProduct); setView("cart"); }} style={{
            width: "100%", padding: "12px", borderRadius: 4,
            background: "#00FF41", border: "none",
            color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Courier New', Courier, monospace",
          }}>
            [ADD TO CART] - {selectedProduct.btcPrice}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MARKET VIEW (default)
  // ============================================================
  return (
    <div style={{
      width: "100%", height: "100%", background: "#0a0a0a",
      display: "flex", flexDirection: "column",
      fontFamily: "'Courier New', Courier, monospace",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderBottom: "1px solid #1a3a1a", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="#00FF41">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span style={{ color: "#00FF41", fontSize: 14, fontWeight: 800 }}>DARK MARKET</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => setView("cart")} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", position: "relative",
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            {cart.length > 0 && (
              <div style={{
                position: "absolute", top: -6, right: -6,
                width: 16, height: 16, borderRadius: "50%",
                background: "#FF4136", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800, color: "#fff",
              }}>{cart.length}</div>
            )}
          </button>
        </div>
      </div>

      {/* Wallet banner */}
      <div style={{
        margin: "8px 16px", padding: "8px 12px", borderRadius: 4,
        background: "#0d1a0d", border: "1px solid #1a3a1a",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ color: "#555", fontSize: 11 }}>BTC Wallet</span>
        <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 700 }}>0.2847 BTC</span>
      </div>

      {/* Search */}
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
          borderRadius: 4, background: "#0d1a0d", border: "1px solid #1a3a1a",
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search listings..."
            style={{
              flex: 1, background: "none", border: "none", color: "#00FF41",
              fontSize: 12, outline: "none",
              fontFamily: "'Courier New', Courier, monospace",
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{
        display: "flex", gap: 6, padding: "0 16px 8px",
        overflowX: "auto", flexShrink: 0,
      }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: "4px 10px", borderRadius: 2, flexShrink: 0,
            background: filter === cat ? "#00FF41" : "#0d1a0d",
            border: `1px solid ${filter === cat ? "#00FF41" : "#1a3a1a"}`,
            color: filter === cat ? "#000" : "#00FF41",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Courier New', Courier, monospace",
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => { setSelectedProduct(product); setView("product"); }}
            style={{
              width: "100%", textAlign: "left", padding: "12px",
              marginBottom: 6, borderRadius: 4,
              background: "#0d1a0d", border: "1px solid #1a3a1a",
              cursor: "pointer", display: "block",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#00FF41", fontSize: 13, fontWeight: 600 }}>{product.name}</span>
              <span style={{
                padding: "1px 6px", borderRadius: 2,
                background: "#1a3a1a", color: "#00FF41", fontSize: 10,
              }}>{product.cat}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ color: "#FFD700", fontSize: 14, fontWeight: 700 }}>{product.btcPrice}</span>
                <span style={{ color: "#555", fontSize: 11, marginLeft: 6 }}>~{product.usd}</span>
              </div>
              <div style={{ color: "#555", fontSize: 11 }}>
                {"*".repeat(Math.floor(product.rating))} ({product.reviews})
              </div>
            </div>
            <div style={{ color: "#555", fontSize: 10, marginTop: 4 }}>by {product.seller}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

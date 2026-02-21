import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Marketplace App — Facebook V0 100% + ALL 6 backend handlers
// Handlers: market_listings, market_my_listings, market_create,
//   market_delete, market_buy, market_contact
// Views: home | details | sell | myListings | messages
// ============================================================

const CATEGORIES = [
  { id: "all", label: "Todos", color: "#1877F2" },
  { id: "veiculos", label: "Veiculos", color: "#00A86B" },
  { id: "eletronicos", label: "Eletronicos", color: "#276EF1" },
  { id: "imoveis", label: "Imoveis", color: "#FF6B35" },
  { id: "moveis", label: "Moveis", color: "#9C27B0" },
];
const FALLBACK_LISTINGS = [
  { id: 1, title: "Fiat Uno 2019 Completo", price: "R$ 38.000", category: "veiculos", location: "Los Santos", seller: "Carlos", image: "🚗", saved: false },
  { id: 2, title: "iPhone 15 Pro Max 256GB", price: "R$ 6.500", category: "eletronicos", location: "Vinewood", seller: "Rafael", image: "📱", saved: false },
  { id: 3, title: "Apartamento 2 quartos", price: "R$ 1.200/mes", category: "imoveis", location: "Sandy Shores", seller: "Imobiliaria LS", image: "🏠", saved: false },
  { id: 4, title: "Notebook Gamer RTX 4060", price: "R$ 5.200", category: "eletronicos", location: "Paleto Bay", seller: "Marcos", image: "💻", saved: false },
  { id: 5, title: "Sofa 3 Lugares Cinza", price: "R$ 1.800", category: "moveis", location: "Del Perro", seller: "Ana", image: "🛋️", saved: false },
  { id: 6, title: "Honda Civic 2022", price: "R$ 128.000", category: "veiculos", location: "Rockford Hills", seller: "Pedro", image: "🏎️", saved: false },
];

export default function Marketplace({ onNavigate }) {
  const [view, setView] = useState("home");
  const [listings, setListings] = useState(FALLBACK_LISTINGS);
  const [myListings, setMyListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("veiculos");
  const [newDesc, setNewDesc] = useState("");
  const [tab, setTab] = useState("browse");

  // ── market_listings (init) ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("market_listings");
      if (res?.listings?.length) {
        const emojis = { veiculos: "🚗", eletronicos: "📱", imoveis: "🏠", moveis: "🛋️" };
        setListings(res.listings.map((l, i) => ({
          id: l.id || i + 1, title: l.title || "", price: l.price || "",
          category: (l.category || "").toLowerCase(), location: l.location || "",
          seller: l.seller_name || l.seller || "", image: emojis[(l.category || "").toLowerCase()] || "📦", saved: false,
        })));
      }
    })();
  }, []);

  // ── market_my_listings ──
  const loadMyListings = useCallback(async () => {
    const res = await fetchBackend("market_my_listings");
    if (res?.listings?.length) {
      setMyListings(res.listings.map((l, i) => ({
        id: l.id || i + 1, title: l.title || "", price: l.price || "",
        category: (l.category || "").toLowerCase(), location: l.location || "",
      })));
    }
    setView("myListings");
  }, []);

  // ── market_create ──
  const handleCreate = useCallback(async () => {
    if (!newTitle.trim() || !newPrice.trim()) return;
    const res = await fetchBackend("market_create", { title: newTitle.trim(), price: newPrice.trim(), category: newCategory, description: newDesc.trim() });
    const emojis = { veiculos: "🚗", eletronicos: "📱", imoveis: "🏠", moveis: "🛋️" };
    const newItem = { id: res?.id || Date.now(), title: newTitle.trim(), price: newPrice.trim(), category: newCategory, location: "Los Santos", seller: "Voce", image: emojis[newCategory] || "📦", saved: false };
    setListings((prev) => [newItem, ...prev]);
    setNewTitle(""); setNewPrice(""); setNewDesc(""); setView("home");
  }, [newTitle, newPrice, newCategory, newDesc]);

  // ── market_delete ──
  const handleDelete = useCallback(async (id) => {
    await fetchBackend("market_delete", { id });
    setMyListings((prev) => prev.filter((l) => l.id !== id));
    setListings((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // ── market_buy ──
  const handleBuy = useCallback(async (listing) => {
    await fetchBackend("market_buy", { id: listing.id });
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    setView("home");
  }, []);

  // ── market_contact ──
  const handleContact = useCallback(async (listing) => {
    await fetchBackend("market_contact", { id: listing.id, seller: listing.seller });
  }, []);

  const toggleSave = (id) => setListings((prev) => prev.map((l) => l.id === id ? { ...l, saved: !l.saved } : l));
  const filtered = listings.filter((l) => (filter === "all" || l.category === filter) && (!search || l.title.toLowerCase().includes(search.toLowerCase())));

  // ============================================================
  // MY LISTINGS VIEW
  // ============================================================
  if (view === "myListings") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #222" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Meus Anuncios</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {myListings.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "#666" }}>
              <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/></svg>
              <div style={{ fontSize: 14, marginTop: 12 }}>Nenhum anuncio publicado</div>
            </div>
          ) : myListings.map((l) => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{l.title}</div>
                <div style={{ color: "#1877F2", fontSize: 13, fontWeight: 700 }}>{l.price}</div>
              </div>
              <button onClick={() => handleDelete(l.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#FF453A", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Remover</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // DETAILS VIEW (V0 100%)
  // ============================================================
  if (view === "details" && selected) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 200, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <button onClick={() => setView("home")} style={{ position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => toggleSave(selected.id)} style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill={selected.saved ? "#1877F2" : "none"} stroke={selected.saved ? "#1877F2" : "#fff"} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </button>
          <span style={{ fontSize: 64 }}>{selected.image}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ color: "#1877F2", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{selected.price}</div>
          <div style={{ color: "#fff", fontSize: 17, fontWeight: 600, marginBottom: 12 }}>{selected.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ color: "#888", fontSize: 13 }}>{selected.location}</span>
          </div>
          <div style={{ padding: "12px", borderRadius: 12, background: "#1a1a1a", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>{selected.seller.charAt(0)}</div>
            <div>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{selected.seller}</div>
              <div style={{ color: "#888", fontSize: 12 }}>Vendedor</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 16, borderTop: "1px solid #222", display: "flex", gap: 8 }}>
          <button onClick={() => handleContact(selected)} style={{ flex: 1, padding: "14px", borderRadius: 10, background: "#1877F2", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Mensagem</button>
          <button onClick={() => handleBuy(selected)} style={{ flex: 1, padding: "14px", borderRadius: 10, background: "#00A86B", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Comprar</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // SELL VIEW (V0 100%)
  // ============================================================
  if (view === "sell") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #222" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#888", fontSize: 15, cursor: "pointer" }}>Cancelar</button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Novo Anuncio</span>
          <button onClick={handleCreate} style={{ background: "none", border: "none", color: "#1877F2", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Publicar</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ height: 120, background: "#1a1a1a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, cursor: "pointer" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ color: "#888", fontSize: 13 }}>Adicionar fotos</span>
            </div>
          </div>
          {[
            { label: "Titulo", value: newTitle, set: setNewTitle, placeholder: "Nome do produto" },
            { label: "Preco", value: newPrice, set: setNewPrice, placeholder: "R$ 0,00" },
            { label: "Descricao", value: newDesc, set: setNewDesc, placeholder: "Descreva seu produto", multiline: true },
          ].map((field) => (
            <div key={field.label} style={{ marginBottom: 14 }}>
              <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>{field.label}</div>
              {field.multiline ? (
                <textarea value={field.value} onChange={(e) => field.set(e.target.value)} placeholder={field.placeholder} style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1a1a1a", border: "1px solid #333", color: "#fff", fontSize: 14, outline: "none", minHeight: 80, resize: "none", boxSizing: "border-box" }} />
              ) : (
                <input value={field.value} onChange={(e) => field.set(e.target.value)} placeholder={field.placeholder} style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1a1a1a", border: "1px solid #333", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              )}
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>Categoria</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.slice(1).map((cat) => (
                <button key={cat.id} onClick={() => setNewCategory(cat.id)} style={{ padding: "8px 14px", borderRadius: 16, background: newCategory === cat.id ? cat.color : "#1a1a1a", border: newCategory === cat.id ? "none" : "1px solid #333", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{cat.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // HOME VIEW (default — V0 100%)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>Marketplace</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadMyListings} style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a1a1a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <button onClick={() => setView("sell")} style={{ width: 32, height: 32, borderRadius: "50%", background: "#1877F2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#1a1a1a" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar no Marketplace" style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 14, outline: "none" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "0 16px 10px", overflowX: "auto" }}>
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setFilter(cat.id)} style={{ padding: "6px 14px", borderRadius: 16, flexShrink: 0, background: filter === cat.id ? cat.color : "#1a1a1a", border: filter === cat.id ? "none" : "1px solid #333", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{cat.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {filtered.map((item) => (
            <button key={item.id} onClick={() => { setSelected(item); setView("details"); }} style={{ background: "#1a1a1a", borderRadius: 12, overflow: "hidden", border: "none", cursor: "pointer", textAlign: "left" }}>
              <div style={{ height: 100, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <span style={{ fontSize: 36 }}>{item.image}</span>
                <button onClick={(e) => { e.stopPropagation(); toggleSave(item.id); }} style={{ position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill={item.saved ? "#1877F2" : "none"} stroke={item.saved ? "#1877F2" : "#fff"} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                </button>
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ color: "#1877F2", fontSize: 14, fontWeight: 800 }}>{item.price}</div>
                <div style={{ color: "#fff", fontSize: 12, fontWeight: 500, marginTop: 2 }}>{item.title}</div>
                <div style={{ color: "#888", fontSize: 11, marginTop: 2 }}>{item.location}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #222" }}>
        {[
          { id: "browse", label: "Explorar", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
          { id: "saved", label: "Salvos", icon: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" },
          { id: "sell", label: "Vender", icon: "M12 5v14M5 12h14" },
        ].map((t) => (
          <button key={t.id} onClick={() => t.id === "sell" ? setView("sell") : t.id === "saved" ? setFilter("saved") : setFilter("all")} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={tab === t.id ? "#1877F2" : "#888"} strokeWidth="2"><path d={t.icon}/></svg>
            <span style={{ color: tab === t.id ? "#1877F2" : "#888", fontSize: 10, fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Yellow Pages App — V0 100% pixel-perfect + ALL 2 backend handlers
// Handlers: yp_list, yp_create
// Views: list | detail | create
// ============================================================

const FALLBACK_BUSINESSES = [
  { id: 1, name: "Los Santos Customs", category: "Mecanica", phone: "(11) 3456-7890", address: "Popular St, La Mesa", rating: 4.7, reviews: 234, hours: "08:00 - 22:00", desc: "Customizacao e reparo de veiculos. Pintura, performance e blindagem.", color: "#FF6B00" },
  { id: 2, name: "Pillbox Hill Medical", category: "Saude", phone: "(11) 9999-0000", address: "Pillbox Hill, Alta St", rating: 4.2, reviews: 567, hours: "24 horas", desc: "Hospital geral com pronto-socorro, emergencia e UTI. Planos aceitos.", color: "#E53935" },
  { id: 3, name: "Bahama Mamas West", category: "Bar/Club", phone: "(11) 3333-4444", address: "Del Perro, LS", rating: 4.5, reviews: 891, hours: "21:00 - 05:00", desc: "Balada premium com DJs internacionais. Area VIP e rooftop.", color: "#9C27B0" },
  { id: 4, name: "Bean Machine Coffee", category: "Cafeteria", phone: "(11) 2222-3333", address: "Vespucci Canals", rating: 4.8, reviews: 423, hours: "06:00 - 20:00", desc: "Cafe artesanal, brunch e doces. WiFi gratis e ambiente acolhedor.", color: "#795548" },
  { id: 5, name: "Fleeca Bank - Centro", category: "Banco", phone: "(11) 4000-1000", address: "Downtown LS, Legion Sq", rating: 3.9, reviews: 156, hours: "09:00 - 16:00", desc: "Agencia bancaria completa. Abertura de conta, emprestimos, investimentos.", color: "#2E7D32" },
  { id: 6, name: "Up-n-Atom Burger", category: "Fast Food", phone: "(11) 5555-6666", address: "Vinewood, Mirror Park", rating: 4.1, reviews: 678, hours: "10:00 - 23:00", desc: "Hamburguer artesanal, shakes e batata frita. Delivery disponivel.", color: "#F57C00" },
  { id: 7, name: "Ponsonbys", category: "Moda", phone: "(11) 7777-8888", address: "Portola Drive, Rockford Hills", rating: 4.6, reviews: 312, hours: "10:00 - 21:00", desc: "Moda de luxo, ternos sob medida, acessorios premium.", color: "#1565C0" },
  { id: 8, name: "Iron Gym", category: "Academia", phone: "(11) 8888-9999", address: "Vespucci Beach", rating: 4.4, reviews: 445, hours: "05:00 - 00:00", desc: "Academia completa, musculacao, crossfit, luta. Personal trainer.", color: "#D32F2F" },
];
const COLORS = ["#FF6B00","#E53935","#9C27B0","#795548","#2E7D32","#F57C00","#1565C0","#D32F2F","#0288D1","#AD1457"];
const CATEGORIES = ["Todos", "Mecanica", "Saude", "Bar/Club", "Cafeteria", "Banco", "Fast Food", "Moda", "Academia"];

export default function YellowPages({ onNavigate }) {
  const [view, setView] = useState("list");
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [businesses, setBusinesses] = useState(FALLBACK_BUSINESSES);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Mecanica");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newHours, setNewHours] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // ── yp_list (init) ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("yp_list");
      if (res?.businesses?.length) {
        setBusinesses(res.businesses.map((b, i) => ({
          id: b.id || i + 1, name: b.name || "", category: b.category || "",
          phone: b.phone || "", address: b.address || "", rating: b.rating || 4.0,
          reviews: b.reviews || 0, hours: b.hours || "", desc: b.description || "",
          color: COLORS[i % COLORS.length],
        })));
      }
    })();
  }, []);

  // ── yp_create ──
  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    const res = await fetchBackend("yp_create", { name: newName.trim(), category: newCategory, phone: newPhone.trim(), address: newAddress.trim(), hours: newHours.trim(), description: newDesc.trim() });
    const newBiz = { id: res?.id || Date.now(), name: newName.trim(), category: newCategory, phone: newPhone.trim(), address: newAddress.trim(), rating: 5.0, reviews: 0, hours: newHours.trim(), desc: newDesc.trim(), color: COLORS[businesses.length % COLORS.length] };
    setBusinesses((prev) => [newBiz, ...prev]);
    setNewName(""); setNewPhone(""); setNewAddress(""); setNewHours(""); setNewDesc(""); setView("list");
  }, [newName, newCategory, newPhone, newAddress, newHours, newDesc, businesses.length]);

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <svg key={i} width={12} height={12} viewBox="0 0 24 24" fill={i < Math.floor(rating) ? "#FFD600" : "#333"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ));

  const filtered = businesses.filter((b) => {
    const matchCat = filter === "Todos" || b.category === filter;
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ============================================================
  // CREATE VIEW
  // ============================================================
  if (view === "create") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0f0f0f", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #222" }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: "#888", fontSize: 15, cursor: "pointer" }}>Cancelar</button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Novo Negocio</span>
          <button onClick={handleCreate} style={{ background: "none", border: "none", color: "#FFD600", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {[
            { label: "Nome", value: newName, set: setNewName, placeholder: "Nome do negocio" },
            { label: "Telefone", value: newPhone, set: setNewPhone, placeholder: "(00) 0000-0000" },
            { label: "Endereco", value: newAddress, set: setNewAddress, placeholder: "Endereco completo" },
            { label: "Horario", value: newHours, set: setNewHours, placeholder: "Ex: 08:00 - 18:00" },
          ].map((field) => (
            <div key={field.label} style={{ marginBottom: 14 }}>
              <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>{field.label}</div>
              <input value={field.value} onChange={(e) => field.set(e.target.value)} placeholder={field.placeholder} style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1a1a1a", border: "1px solid #333", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>Categoria</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.slice(1).map((cat) => (
                <button key={cat} onClick={() => setNewCategory(cat)} style={{ padding: "6px 12px", borderRadius: 16, background: newCategory === cat ? "#FFD600" : "#1a1a1a", border: newCategory === cat ? "none" : "1px solid #333", color: newCategory === cat ? "#000" : "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{cat}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>Descricao</div>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descreva o negocio" style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1a1a1a", border: "1px solid #333", color: "#fff", fontSize: 14, outline: "none", minHeight: 80, resize: "none", boxSizing: "border-box" }} />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DETAIL VIEW (V0 100%)
  // ============================================================
  if (view === "detail" && selectedBiz) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0f0f0f", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 140, background: selectedBiz.color, position: "relative", display: "flex", alignItems: "flex-end", padding: 16 }}>
          <button onClick={() => setView("list")} style={{ position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <span style={{ padding: "3px 8px", borderRadius: 4, background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 11, fontWeight: 600 }}>{selectedBiz.category}</span>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginTop: 8 }}>{selectedBiz.name}</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 2 }}>{renderStars(selectedBiz.rating)}</div>
            <span style={{ color: "#FFD600", fontSize: 14, fontWeight: 700 }}>{selectedBiz.rating}</span>
            <span style={{ color: "#888", fontSize: 12 }}>({selectedBiz.reviews} avaliacoes)</span>
          </div>
          {[
            { icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z", label: selectedBiz.address },
            { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: selectedBiz.hours },
            { icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72", label: selectedBiz.phone },
          ].map((info, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="1.5"><path d={info.icon}/></svg>
              <span style={{ color: "#ccc", fontSize: 14 }}>{info.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Sobre</div>
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{selectedBiz.desc}</p>
          </div>
        </div>
        <div style={{ padding: 16, borderTop: "1px solid #1a1a1a" }}>
          <button onClick={() => onNavigate?.("phone")} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#FFD600", border: "none", color: "#000", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="#000"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            Ligar Agora
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // LIST VIEW (default — V0 100%)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#0f0f0f", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #222", background: "#FFD600", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="#000"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 8.5a1 1 0 110 2 1 1 0 010-2zm7 0a1 1 0 110 2 1 1 0 010-2zM16 15H8a1 1 0 010-2h8a1 1 0 010 2z"/></svg>
            <span style={{ color: "#000", fontSize: 18, fontWeight: 800 }}>Yellow Pages</span>
          </div>
          <button onClick={() => setView("create")} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.1)" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" opacity={0.5}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar negocios..." style={{ flex: 1, background: "none", border: "none", color: "#000", fontSize: 14, outline: "none" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "8px 16px", overflowX: "auto", flexShrink: 0 }}>
        {CATEGORIES.slice(0, 6).map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ padding: "6px 12px", borderRadius: 16, flexShrink: 0, background: filter === cat ? "#FFD600" : "#1a1a1a", border: filter === cat ? "none" : "1px solid #333", color: filter === cat ? "#000" : "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{cat}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.map((biz) => (
          <button key={biz.id} onClick={() => { setSelectedBiz(biz); setView("detail"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", borderBottom: "1px solid #1a1a1a", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: biz.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{biz.name.charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{biz.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <span style={{ color: "#FFD600", fontSize: 11, fontWeight: 700 }}>{biz.rating}</span>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="#FFD600"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{ color: "#888", fontSize: 11 }}>({biz.reviews})</span>
                <span style={{ color: "#555", fontSize: 11 }}>-</span>
                <span style={{ color: "#888", fontSize: 11 }}>{biz.category}</span>
              </div>
              <div style={{ color: "#666", fontSize: 11 }}>{biz.address}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onNavigate?.("phone"); }} style={{ width: 36, height: 36, borderRadius: "50%", background: "#FFD600", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="#000"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}

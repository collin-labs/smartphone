import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Contacts App — V0 100% pixel-perfect + ALL 7 backend handlers
// Handlers: contacts_list, contacts_add, contacts_delete,
//   contacts_update, contacts_block, contacts_unblock, contacts_blocked_list
// Views: list | detail | add | edit | blocked
// ============================================================

const FALLBACK_CONTACTS = [
  { id: 1, name: "Ana Belle", phone: "21987650000", initial: "A", color: "#C13584" },
  { id: 2, name: "Bruno Costa", phone: "11912345678", initial: "B", color: "#276EF1" },
  { id: 3, name: "Carlos Silva", phone: "11987654321", initial: "C", color: "#4ECDC4" },
  { id: 4, name: "Diana Souza", phone: "21998876655", initial: "D", color: "#FF6B35" },
  { id: 5, name: "Eduardo Lima", phone: "31999998888", initial: "E", color: "#00A86B" },
  { id: 6, name: "Fernanda Costa", phone: "11977776666", initial: "F", color: "#9C27B0" },
];
const COLORS = ["#C13584","#276EF1","#4ECDC4","#FF6B35","#00A86B","#9C27B0","#E91E63","#FF9800","#1DB954","#0070BA"];

export default function Contacts({ onNavigate }) {
  const [view, setView] = useState("list");
  const [contacts, setContacts] = useState(FALLBACK_CONTACTS);
  const [blockedList, setBlockedList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // ── INIT: contacts_list ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("contacts_list");
      if (res?.contacts?.length) {
        setContacts(res.contacts.map((c, i) => ({
          id: c.id || i + 1, name: c.contact_name || c.name || "?",
          phone: c.contact_phone || c.phone || "",
          initial: (c.contact_name || c.name || "?").charAt(0).toUpperCase(),
          color: COLORS[i % COLORS.length],
        })));
      }
    })();
  }, []);

  // ── contacts_add ──
  const handleAdd = useCallback(async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const res = await fetchBackend("contacts_add", { name: newName.trim(), phone: newPhone.trim() });
    const newContact = { id: res?.id || Date.now(), name: newName.trim(), phone: newPhone.trim(), initial: newName.trim().charAt(0).toUpperCase(), color: COLORS[contacts.length % COLORS.length] };
    setContacts((prev) => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName(""); setNewPhone(""); setView("list");
  }, [newName, newPhone, contacts.length]);

  // ── contacts_delete ──
  const handleDelete = useCallback(async (contact) => {
    await fetchBackend("contacts_delete", { id: contact.id });
    setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    setView("list");
  }, []);

  // ── contacts_update ──
  const handleUpdate = useCallback(async () => {
    if (!selected || !editName.trim()) return;
    await fetchBackend("contacts_update", { id: selected.id, name: editName.trim(), phone: editPhone.trim() });
    setContacts((prev) => prev.map((c) => c.id === selected.id ? { ...c, name: editName.trim(), phone: editPhone.trim(), initial: editName.trim().charAt(0).toUpperCase() } : c).sort((a, b) => a.name.localeCompare(b.name)));
    setView("list");
  }, [selected, editName, editPhone]);

  // ── contacts_block ──
  const handleBlock = useCallback(async (contact) => {
    await fetchBackend("contacts_block", { id: contact.id });
    setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    setBlockedList((prev) => [...prev, contact]);
    setView("list");
  }, []);

  // ── contacts_unblock ──
  const handleUnblock = useCallback(async (contact) => {
    await fetchBackend("contacts_unblock", { id: contact.id });
    setBlockedList((prev) => prev.filter((c) => c.id !== contact.id));
    setContacts((prev) => [...prev, contact].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  // ── contacts_blocked_list ──
  const loadBlocked = useCallback(async () => {
    const res = await fetchBackend("contacts_blocked_list");
    if (res?.contacts?.length) {
      setBlockedList(res.contacts.map((c, i) => ({ id: c.id || i + 1, name: c.contact_name || c.name || "?", phone: c.contact_phone || c.phone || "", initial: (c.contact_name || c.name || "?").charAt(0).toUpperCase(), color: "#666" })));
    }
    setView("blocked");
  }, []);

  const filtered = contacts.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const grouped = filtered.reduce((acc, c) => { const letter = c.initial; if (!acc[letter]) acc[letter] = []; acc[letter].push(c); return acc; }, {});

  // ============================================================
  // BLOCKED VIEW
  // ============================================================
  if (view === "blocked") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #222" }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Bloqueados</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {blockedList.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "#666" }}>
              <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              <div style={{ fontSize: 14, marginTop: 12 }}>Nenhum contato bloqueado</div>
            </div>
          ) : blockedList.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#888" }}>{c.initial}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#888", fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                <div style={{ color: "#555", fontSize: 12 }}>{c.phone}</div>
              </div>
              <button onClick={() => handleUnblock(c)} style={{ padding: "6px 12px", borderRadius: 16, background: "#00A86B", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Desbloquear</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // EDIT VIEW
  // ============================================================
  if (view === "edit" && selected) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #222" }}>
          <button onClick={() => setView("detail")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Editar Contato</span>
          <button onClick={handleUpdate} style={{ background: "none", border: "none", color: "#0A84FF", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: selected.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff" }}>{editName.charAt(0).toUpperCase() || selected.initial}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>Nome</div>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1C1C1E", border: "1px solid #333", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>Telefone</div>
            <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1C1C1E", border: "1px solid #333", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DETAIL VIEW (V0 100%)
  // ============================================================
  if (view === "detail" && selected) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #222" }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Contato</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 24px" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: selected.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{selected.initial}</div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{selected.name}</div>
          <div style={{ color: "#8E8E93", fontSize: 14, marginTop: 4 }}>{selected.phone}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "0 16px 24px" }}>
          {[
            { label: "Ligar", icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> },
            { label: "SMS", icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
            { label: "Editar", icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
          ].map((action) => (
            <button key={action.label} onClick={() => { if (action.label === "Editar") { setEditName(selected.name); setEditPhone(selected.phone); setView("edit"); } }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1C1C1E", display: "flex", alignItems: "center", justifyContent: "center" }}>{action.icon}</div>
              <span style={{ color: "#0A84FF", fontSize: 12 }}>{action.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => handleBlock(selected)} style={{ width: "100%", padding: "14px", borderRadius: 10, background: "#1C1C1E", border: "none", color: "#FF453A", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Bloquear Contato</button>
          <button onClick={() => handleDelete(selected)} style={{ width: "100%", padding: "14px", borderRadius: 10, background: "#1C1C1E", border: "none", color: "#FF453A", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Excluir Contato</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // ADD VIEW (V0 100%)
  // ============================================================
  if (view === "add") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #222" }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: "#0A84FF", fontSize: 15, cursor: "pointer" }}>Cancelar</button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Novo Contato</span>
          <button onClick={handleAdd} style={{ background: "none", border: "none", color: "#0A84FF", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #333, #555)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>Nome</div>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do contato" style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1C1C1E", border: "1px solid #333", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>Telefone</div>
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Numero" style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1C1C1E", border: "1px solid #333", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // LIST VIEW (default — V0 100%)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #222" }}>
        <button onClick={loadBlocked} style={{ background: "none", border: "none", color: "#FF453A", fontSize: 13, cursor: "pointer" }}>Bloqueados</button>
        <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Contatos</span>
        <button onClick={() => setView("add")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      <div style={{ padding: "8px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#1C1C1E" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar contatos" style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 14, outline: "none" }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {Object.keys(grouped).sort().map((letter) => (
          <div key={letter}>
            <div style={{ padding: "6px 16px", color: "#8E8E93", fontSize: 13, fontWeight: 600, background: "#0a0a0a" }}>{letter}</div>
            {grouped[letter].map((contact) => (
              <button key={contact.id} onClick={() => { setSelected(contact); setView("detail"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #1a1a1a", textAlign: "left" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: contact.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{contact.initial}</div>
                <div>
                  <div style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>{contact.name}</div>
                  <div style={{ color: "#8E8E93", fontSize: 12 }}>{contact.phone}</div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

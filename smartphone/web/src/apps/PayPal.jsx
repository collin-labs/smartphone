import React, { useState, useCallback, useEffect } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// PayPal App — Visual V0 pixel-perfect dark mode + Backend FiveM
// Telas: home | send | receive | receipt | qr
// V0 layout: 100% preservado | Backend: fetchBackend integrado
// ============================================================

const FALLBACK_BALANCE = 4827.53;
const FALLBACK_TRANSACTIONS = [
  { id: 1, name: "Maria Santos", type: "received", amount: 350.0, date: "Hoje, 14:32", avatar: "#0070BA", initial: "M" },
  { id: 2, name: "Uber *Viagem", type: "sent", amount: -42.9, date: "Hoje, 11:20", avatar: "#333", initial: "U" },
  { id: 3, name: "Pedro Lima", type: "sent", amount: -200.0, date: "Ontem, 19:45", avatar: "#00A86B", initial: "P" },
  { id: 4, name: "iFood", type: "sent", amount: -67.8, date: "Ontem, 13:10", avatar: "#EA1D2C", initial: "i" },
  { id: 5, name: "Joao Costa", type: "received", amount: 1500.0, date: "18/02, 10:00", avatar: "#142C8E", initial: "J" },
  { id: 6, name: "Spotify", type: "sent", amount: -34.9, date: "17/02, 08:00", avatar: "#1DB954", initial: "S" },
  { id: 7, name: "Ana Belle", type: "received", amount: 89.0, date: "16/02, 16:22", avatar: "#C13584", initial: "A" },
  { id: 8, name: "Netflix", type: "sent", amount: -55.9, date: "15/02, 08:00", avatar: "#E50914", initial: "N" },
];
const CONTACTS_SEND = [
  { id: 1, name: "Maria Santos", email: "maria@email.com", color: "#0070BA", initial: "M" },
  { id: 2, name: "Pedro Lima", email: "pedro@email.com", color: "#00A86B", initial: "P" },
  { id: 3, name: "Joao Costa", email: "joao@email.com", color: "#142C8E", initial: "J" },
  { id: 4, name: "Ana Belle", email: "ana@email.com", color: "#C13584", initial: "A" },
  { id: 5, name: "Carlos Silva", email: "carlos@email.com", color: "#4ECDC4", initial: "C" },
];

export default function PayPal({ onNavigate }) {
  const [view, setView] = useState("home");
  const [sendAmount, setSendAmount] = useState("");
  const [selectedContact, setSelectedContact] = useState(CONTACTS_SEND[0]);
  const [tab, setTab] = useState("activity");
  const [balance, setBalance] = useState(FALLBACK_BALANCE);
  const [transactions, setTransactions] = useState(FALLBACK_TRANSACTIONS);

  useEffect(() => {
    (async () => {
      const res = await fetchBackend("paypal_init");
      if (res?.balance !== undefined) setBalance(res.balance);
      if (res?.transactions?.length) {
        const colors = ["#0070BA", "#333", "#00A86B", "#EA1D2C", "#142C8E", "#1DB954", "#C13584", "#E50914"];
        setTransactions(res.transactions.map((t, i) => ({
          id: t.id || i + 1, name: t.name || t.description || "Transacao",
          type: t.amount > 0 ? "received" : "sent", amount: t.amount,
          date: t.created_at || "", avatar: colors[i % colors.length],
          initial: (t.name || "T").charAt(0).toUpperCase(),
        })));
      }
    })();
  }, []);

  const handleSend = useCallback(async () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) return;
    await fetchBackend("paypal_send", { to: selectedContact.email, amount: parseFloat(sendAmount) });
    setBalance((prev) => prev - parseFloat(sendAmount));
    setView("receipt");
  }, [sendAmount, selectedContact]);

  // ============================================================
  // QR CODE VIEW (100% V0)
  // ============================================================
  if (view === "qr") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#1C1C1E", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2C2C2E" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Meu QR Code</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{ width: 200, height: 200, background: "#fff", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              {Array.from({ length: 8 }, (_, row) => Array.from({ length: 8 }, (_, col) => (
                <div key={`${row}-${col}`} style={{ position: "absolute", left: `${col * 12.5}%`, top: `${row * 12.5}%`, width: "12.5%", height: "12.5%", background: (row + col) % 3 === 0 || (row < 3 && col < 3) || (row < 3 && col > 4) || (row > 4 && col < 3) ? "#142C8E" : "transparent" }} />
              )))}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 36, height: 36, borderRadius: 8, background: "#142C8E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>P</span>
              </div>
            </div>
          </div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Carlos Silva</div>
          <div style={{ color: "#8E8E93", fontSize: 14 }}>carlos@email.com</div>
          <div style={{ color: "#8E8E93", fontSize: 13, marginTop: 16, textAlign: "center" }}>Mostre este codigo para receber pagamentos</div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RECEIPT VIEW (100% V0)
  // ============================================================
  if (view === "receipt") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#1C1C1E", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2C2C2E" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#0070BA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Pagamento Enviado</div>
          <div style={{ color: "#0070BA", fontSize: 36, fontWeight: 800, marginBottom: 8 }}>R$ {parseFloat(sendAmount || "0").toFixed(2)}</div>
          <div style={{ color: "#8E8E93", fontSize: 14, marginBottom: 4 }}>Para {selectedContact.name}</div>
          <div style={{ color: "#8E8E93", fontSize: 12 }}>{selectedContact.email}</div>
          <div style={{ width: "100%", marginTop: 32, padding: 16, borderRadius: 12, background: "#2C2C2E" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#8E8E93", fontSize: 13 }}>ID Transacao</span>
              <span style={{ color: "#fff", fontSize: 13, fontFamily: "monospace" }}>#PP{Date.now().toString().slice(-8)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#8E8E93", fontSize: 13 }}>Data</span>
              <span style={{ color: "#fff", fontSize: 13 }}>19/02/2026</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8E8E93", fontSize: 13 }}>Taxa</span>
              <span style={{ color: "#fff", fontSize: 13 }}>R$ 0,00</span>
            </div>
          </div>
          <button onClick={() => { setSendAmount(""); setView("home"); }} style={{ width: "100%", marginTop: 24, padding: "14px", borderRadius: 24, background: "#0070BA", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Voltar ao Inicio</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // SEND VIEW (100% V0)
  // ============================================================
  if (view === "send") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#1C1C1E", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2C2C2E" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Enviar Dinheiro</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: "#8E8E93", fontSize: 13, marginBottom: 8 }}>Valor</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ color: "#0070BA", fontSize: 20, fontWeight: 600 }}>R$</span>
              <input value={sendAmount} onChange={(e) => setSendAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0,00" style={{ background: "none", border: "none", color: "#fff", fontSize: 40, fontWeight: 800, textAlign: "center", width: 200, outline: "none" }} />
            </div>
          </div>
          <div style={{ color: "#8E8E93", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Para quem?</div>
          {CONTACTS_SEND.map((contact) => (
            <button key={contact.id} onClick={() => setSelectedContact(contact)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px", marginBottom: 4, borderRadius: 12, background: selectedContact.id === contact.id ? "#2C2C2E" : "transparent", border: selectedContact.id === contact.id ? "1px solid #0070BA" : "1px solid transparent", cursor: "pointer" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: contact.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{contact.initial}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{contact.name}</div>
                <div style={{ color: "#8E8E93", fontSize: 12 }}>{contact.email}</div>
              </div>
              {selectedContact.id === contact.id && (<svg width={20} height={20} viewBox="0 0 24 24" fill="#0070BA"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>)}
            </button>
          ))}
        </div>
        <div style={{ padding: 16, borderTop: "1px solid #2C2C2E" }}>
          <button onClick={handleSend} style={{ width: "100%", padding: "14px", borderRadius: 24, background: sendAmount ? "#0070BA" : "#2C2C2E", border: "none", color: sendAmount ? "#fff" : "#666", fontSize: 16, fontWeight: 700, cursor: sendAmount ? "pointer" : "default" }}>Enviar Agora</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RECEIVE VIEW (100% V0)
  // ============================================================
  if (view === "receive") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#1C1C1E", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2C2C2E" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Solicitar Dinheiro</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: "#8E8E93", fontSize: 13, marginBottom: 8 }}>Valor a Solicitar</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ color: "#00A86B", fontSize: 20, fontWeight: 600 }}>R$</span>
              <input value={sendAmount} onChange={(e) => setSendAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0,00" style={{ background: "none", border: "none", color: "#fff", fontSize: 40, fontWeight: 800, textAlign: "center", width: 200, outline: "none" }} />
            </div>
          </div>
          <div style={{ color: "#8E8E93", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>De quem?</div>
          {CONTACTS_SEND.map((contact) => (
            <button key={contact.id} onClick={() => setSelectedContact(contact)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px", marginBottom: 4, borderRadius: 12, background: selectedContact.id === contact.id ? "#2C2C2E" : "transparent", border: selectedContact.id === contact.id ? "1px solid #00A86B" : "1px solid transparent", cursor: "pointer" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: contact.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{contact.initial}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{contact.name}</div>
                <div style={{ color: "#8E8E93", fontSize: 12 }}>{contact.email}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ padding: 16, borderTop: "1px solid #2C2C2E" }}>
          <button onClick={() => { setSendAmount(""); setView("home"); }} style={{ width: "100%", padding: "14px", borderRadius: 24, background: "#00A86B", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Solicitar</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // HOME VIEW (default — 100% V0)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#1C1C1E", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 0", background: "linear-gradient(180deg, #142C8E 0%, #253B80 100%)", borderRadius: "0 0 24px 24px", paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <svg width={80} height={24} viewBox="0 0 80 24"><text x="0" y="19" fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="800">PayPal</text></svg>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Saldo disponivel</div>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 800 }}>R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Enviar", icon: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z", action: () => setView("send") },
            { label: "Solicitar", icon: "M12 5v14M5 12l7 7 7-7", action: () => setView("receive") },
            { label: "QR Code", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17 14v3h3", action: () => setView("qr") },
          ].map((btn) => (
            <button key={btn.label} onClick={btn.action} style={{ flex: 1, padding: "10px 0", borderRadius: 20, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d={btn.icon}/></svg>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #2C2C2E", marginTop: 4 }}>
        {["activity", "crypto"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", color: tab === t ? "#0070BA" : "#8E8E93", fontSize: 14, fontWeight: 600, cursor: "pointer", borderBottom: tab === t ? "2px solid #0070BA" : "2px solid transparent" }}>
            {t === "activity" ? "Atividade" : "Crypto"}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "activity" ? (
          transactions.map((tx) => (
            <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #2C2C2E" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: tx.avatar, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{tx.initial}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{tx.name}</div>
                <div style={{ color: "#8E8E93", fontSize: 12 }}>{tx.date}</div>
              </div>
              <div style={{ color: tx.amount > 0 ? "#00A86B" : "#fff", fontSize: 15, fontWeight: 700 }}>{tx.amount > 0 ? "+" : ""}R$ {Math.abs(tx.amount).toFixed(2).replace(".", ",")}</div>
            </div>
          ))
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "#8E8E93" }}>
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <div style={{ fontSize: 14, marginTop: 12 }}>Crypto em breve</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 0", borderTop: "1px solid #2C2C2E", background: "#1C1C1E", flexShrink: 0 }}>
        {[
          { label: "Inicio", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", active: true },
          { label: "Enviar", icon: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z", active: false },
          { label: "Carteira", icon: "M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a1 1 0 100 2 1 1 0 000-2z", active: false },
          { label: "Pagtos", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", active: false },
        ].map((item) => (
          <button key={item.label} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill={item.active ? "#0070BA" : "none"} stroke={item.active ? "#0070BA" : "#8E8E93"} strokeWidth="1.5"><path d={item.icon}/></svg>
            <span style={{ color: item.active ? "#0070BA" : "#8E8E93", fontSize: 10 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Bank App — Nubank V0 100% pixel-perfect + ALL 6 backend handlers
// Handlers: bank_init, bank_balance, bank_pix, bank_transfer,
//   bank_statement, bank_receipt
// Views: home | pix | transfer | statement
// ============================================================

const FALLBACK_BALANCE = 12847.53;
const FALLBACK_TRANSACTIONS = [
  { id: 1, desc: "Salario - Empresa LS", amount: 8500, type: "salary", date: "19/02" },
  { id: 2, desc: "Supermercado Central", amount: -234.56, type: "cart", date: "18/02" },
  { id: 3, desc: "PIX - Maria Santos", amount: -500, type: "pix", date: "18/02" },
  { id: 4, desc: "Mecanica Santos", amount: -1250, type: "car", date: "17/02" },
  { id: 5, desc: "PIX - Joao Grau", amount: 350, type: "pix", date: "16/02" },
  { id: 6, desc: "Posto de Gasolina", amount: -180, type: "gas", date: "15/02" },
  { id: 7, desc: "Aluguel - Apartamento", amount: -2800, type: "home", date: "10/02" },
];
const PIX_CONTACTS = [
  { id: 1, name: "Maria", initial: "M", color: "#C13584" },
  { id: 2, name: "Pedro", initial: "P", color: "#276EF1" },
  { id: 3, name: "Ana", initial: "A", color: "#00A86B" },
  { id: 4, name: "Lucas", initial: "L", color: "#FF6B35" },
  { id: 5, name: "Julia", initial: "J", color: "#9C27B0" },
];

const TransactionIcon = ({ type }) => {
  const icons = {
    salary: { bg: "#1B5E20", path: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
    cart: { bg: "#E65100", path: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" },
    pix: { bg: "#7B1FA2", path: "M13 17l5-5-5-5M6 17l5-5-5-5" },
    car: { bg: "#1565C0", path: "M19 17h2V7H3v10h2m2 0h10M7.5 17a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm9 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
    gas: { bg: "#F57F17", path: "M3 22V8l4-4h4l4 4v14M3 22h12M7 22v-4h4v4M14 8h4l2 2v6h-2" },
    home: { bg: "#AD1457", path: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    bag: { bg: "#4E342E", path: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" },
  };
  const icon = icons[type] || icons.bag;
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: icon.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d={icon.path}/></svg>
    </div>
  );
};

export default function Bank({ onNavigate }) {
  const [view, setView] = useState("home");
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(FALLBACK_BALANCE);
  const [transactions, setTransactions] = useState(FALLBACK_TRANSACTIONS);
  const [pixAmount, setPixAmount] = useState("");
  const [pixContact, setPixContact] = useState(PIX_CONTACTS[0]);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [receipt, setReceipt] = useState(null);

  // ── bank_init (load balance + recent) ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("bank_init");
      if (res?.balance !== undefined) setBalance(res.balance);
      if (res?.transactions?.length) {
        const typeMap = { credit: "salary", debit: "cart" };
        setTransactions(res.transactions.map((t, i) => ({
          id: t.id || i + 1, desc: t.description || "Transacao",
          amount: t.amount, type: typeMap[t.type] || "bag", date: t.created_at || "",
        })));
      }
    })();
  }, []);

  // ── bank_balance (refresh) ──
  const refreshBalance = useCallback(async () => {
    const res = await fetchBackend("bank_balance");
    if (res?.balance !== undefined) setBalance(res.balance);
  }, []);

  // ── bank_pix ──
  const handlePix = useCallback(async () => {
    if (!pixAmount || parseFloat(pixAmount) <= 0) return;
    const res = await fetchBackend("bank_pix", { to: pixContact.name, amount: parseFloat(pixAmount) });
    setBalance((prev) => prev - parseFloat(pixAmount));
    if (res?.receipt) setReceipt(res.receipt);
    setPixAmount(""); setView("home");
  }, [pixAmount, pixContact]);

  // ── bank_transfer ──
  const handleTransfer = useCallback(async () => {
    if (!transferTo.trim() || !transferAmount || parseFloat(transferAmount) <= 0) return;
    const res = await fetchBackend("bank_transfer", { to: transferTo.trim(), amount: parseFloat(transferAmount) });
    setBalance((prev) => prev - parseFloat(transferAmount));
    if (res?.receipt) setReceipt(res.receipt);
    setTransferTo(""); setTransferAmount(""); setView("home");
  }, [transferTo, transferAmount]);

  // ── bank_statement ──
  const loadStatement = useCallback(async () => {
    const res = await fetchBackend("bank_statement");
    if (res?.transactions?.length) {
      const typeMap = { credit: "salary", debit: "cart" };
      setTransactions(res.transactions.map((t, i) => ({
        id: t.id || i + 1, desc: t.description || "Transacao",
        amount: t.amount, type: typeMap[t.type] || "bag", date: t.created_at || "",
      })));
    }
    setView("statement");
  }, []);

  // ── bank_receipt ──
  const loadReceipt = useCallback(async (txId) => {
    const res = await fetchBackend("bank_receipt", { id: txId });
    if (res) setReceipt(res);
  }, []);

  // ============================================================
  // STATEMENT VIEW (V0 100%)
  // ============================================================
  if (view === "statement") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#1A1A2E", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2A2A3E" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Extrato Completo</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {transactions.map((tx) => (
            <button key={tx.id} onClick={() => loadReceipt(tx.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #2A2A3E", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBlockEnd: "1px solid #2A2A3E" }}>
              <TransactionIcon type={tx.type} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{tx.desc}</div>
                <div style={{ color: "#8E8E93", fontSize: 12 }}>{tx.date}</div>
              </div>
              <span style={{ color: tx.amount > 0 ? "#00C853" : "#fff", fontSize: 14, fontWeight: 700 }}>{tx.amount > 0 ? "+" : ""}R$ {Math.abs(tx.amount).toFixed(2).replace(".", ",")}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // PIX VIEW (V0 100%)
  // ============================================================
  if (view === "pix") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#1A1A2E", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: "#7B1FA2" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>PIX</span>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: "#8E8E93", fontSize: 13, marginBottom: 8 }}>Valor</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ color: "#7B1FA2", fontSize: 20, fontWeight: 600 }}>R$</span>
              <input value={pixAmount} onChange={(e) => setPixAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0,00" style={{ background: "none", border: "none", color: "#fff", fontSize: 40, fontWeight: 800, textAlign: "center", width: 200, outline: "none" }} />
            </div>
          </div>
          <div style={{ color: "#8E8E93", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Contatos PIX</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 24, overflowX: "auto" }}>
            {PIX_CONTACTS.map((c) => (
              <button key={c.id} onClick={() => setPixContact(c)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", border: pixContact.id === c.id ? "3px solid #7B1FA2" : "3px solid transparent" }}>{c.initial}</div>
                <span style={{ color: pixContact.id === c.id ? "#fff" : "#8E8E93", fontSize: 11 }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: 16, borderTop: "1px solid #2A2A3E" }}>
          <button onClick={handlePix} style={{ width: "100%", padding: "14px", borderRadius: 24, background: pixAmount ? "#7B1FA2" : "#333", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: pixAmount ? "pointer" : "default" }}>Enviar PIX</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // TRANSFER VIEW (V0 100%)
  // ============================================================
  if (view === "transfer") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#1A1A2E", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: "#7B1FA2" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Transferir</span>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#8E8E93", fontSize: 12, marginBottom: 6 }}>ID do Jogador</div>
            <input value={transferTo} onChange={(e) => setTransferTo(e.target.value)} placeholder="Nome ou ID" style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#2A2A3E", border: "1px solid #333", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <div style={{ color: "#8E8E93", fontSize: 13, marginBottom: 8 }}>Valor</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ color: "#7B1FA2", fontSize: 20, fontWeight: 600 }}>R$</span>
              <input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0,00" style={{ background: "none", border: "none", color: "#fff", fontSize: 40, fontWeight: 800, textAlign: "center", width: 200, outline: "none" }} />
            </div>
          </div>
        </div>
        <div style={{ padding: 16, borderTop: "1px solid #2A2A3E" }}>
          <button onClick={handleTransfer} style={{ width: "100%", padding: "14px", borderRadius: 24, background: transferAmount && transferTo ? "#7B1FA2" : "#333", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: transferAmount && transferTo ? "pointer" : "default" }}>Transferir</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // HOME VIEW (default — V0 100% Nubank purple)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#1A1A2E", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px", background: "linear-gradient(180deg, #7B1FA2 0%, #6A1B9A 100%)", borderRadius: "0 0 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="#fff"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Ola, Carlos</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setShowBalance(!showBalance)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">{showBalance ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 01-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}</svg>
            </button>
            <button onClick={refreshBalance} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 4 }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Conta</div>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>{showBalance ? `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ ••••••"}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "16px 16px 8px" }}>
        {[
          { label: "PIX", icon: "M13 17l5-5-5-5M6 17l5-5-5-5", action: () => setView("pix") },
          { label: "Transferir", icon: "M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3", action: () => setView("transfer") },
          { label: "Extrato", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", action: loadStatement },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.action} style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#2A2A3E", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2"><path d={btn.icon}/></svg>
            {btn.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "8px 16px" }}>
        <div style={{ padding: "14px", borderRadius: 12, background: "#2A2A3E" }}>
          <div style={{ color: "#8E8E93", fontSize: 12 }}>Cartao de Credito</div>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginTop: 4 }}>Fatura atual: R$ 1.234,56</div>
          <div style={{ height: 4, borderRadius: 2, background: "#333", marginTop: 8 }}><div style={{ height: "100%", width: "35%", borderRadius: 2, background: "#7B1FA2" }} /></div>
        </div>
      </div>
      <div style={{ padding: "4px 16px 8px" }}>
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "linear-gradient(135deg, #7B1FA2, #9C27B0)", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          <div style={{ flex: 1 }}><div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Emprestimo pre-aprovado</div><div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Ate R$ 50.000,00</div></div>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "8px 16px 4px", color: "#8E8E93", fontSize: 13, fontWeight: 600 }}>Ultimas transacoes</div>
        {transactions.slice(0, 5).map((tx) => (
          <button key={tx.id} onClick={() => loadReceipt(tx.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #2A2A3E", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBlockEnd: "1px solid #2A2A3E" }}>
            <TransactionIcon type={tx.type} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{tx.desc}</div>
              <div style={{ color: "#8E8E93", fontSize: 12 }}>{tx.date}</div>
            </div>
            <span style={{ color: tx.amount > 0 ? "#00C853" : "#fff", fontSize: 14, fontWeight: 700 }}>{tx.amount > 0 ? "+" : ""}R$ {Math.abs(tx.amount).toFixed(2).replace(".", ",")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Fleeca Bank — GTA corporate V0 100% + ALL backend handlers
// Handlers: bank_init, bank_balance, bank_transfer, bank_statement, bank_receipt
// Views: home | transfer | statement
// ============================================================

const FALLBACK_BALANCE = 45230.0;
const FALLBACK_TRANSACTIONS = [
  { id: 1, desc: "Deposito - Salario", amount: 15000, date: "19/02" },
  { id: 2, desc: "Transferencia - Casa", amount: -5200, date: "18/02" },
  { id: 3, desc: "Deposito - Venda Veiculo", amount: 32000, date: "17/02" },
  { id: 4, desc: "Saque ATM", amount: -2000, date: "16/02" },
  { id: 5, desc: "Pagamento - Seguro", amount: -1800, date: "15/02" },
];

export default function FleecaBank({ onNavigate }) {
  const [view, setView] = useState("home");
  const [balance, setBalance] = useState(FALLBACK_BALANCE);
  const [transactions, setTransactions] = useState(FALLBACK_TRANSACTIONS);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // ── bank_init ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("bank_init");
      if (res?.balance !== undefined) setBalance(res.balance);
      if (res?.transactions?.length) setTransactions(res.transactions.map((t, i) => ({ id: t.id || i + 1, desc: t.description || "Transacao", amount: t.amount, date: t.created_at || "" })));
    })();
  }, []);

  // ── bank_balance ──
  const refreshBalance = useCallback(async () => {
    const res = await fetchBackend("bank_balance");
    if (res?.balance !== undefined) setBalance(res.balance);
  }, []);

  // ── bank_transfer ──
  const handleTransfer = useCallback(async () => {
    if (!transferTo.trim() || !transferAmount || parseFloat(transferAmount) <= 0) return;
    await fetchBackend("bank_transfer", { to: transferTo.trim(), amount: parseFloat(transferAmount) });
    setBalance((prev) => prev - parseFloat(transferAmount));
    setTransferTo(""); setTransferAmount(""); setView("home");
  }, [transferTo, transferAmount]);

  // ── bank_statement ──
  const loadStatement = useCallback(async () => {
    const res = await fetchBackend("bank_statement");
    if (res?.transactions?.length) setTransactions(res.transactions.map((t, i) => ({ id: t.id || i + 1, desc: t.description || "Transacao", amount: t.amount, date: t.created_at || "" })));
    setView("statement");
  }, []);

  // ── bank_receipt ──
  const loadReceipt = useCallback(async (txId) => {
    await fetchBackend("bank_receipt", { id: txId });
  }, []);

  // ============================================================
  // STATEMENT VIEW (V0 100%)
  // ============================================================
  if (view === "statement") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0A1929", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1A2A3A" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Extrato</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {transactions.map((tx) => (
            <button key={tx.id} onClick={() => loadReceipt(tx.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #1A2A3A", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBlockEnd: "1px solid #1A2A3A" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: tx.amount > 0 ? "#1B5E20" : "#B71C1C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">{tx.amount > 0 ? <polyline points="7 13 12 8 17 13"/> : <polyline points="7 11 12 16 17 11"/>}</svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{tx.desc}</div>
                <div style={{ color: "#5A7A9A", fontSize: 12 }}>{tx.date}</div>
              </div>
              <span style={{ color: tx.amount > 0 ? "#4FC3F7" : "#fff", fontSize: 14, fontWeight: 700 }}>{tx.amount > 0 ? "+" : ""}R$ {Math.abs(tx.amount).toFixed(2).replace(".", ",")}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // TRANSFER VIEW (V0 100%)
  // ============================================================
  if (view === "transfer") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0A1929", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>Transferencia</span>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#5A7A9A", fontSize: 12, marginBottom: 6 }}>ID do Jogador</div>
            <input value={transferTo} onChange={(e) => setTransferTo(e.target.value)} placeholder="Nome ou ID" style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#0D2137", border: "1px solid #1A3A5A", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <div style={{ color: "#5A7A9A", fontSize: 13, marginBottom: 8 }}>Valor</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ color: "#4FC3F7", fontSize: 20, fontWeight: 600 }}>R$</span>
              <input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0,00" style={{ background: "none", border: "none", color: "#fff", fontSize: 40, fontWeight: 800, textAlign: "center", width: 200, outline: "none" }} />
            </div>
          </div>
        </div>
        <div style={{ padding: 16, borderTop: "1px solid #1A2A3A" }}>
          <button onClick={handleTransfer} style={{ width: "100%", padding: "14px", borderRadius: 10, background: transferTo && transferAmount ? "linear-gradient(135deg, #0D47A1, #1565C0)" : "#1A2A3A", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: transferTo && transferAmount ? "pointer" : "default" }}>Transferir</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // HOME VIEW (default — V0 100% GTA Fleeca dark blue)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#0A1929", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 16, background: "linear-gradient(180deg, #0D47A1 0%, #0A1929 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="#4FC3F7"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 10h20" stroke="#0A1929" strokeWidth="2"/></svg>
            <span style={{ color: "#4FC3F7", fontSize: 18, fontWeight: 800 }}>FLEECA</span>
          </div>
          <button onClick={refreshBalance} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          </button>
        </div>
        <div style={{ padding: 16, borderRadius: 16, background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #0D47A1 100%)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(79,195,247,0.1)" }} />
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 4 }}>Saldo Disponivel</div>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
            <span>Ag: 0001</span><span>CC: 12345-6</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "16px" }}>
        {[
          { label: "Transferir", icon: "M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3", action: () => setView("transfer") },
          { label: "Extrato", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", action: loadStatement },
          { label: "Depositar", icon: "M12 5v14M5 12l7 7 7-7", action: () => {} },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.action} style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "#0D2137", border: "1px solid #1A3A5A", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2"><path d={btn.icon}/></svg>
            {btn.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "4px 16px 8px", color: "#5A7A9A", fontSize: 13, fontWeight: 600 }}>Movimentacoes recentes</div>
        {transactions.slice(0, 5).map((tx) => (
          <button key={tx.id} onClick={() => loadReceipt(tx.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #1A2A3A", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBlockEnd: "1px solid #1A2A3A" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: tx.amount > 0 ? "#1B5E20" : "#B71C1C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">{tx.amount > 0 ? <polyline points="7 13 12 8 17 13"/> : <polyline points="7 11 12 16 17 11"/>}</svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{tx.desc}</div>
              <div style={{ color: "#5A7A9A", fontSize: 12 }}>{tx.date}</div>
            </div>
            <span style={{ color: tx.amount > 0 ? "#4FC3F7" : "#fff", fontSize: 14, fontWeight: 700 }}>{tx.amount > 0 ? "+" : ""}R$ {Math.abs(tx.amount).toFixed(2).replace(".", ",")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

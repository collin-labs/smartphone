import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// ============================================
// CORES Nubank Dark
// ============================================

const C = {
  bg: '#1A0533',
  bgLight: '#2D0A4E',
  card: '#3B1566',
  purple: '#820AD1',
  purpleLight: '#A44BDB',
  text: '#FFFFFF',
  textSec: '#C4A4E0',
  green: '#00C853',
  red: '#FF1744',
  separator: '#4A1A7A',
  inputBg: '#2D0A4E',
};

// ============================================
// ICONS
// ============================================

const Icons = {
  back: (
    <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
      <path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  eyeOpen: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#C4A4E0">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  ),
  eyeClosed: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#C4A4E0">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
    </svg>
  ),
  pix: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M15.45 12l4.22-4.22a1.5 1.5 0 000-2.12l-1.33-1.33a1.5 1.5 0 00-2.12 0L12 8.55 7.78 4.33a1.5 1.5 0 00-2.12 0L4.33 5.66a1.5 1.5 0 000 2.12L8.55 12l-4.22 4.22a1.5 1.5 0 000 2.12l1.33 1.33a1.5 1.5 0 002.12 0L12 15.45l4.22 4.22a1.5 1.5 0 002.12 0l1.33-1.33a1.5 1.5 0 000-2.12L15.45 12z"/>
    </svg>
  ),
  statement: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  arrowUp: <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF1744"><path d="M7 14l5-5 5 5H7z"/></svg>,
  arrowDown: <svg width="16" height="16" viewBox="0 0 24 24" fill="#00C853"><path d="M7 10l5 5 5-5H7z"/></svg>,
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Bank({ onNavigate }) {
  const [view, setView] = useState('home'); // home | pix | statement | receipt
  const [balance, setBalance] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // PIX form
  const [pixTo, setPixTo] = useState('');
  const [pixAmount, setPixAmount] = useState('');
  const [pixDesc, setPixDesc] = useState('');
  const [pixError, setPixError] = useState(null);
  const [pixSending, setPixSending] = useState(false);

  // Receipt
  const [receiptTx, setReceiptTx] = useState(null);

  // Contacts for autocomplete
  const [contacts, setContacts] = useState([]);

  // ============================================
  // Init
  // ============================================

  const loadData = useCallback(async () => {
    setLoading(true);
    const [balRes, stmtRes] = await Promise.all([
      fetchBackend('bank_balance'),
      fetchBackend('bank_statement', { limit: 20 }),
    ]);
    if (balRes?.ok) setBalance(balRes.balance || 0);
    if (stmtRes?.transactions) setTransactions(stmtRes.transactions);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (view === 'pix') {
      fetchBackend('contacts_list').then(res => {
        if (res?.contacts) setContacts(res.contacts);
      });
    }
  }, [view]);

  // ============================================
  // PUSHER: recebeu dinheiro
  // ============================================

  usePusherEvent('BANK_RECEIVED', useCallback((data) => {
    fetchBackend('bank_balance').then(res => {
      if (res?.ok) setBalance(res.balance || 0);
    });
    setTransactions(prev => [{
      ...data,
      direction: 'received',
      other_phone: data.from_phone,
      other_name: data.senderName,
    }, ...prev]);
    fetchClient('playSound', { sound: 'notification' });
  }, []));

  // ============================================
  // PIX
  // ============================================

  const handlePix = async () => {
    const amount = parseFloat(pixAmount.replace(',', '.'));
    if (!pixTo.trim()) { setPixError('Informe a chave PIX'); return; }
    if (!amount || amount <= 0) { setPixError('Valor inválido'); return; }
    if (amount > balance) { setPixError('Saldo insuficiente'); return; }

    setPixSending(true);
    setPixError(null);

    const res = await fetchBackend('bank_pix', {
      to: pixTo.trim(),
      amount,
      description: pixDesc.trim() || 'PIX',
    });

    setPixSending(false);

    if (res?.error) {
      setPixError(res.error);
      return;
    }

    if (res?.ok) {
      setBalance(res.newBalance);
      setReceiptTx({
        ...res.transaction,
        direction: 'sent',
        other_phone: pixTo.trim(),
      });
      setView('receipt');
      setPixTo('');
      setPixAmount('');
      setPixDesc('');
      fetchBackend('bank_statement', { limit: 20 }).then(r => {
        if (r?.transactions) setTransactions(r.transactions);
      });
    }
  };

  // ============================================
  // Helpers
  // ============================================

  const formatMoney = (v) => {
    return `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return 'Hoje, ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
      ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredContacts = useMemo(() => {
    if (!pixTo) return [];
    const q = pixTo.toLowerCase();
    return contacts.filter(c =>
      c.contact_name.toLowerCase().includes(q) || c.contact_phone.includes(q)
    ).slice(0, 5);
  }, [pixTo, contacts]);

  // ============================================
  // VIEW: Home
  // ============================================

  if (view === 'home') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        {/* Header roxo Nubank */}
        <div style={{
          background: `linear-gradient(135deg, ${C.purple} 0%, #6A0DAD 100%)`,
          padding: '16px 20px 24px',
          borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Nu</span>
            <button onClick={() => setBalanceVisible(v => !v)} style={btnStyle}>
              {balanceVisible ? Icons.eyeOpen : Icons.eyeClosed}
            </button>
          </div>

          <div style={{ color: C.textSec, fontSize: 14, marginBottom: 6 }}>Saldo disponível</div>
          <div style={{ color: '#fff', fontSize: 30, fontWeight: 700 }}>
            {balanceVisible ? formatMoney(balance) : 'R$ ••••••'}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, padding: '16px 20px' }}>
          <ActionBtn icon={Icons.pix} label="PIX" onClick={() => {
            setPixTo(''); setPixAmount(''); setPixDesc(''); setPixError(null);
            setView('pix');
          }} />
          <ActionBtn icon={Icons.statement} label="Extrato" onClick={() => setView('statement')} />
        </div>

        {/* Recent transactions */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>
          <div style={{ color: C.textSec, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Últimas movimentações
          </div>

          {loading ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 20 }}>Carregando...</div>
          ) : transactions.length === 0 ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 20 }}>
              Nenhuma movimentação
            </div>
          ) : (
            transactions.slice(0, 5).map(tx => (
              <TxRow
                key={tx.id}
                tx={tx}
                formatMoney={formatMoney}
                formatTime={formatTime}
                onClick={() => { setReceiptTx(tx); setView('receipt'); }}
              />
            ))
          )}
          <div style={{ height: 20 }} />
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: PIX
  // ============================================

  if (view === 'pix') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <BankHeader title="PIX" onBack={() => setView('home')} />

        <div style={{ flex: 1, padding: '16px 20px', overflow: 'auto' }}>
          <label style={{ color: C.textSec, fontSize: 13, marginBottom: 6, display: 'block' }}>
            Chave PIX (número do celular)
          </label>
          <input
            type="text"
            placeholder="Ex: 001-001"
            value={pixTo}
            onChange={e => setPixTo(e.target.value)}
            style={inputStyle}
          />

          {/* Autocomplete */}
          {filteredContacts.length > 0 && (
            <div style={{ background: C.card, borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
              {filteredContacts.map(c => (
                <div
                  key={c.id}
                  onClick={() => setPixTo(c.contact_phone)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', cursor: 'pointer',
                    borderBottom: `0.5px solid ${C.separator}`,
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 16, background: C.purple,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: 14 }}>{c.contact_name[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <div style={{ color: C.text, fontSize: 14 }}>{c.contact_name}</div>
                    <div style={{ color: C.textSec, fontSize: 12 }}>{c.contact_phone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label style={{ color: C.textSec, fontSize: 13, marginBottom: 6, display: 'block', marginTop: 16 }}>Valor</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: C.textSec, fontSize: 16,
            }}>R$</span>
            <input
              type="text"
              placeholder="0,00"
              value={pixAmount}
              onChange={e => setPixAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
              style={{ ...inputStyle, paddingLeft: 42 }}
            />
          </div>

          <label style={{ color: C.textSec, fontSize: 13, marginBottom: 6, display: 'block' }}>Descrição (opcional)</label>
          <input
            type="text"
            placeholder="Ex: Aluguel"
            value={pixDesc}
            onChange={e => setPixDesc(e.target.value)}
            style={inputStyle}
          />

          <div style={{ color: C.textSec, fontSize: 13, marginTop: 4, marginBottom: 24 }}>
            Saldo disponível: {formatMoney(balance)}
          </div>

          {pixError && (
            <div style={{
              background: 'rgba(255,23,68,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            }}>
              <span style={{ color: C.red, fontSize: 14 }}>{pixError}</span>
            </div>
          )}

          <button
            onClick={handlePix}
            disabled={pixSending}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              background: pixSending ? C.card : C.purple, color: '#fff',
              fontSize: 16, fontWeight: 600, border: 'none',
              cursor: pixSending ? 'default' : 'pointer',
            }}
          >
            {pixSending ? 'Enviando...' : 'Transferir via PIX'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: Statement
  // ============================================

  if (view === 'statement') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <BankHeader title="Extrato" onBack={() => setView('home')} />
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px' }}>
          {transactions.length === 0 ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Nenhuma movimentação</div>
          ) : (
            transactions.map(tx => (
              <TxRow
                key={tx.id} tx={tx} formatMoney={formatMoney}
                formatTime={formatTime}
                onClick={() => { setReceiptTx(tx); setView('receipt'); }}
              />
            ))
          )}
          <div style={{ height: 20 }} />
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: Receipt
  // ============================================

  if (view === 'receipt' && receiptTx) {
    const isSent = receiptTx.direction === 'sent';
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <BankHeader title="Comprovante" onBack={() => { setReceiptTx(null); setView('home'); }} />

        <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
          <div style={{ background: C.card, borderRadius: 16, padding: '24px 20px' }}>
            {/* Status icon */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 26,
                background: isSent ? 'rgba(255,23,68,0.15)' : 'rgba(0,200,83,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <span style={{ fontSize: 24, color: isSent ? C.red : C.green }}>
                  {isSent ? '↗' : '↙'}
                </span>
              </div>
              <div style={{ color: C.text, fontSize: 14 }}>
                {isSent ? 'Transferência enviada' : 'Transferência recebida'}
              </div>
            </div>

            {/* Amount */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ color: isSent ? C.red : C.green, fontSize: 32, fontWeight: 700 }}>
                {isSent ? '- ' : '+ '}{formatMoney(receiptTx.amount)}
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ReceiptRow label="Tipo" value={receiptTx.type?.toUpperCase() || 'PIX'} />
              <ReceiptRow
                label={isSent ? 'Destinatário' : 'Remetente'}
                value={receiptTx.other_name || receiptTx.other_phone || (isSent ? receiptTx.to_phone : receiptTx.from_phone)}
              />
              <ReceiptRow
                label="Número"
                value={receiptTx.other_phone || (isSent ? receiptTx.to_phone : receiptTx.from_phone)}
              />
              {receiptTx.description && <ReceiptRow label="Descrição" value={receiptTx.description} />}
              <ReceiptRow label="Data" value={formatDate(receiptTx.created_at)} />
              <ReceiptRow label="ID da transação" value={`#${receiptTx.id}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================
// SUB-COMPONENTS
// ============================================

function BankHeader({ title, onBack }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      background: C.purple, flexShrink: 0,
    }}>
      <button onClick={onBack} style={btnStyle}>{Icons.back}</button>
      <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>{title}</span>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 8, padding: '16px 8px', background: C.card, borderRadius: 12,
      border: 'none', cursor: 'pointer',
    }}>
      {icon}
      <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{label}</span>
    </button>
  );
}

function TxRow({ tx, formatMoney, formatTime, onClick }) {
  const isSent = tx.direction === 'sent';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0', borderBottom: `0.5px solid ${C.separator}`, cursor: 'pointer',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 20,
        background: isSent ? 'rgba(255,23,68,0.12)' : 'rgba(0,200,83,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {isSent ? Icons.arrowUp : Icons.arrowDown}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontSize: 15 }}>
          {tx.other_name || tx.other_phone || (isSent ? tx.to_phone : tx.from_phone)}
        </div>
        <div style={{ color: C.textSec, fontSize: 12 }}>
          {tx.type?.toUpperCase()} · {formatTime(tx.created_at)}
        </div>
      </div>
      <div style={{ color: isSent ? C.red : C.green, fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
        {isSent ? '-' : '+'} {formatMoney(tx.amount)}
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }) {
  return (
    <div style={{ borderBottom: `0.5px solid ${C.separator}`, paddingBottom: 12 }}>
      <div style={{ color: C.textSec, fontSize: 12, marginBottom: 2 }}>{label}</div>
      <div style={{ color: C.text, fontSize: 15 }}>{value}</div>
    </div>
  );
}

// ============================================
// STYLES
// ============================================

const btnStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: 0 };

const inputStyle = {
  width: '100%', padding: '12px 14px', background: C.inputBg,
  border: `1px solid ${C.separator}`, borderRadius: 8,
  color: C.text, fontSize: 16, fontFamily: 'inherit', outline: 'none',
  marginBottom: 12, boxSizing: 'border-box',
};

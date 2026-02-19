import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';
import { getIncomingCall, clearIncomingCall } from '../store/callState';

// ============================================
// CORES iOS
// ============================================

const C = {
  green: '#30D158',
  red: '#FF3B30',
  blue: '#007AFF',
  bg: '#000000',
  card: '#1C1C1E',
  card2: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  separator: '#38383A',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Phone({ onNavigate }) {
  const [tab, setTab] = useState('keypad'); // keypad | recents
  const [dialNumber, setDialNumber] = useState('');
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Call state
  const [activeCall, setActiveCall] = useState(null); // { callId, phone, name, direction, status, startTime }
  const [incomingCall, setIncomingCall] = useState(null); // { callId, callerPhone, callerName }
  const [callDuration, setCallDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [callError, setCallError] = useState(null);
  const timerRef = useRef(null);

  // ============================================
  // Carregar histórico
  // ============================================

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('call_history');
    if (res?.calls) setCallHistory(res.calls);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Check global store for pending incoming call (set by PhoneShell before mount)
  useEffect(() => {
    const pending = getIncomingCall();
    if (pending) {
      setIncomingCall({
        callId: pending.callId,
        callerPhone: pending.callerPhone,
        callerName: pending.callerName,
      });
      clearIncomingCall();
    }
  }, []);

  // ============================================
  // Call timer
  // ============================================

  useEffect(() => {
    if (activeCall?.status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCall?.status]);

  // ============================================
  // PUSHER: Eventos de chamada em tempo real
  // ============================================

  usePusherEvent('CALL_INCOMING', useCallback((data) => {
    setIncomingCall({
      callId: data.callId,
      callerPhone: data.callerPhone,
      callerName: data.callerName,
    });
    fetchClient('playSound', { sound: 'ring' });
  }, []));

  usePusherEvent('CALL_ACCEPTED', useCallback((data) => {
    setIncomingCall(null);
    setActiveCall(prev => prev ? { ...prev, status: 'connected' } : {
      callId: data.callId,
      phone: data.callerPhone || data.receiverPhone,
      name: null,
      direction: 'incoming',
      status: 'connected',
    });
    setCallDuration(0);
  }, []));

  usePusherEvent('CALL_REJECTED', useCallback((data) => {
    fetchClient('playSound', { sound: 'hangup' });
    fetchClient('stopCallAnim');
    setActiveCall(null);
    setCallDuration(0);
  }, []));

  usePusherEvent('CALL_ENDED', useCallback((data) => {
    fetchClient('playSound', { sound: 'hangup' });
    fetchClient('stopCallAnim');
    setActiveCall(null);
    setIncomingCall(null);
    setCallDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    loadHistory();
  }, [loadHistory]));

  usePusherEvent('CALL_CANCELLED', useCallback(() => {
    fetchClient('stopCallAnim');
    setIncomingCall(null);
  }, []));

  // ============================================
  // Actions
  // ============================================

  const handleDial = async (number) => {
    const target = number || dialNumber;
    if (!target || target.length < 3) return;

    const res = await fetchBackend('call_init', { phone: target });

    if (res?.error) {
      setCallError(res.error);
      setTimeout(() => setCallError(null), 3000);
      return;
    }

    fetchClient('playSound', { sound: 'dial' });
    fetchClient('startCallAnim');

    setActiveCall({
      callId: res.callId,
      phone: target,
      name: null,
      direction: 'outgoing',
      status: 'ringing',
    });
    setCallDuration(0);
    setDialNumber('');
  };

  const handleAccept = async () => {
    if (!incomingCall) return;
    await fetchBackend('call_accept', { callId: incomingCall.callId });

    fetchClient('startCallAnim');

    setActiveCall({
      callId: incomingCall.callId,
      phone: incomingCall.callerPhone,
      name: incomingCall.callerName,
      direction: 'incoming',
      status: 'connected',
    });
    setIncomingCall(null);
    setCallDuration(0);
  };

  const handleReject = async () => {
    if (!incomingCall) return;
    await fetchBackend('call_reject', { callId: incomingCall.callId });
    fetchClient('playSound', { sound: 'hangup' });
    setIncomingCall(null);
  };

  const handleEnd = async () => {
    if (!activeCall) return;
    await fetchBackend('call_end', { callId: activeCall.callId });
    fetchClient('playSound', { sound: 'hangup' });
    fetchClient('stopCallAnim');
    setActiveCall(null);
    setCallDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    loadHistory();
  };

  const handleCancel = async () => {
    if (!activeCall) return;
    await fetchBackend('call_cancel', { callId: activeCall.callId });
    fetchClient('playSound', { sound: 'hangup' });
    fetchClient('stopCallAnim');
    setActiveCall(null);
    setCallDuration(0);
  };

  const addDigit = (digit) => {
    if (dialNumber.length < 15) setDialNumber(prev => prev + digit);
  };

  const removeDigit = () => {
    setDialNumber(prev => prev.slice(0, -1));
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // ============================================
  // INCOMING CALL OVERLAY
  // ============================================

  if (incomingCall) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #1C1C1E 0%, #000 100%)',
        padding: '60px 20px 40px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: C.textSecondary, fontSize: 15, marginBottom: 8 }}>chamada recebida</div>
          <div style={{ color: C.textPrimary, fontSize: 30, fontWeight: 300, marginBottom: 4 }}>
            {incomingCall.callerName || incomingCall.callerPhone}
          </div>
          {incomingCall.callerName && (
            <div style={{ color: C.textSecondary, fontSize: 16 }}>{incomingCall.callerPhone}</div>
          )}
        </div>

        {/* Avatar */}
        <div style={{
          width: 100, height: 100, borderRadius: 50, background: '#636366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 44, color: '#AEAEB2', fontWeight: 300 }}>
            {(incomingCall.callerName || incomingCall.callerPhone)[0]?.toUpperCase()}
          </span>
        </div>

        {/* Accept / Reject buttons */}
        <div style={{ display: 'flex', gap: 60 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button onClick={handleReject} style={{
              width: 64, height: 64, borderRadius: 32, background: C.red,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PhoneIcon rotated />
            </button>
            <span style={{ color: C.red, fontSize: 13 }}>Recusar</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button onClick={handleAccept} style={{
              width: 64, height: 64, borderRadius: 32, background: C.green,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PhoneIcon />
            </button>
            <span style={{ color: C.green, fontSize: 13 }}>Aceitar</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ACTIVE CALL SCREEN
  // ============================================

  if (activeCall) {
    const isRinging = activeCall.status === 'ringing';
    const isConnected = activeCall.status === 'connected';

    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #1a1a1e 0%, #000 100%)',
        padding: '60px 20px 40px',
      }}>
        {/* Top info */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: C.textPrimary, fontSize: 30, fontWeight: 300, marginBottom: 4 }}>
            {activeCall.name || activeCall.phone}
          </div>
          <div style={{ color: C.textSecondary, fontSize: 16 }}>
            {isRinging ? 'chamando...' : formatDuration(callDuration)}
          </div>
        </div>

        {/* Avatar */}
        <div style={{
          width: 100, height: 100, borderRadius: 50, background: '#636366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 44, color: '#AEAEB2', fontWeight: 300 }}>
            {(activeCall.name || activeCall.phone)[0]?.toUpperCase()}
          </span>
        </div>

        {/* Controls */}
        <div>
          {isConnected && (
            <div style={{ display: 'flex', gap: 32, marginBottom: 40, justifyContent: 'center' }}>
              <CallControl
                icon="🔇"
                label={muted ? 'Ativo' : 'Mudo'}
                active={muted}
                onClick={() => setMuted(v => !v)}
              />
              <CallControl
                icon="🔊"
                label="Alto-falante"
                active={speaker}
                onClick={() => setSpeaker(v => !v)}
              />
            </div>
          )}

          {/* End call */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button onClick={isRinging ? handleCancel : handleEnd} style={{
                width: 64, height: 64, borderRadius: 32, background: C.red,
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <PhoneIcon rotated />
              </button>
              <span style={{ color: C.red, fontSize: 13 }}>
                {isRinging ? 'Cancelar' : 'Encerrar'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN VIEW: Tabs (Recentes / Teclado)
  // ============================================

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Error toast */}
      {callError && (
        <div style={{
          position: 'absolute', top: 12, left: 16, right: 16, zIndex: 50,
          background: 'rgba(255,59,48,0.9)', borderRadius: 12, padding: '10px 16px',
          backdropFilter: 'blur(20px)', textAlign: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{callError}</span>
        </div>
      )}

      {/* Tab bar */}
      <div style={{
        display: 'flex', padding: '12px 16px 8px',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
      }}>
        {['recents', 'keypad'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
              background: tab === t ? C.blue : 'transparent',
              borderRadius: 8, color: tab === t ? '#fff' : C.textSecondary,
              fontSize: 14, fontWeight: 600, transition: 'all 150ms',
            }}
          >
            {t === 'recents' ? 'Recentes' : 'Teclado'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'keypad' ? (
          <KeypadView
            number={dialNumber}
            onDigit={addDigit}
            onDelete={removeDigit}
            onCall={() => handleDial()}
          />
        ) : (
          <RecentsView
            calls={callHistory}
            loading={loading}
            formatTime={formatTime}
            onCall={handleDial}
            onSms={(phone) => onNavigate?.('sms', { to: phone })}
            onRefresh={loadHistory}
          />
        )}
      </div>

      {/* Home indicator */}
      <div style={{ height: 20, background: C.bg }} />
    </div>
  );
}

// ============================================
// KEYPAD VIEW
// ============================================

function KeypadView({ number, onDigit, onDelete, onCall }) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  const subLabels = {
    '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
    '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
    '0': '+',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 32px 0', height: '100%', justifyContent: 'space-between',
    }}>
      {/* Display */}
      <div style={{
        height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', marginBottom: 8,
      }}>
        <span style={{
          color: C.textPrimary, fontSize: number.length > 10 ? 28 : 34,
          fontWeight: 300, letterSpacing: 2, textAlign: 'center',
        }}>
          {number || '\u00A0'}
        </span>
      </div>

      {/* Keys */}
      <div style={{ width: '100%' }}>
        {keys.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            {row.map(key => (
              <button
                key={key}
                onClick={() => onDigit(key)}
                style={{
                  width: 75, height: 75, borderRadius: 38,
                  background: C.card2, border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 100ms',
                }}
                onMouseDown={e => e.currentTarget.style.background = '#4A4A4E'}
                onMouseUp={e => e.currentTarget.style.background = C.card2}
                onMouseLeave={e => e.currentTarget.style.background = C.card2}
              >
                <span style={{ color: C.textPrimary, fontSize: 32, fontWeight: 300, lineHeight: 1 }}>
                  {key}
                </span>
                {subLabels[key] && (
                  <span style={{ color: C.textPrimary, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, marginTop: 2 }}>
                    {subLabels[key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Call / Delete row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', padding: '4px 0 12px',
      }}>
        <div style={{ width: 75 }} />
        <button
          onClick={onCall}
          disabled={!number}
          style={{
            width: 75, height: 75, borderRadius: 38,
            background: number ? C.green : '#1a3d1a',
            border: 'none', cursor: number ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: number ? 1 : 0.5, transition: 'all 150ms',
          }}
        >
          <PhoneIcon />
        </button>
        <div style={{ width: 75, display: 'flex', justifyContent: 'center' }}>
          {number && (
            <button onClick={onDelete} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 8,
            }}>
              <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
                <path d="M10 1H24a3 3 0 013 3v12a3 3 0 01-3 3H10l-9-9 9-9z" stroke="#8E8E93" strokeWidth="1.5"/>
                <path d="M14 7l6 6M20 7l-6 6" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// RECENTS VIEW
// ============================================

function RecentsView({ calls, loading, formatTime, onCall, onSms, onRefresh }) {
  if (loading) {
    return (
      <div style={{ color: C.textSecondary, textAlign: 'center', paddingTop: 40, fontSize: 15 }}>
        Carregando...
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div style={{ color: C.textSecondary, textAlign: 'center', paddingTop: 40, fontSize: 15 }}>
        Nenhuma chamada recente
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {calls.map((call, i) => {
        const isMissed = call.status === 'missed' || call.status === 'rejected';
        const icon = call.direction === 'outgoing' ? '↗' : '↙';
        const displayName = call.other_name || call.other_phone;

        return (
          <div
            key={call.id || i}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0', borderBottom: `0.5px solid ${C.separator}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <span style={{
                fontSize: 16,
                color: call.direction === 'outgoing' ? C.green : (isMissed ? C.red : C.green),
              }}>
                {icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: isMissed ? C.red : C.textPrimary,
                  fontSize: 16, fontWeight: isMissed ? 500 : 400,
                }}>
                  {displayName}
                </div>
                <div style={{ color: C.textSecondary, fontSize: 13 }}>
                  {call.direction === 'outgoing' ? 'Efetuada' : 'Recebida'}
                  {call.duration > 0 && ` · ${formatDurationShort(call.duration)}`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: C.textSecondary, fontSize: 14 }}>
                {formatTime(call.created_at)}
              </span>
              <button
                onClick={() => onSms(call.other_phone)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 4, display: 'flex',
                }}
                title="Enviar SMS"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#8E8E93">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </button>
              <button
                onClick={() => onCall(call.other_phone)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 4, display: 'flex',
                }}
                title="Ligar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={C.blue}>
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function formatDurationShort(seconds) {
  if (!seconds || seconds < 1) return '';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function CallControl({ icon, label, active, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button onClick={onClick} style={{
        width: 52, height: 52, borderRadius: 26,
        background: active ? '#fff' : 'rgba(255,255,255,0.1)',
        border: 'none', cursor: 'pointer', fontSize: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms',
        filter: active ? 'none' : 'grayscale(0)',
      }}>
        {icon}
      </button>
      <span style={{ color: '#fff', fontSize: 12 }}>{label}</span>
    </div>
  );
}

function PhoneIcon({ rotated }) {
  return (
    <svg
      width="28" height="28" viewBox="0 0 24 24" fill="white"
      style={{ transform: rotated ? 'rotate(135deg)' : 'none' }}
    >
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
    </svg>
  );
}

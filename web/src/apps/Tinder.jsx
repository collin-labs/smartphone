import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

const C = {
  bg: '#111418', card: '#1C1F24', text: '#fff', textSec: '#8E8E93',
  pink: '#FD297B', orange: '#FF6B6B', gold: '#FFD700',
  gradient: 'linear-gradient(135deg, #FD297B 0%, #FF655B 50%, #FF9A44 100%)',
  separator: '#2C2C2E', green: '#00E676', red: '#FF1744',
};

export default function Tinder({ onNavigate }) {
  const [view, setView] = useState('discover'); // discover | matches | chat | setup | matchAnim
  const [profile, setProfile] = useState(null);
  const [cards, setCards] = useState([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const msgEndRef = useRef(null);

  // Setup form
  const [setupName, setSetupName] = useState('');
  const [setupAge, setSetupAge] = useState('');
  const [setupBio, setSetupBio] = useState('');
  const [setupGender, setSetupGender] = useState('male');
  const [setupInterest, setSetupInterest] = useState('female');

  const loadProfile = useCallback(async () => {
    const res = await fetchBackend('tinder_profile');
    if (res?.profile) {
      setProfile(res.profile);
      return true;
    }
    return false;
  }, []);

  const loadDiscover = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('tinder_discover');
    if (res?.profiles) { setCards(res.profiles); setCardIdx(0); }
    setLoading(false);
  }, []);

  const loadMatches = useCallback(async () => {
    const res = await fetchBackend('tinder_matches');
    if (res?.matches) setMatches(res.matches);
  }, []);

  useEffect(() => {
    (async () => {
      const hasProfile = await loadProfile();
      if (!hasProfile) { setView('setup'); setLoading(false); return; }
      await loadDiscover();
    })();
  }, [loadProfile, loadDiscover]);

  usePusherEvent('TINDER_MATCH', useCallback((data) => {
    setMatchedProfile(data.profile);
    setView('matchAnim');
    fetchClient('playSound', { sound: 'notification' });
  }, []));

  usePusherEvent('TINDER_MESSAGE', useCallback((data) => {
    if (activeMatch && data.matchId === activeMatch.match_id) {
      setMessages(prev => [...prev, data.message]);
    }
  }, [activeMatch]));

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Setup
  const handleSetup = async () => {
    if (!setupName.trim() || !setupAge) return;
    const res = await fetchBackend('tinder_setup', {
      name: setupName, age: parseInt(setupAge), bio: setupBio,
      gender: setupGender, interest: setupInterest,
    });
    if (res?.ok) {
      await loadProfile();
      await loadDiscover();
      setView('discover');
    }
  };

  // Swipe
  const handleSwipe = async (direction) => {
    const target = cards[cardIdx];
    if (!target) return;

    const res = await fetchBackend('tinder_swipe', { targetId: target.id, direction });
    if (res?.match) {
      setMatchedProfile(res.matchedProfile);
      setView('matchAnim');
    }

    if (cardIdx < cards.length - 1) setCardIdx(i => i + 1);
    else { setCards([]); loadDiscover(); }
  };

  // Chat
  const openChat = async (match) => {
    setActiveMatch(match);
    setView('chat');
    const res = await fetchBackend('tinder_messages', { matchId: match.match_id });
    if (res?.messages) setMessages(res.messages);
  };

  const sendMsg = async () => {
    if (!msgText.trim() || !activeMatch) return;
    const res = await fetchBackend('tinder_send', { matchId: activeMatch.match_id, message: msgText });
    if (res?.ok) { setMessages(prev => [...prev, res.message]); setMsgText(''); }
  };

  const currentCard = cards[cardIdx];

  // ============================================
  // Setup
  // ============================================
  if (view === 'setup') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ padding: '20px 16px 12px', textAlign: 'center' }}>
          <span style={{ fontSize: 36 }}>🔥</span>
          <div style={{ color: C.text, fontSize: 22, fontWeight: 700, marginTop: 8 }}>Criar Perfil</div>
        </div>
        <div style={{ flex: 1, padding: '0 20px', overflow: 'auto' }}>
          <label style={labelStyle}>Nome</label>
          <input type="text" value={setupName} onChange={e => setSetupName(e.target.value)} placeholder="Seu nome" style={inputStyle} />
          <label style={labelStyle}>Idade</label>
          <input type="number" value={setupAge} onChange={e => setSetupAge(e.target.value)} placeholder="18" style={inputStyle} />
          <label style={labelStyle}>Bio</label>
          <textarea value={setupBio} onChange={e => setSetupBio(e.target.value)} placeholder="Fale sobre você..." style={{ ...inputStyle, minHeight: 60, resize: 'none' }} />
          <label style={labelStyle}>Gênero</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[['male', 'Homem'], ['female', 'Mulher']].map(([v, l]) => (
              <button key={v} onClick={() => setSetupGender(v)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: setupGender === v ? C.pink : C.card, color: '#fff', fontWeight: 600 }}>{l}</button>
            ))}
          </div>
          <label style={labelStyle}>Interesse</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[['male', 'Homens'], ['female', 'Mulheres']].map(([v, l]) => (
              <button key={v} onClick={() => setSetupInterest(v)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: setupInterest === v ? C.pink : C.card, color: '#fff', fontWeight: 600 }}>{l}</button>
            ))}
          </div>
          <button onClick={handleSetup} style={{ width: '100%', padding: '14px', borderRadius: 24, border: 'none', background: C.gradient, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Começar</button>
        </div>
      </div>
    );
  }

  // ============================================
  // Match Animation
  // ============================================
  if (view === 'matchAnim') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.bg, textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🔥</div>
        <div style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>É um Match!</div>
        <div style={{ color: C.textSec, fontSize: 15, marginBottom: 24 }}>Você e {matchedProfile?.name || 'alguém'} curtiram um ao outro</div>
        <button onClick={() => { loadMatches(); setView('matches'); }} style={{ padding: '12px 40px', borderRadius: 24, border: 'none', background: C.gradient, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}>Ver matches</button>
        <button onClick={() => setView('discover')} style={{ ...btnS, color: C.textSec, fontSize: 14 }}>Continuar deslizando</button>
      </div>
    );
  }

  // ============================================
  // Chat
  // ============================================
  if (view === 'chat' && activeMatch) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => { setView('matches'); loadMatches(); }} style={btnS}>
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: C.textSec, fontSize: 14 }}>{activeMatch.other?.name?.[0]}</span>
          </div>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>{activeMatch.other?.name}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {messages.map(m => {
            const isMe = m.sender_id === profile?.id;
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                <div style={{
                  maxWidth: '75%', padding: '8px 12px', borderRadius: 18,
                  background: isMe ? C.pink : C.card, color: '#fff', fontSize: 15,
                }}>
                  {m.message}
                </div>
              </div>
            );
          })}
          <div ref={msgEndRef} />
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '6px 8px 12px', borderTop: `0.5px solid ${C.separator}` }}>
          <input type="text" value={msgText} onChange={e => setMsgText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder="Mensagem..." style={{ flex: 1, background: C.card, borderRadius: 24, padding: '10px 16px', border: 'none', outline: 'none', color: '#fff', fontSize: 15, fontFamily: 'inherit' }} />
          {msgText.trim() && (
            <button onClick={sendMsg} style={{ width: 40, height: 40, borderRadius: 20, background: C.gradient, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // Matches
  // ============================================
  if (view === 'matches') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('discover')} style={btnS}>
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>Matches</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {matches.length === 0 ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Nenhum match ainda</div>
          ) : matches.map(m => (
            <div key={m.match_id} onClick={() => openChat(m)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: `0.5px solid ${C.separator}`, cursor: 'pointer',
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 25, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: C.textSec, fontSize: 20 }}>{m.other?.name?.[0]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>{m.other?.name}, {m.other?.age}</div>
                <div style={{ color: C.textSec, fontSize: 13 }}>{m.lastMessage || 'Diga oi! 👋'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================
  // Discover (Swipe)
  // ============================================
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
        <button onClick={() => { loadMatches(); setView('matches'); }} style={btnS}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
        </button>
        <span style={{ fontSize: 28 }}>🔥</span>
        <div style={{ width: 24 }} />
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px 16px' }}>
        {loading ? (
          <div style={{ color: C.textSec }}>Carregando...</div>
        ) : !currentCard ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
            <div style={{ color: C.textSec, fontSize: 15 }}>Sem mais perfis por agora</div>
          </div>
        ) : (
          <div style={{
            width: '100%', aspectRatio: '3/4', borderRadius: 16, overflow: 'hidden', position: 'relative',
            background: `linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 100%)`,
          }}>
            {/* Profile content */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
              <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{currentCard.name}, {currentCard.age}</div>
              {currentCard.bio && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>{currentCard.bio}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Swipe buttons */}
      {currentCard && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '0 0 20px' }}>
          <button onClick={() => handleSwipe('left')} style={{
            width: 60, height: 60, borderRadius: 30, border: `2px solid ${C.red}`, background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <span style={{ fontSize: 28, color: C.red }}>✕</span>
          </button>
          <button onClick={() => handleSwipe('right')} style={{
            width: 60, height: 60, borderRadius: 30, border: `2px solid ${C.green}`, background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <span style={{ fontSize: 28, color: C.green }}>♥</span>
          </button>
        </div>
      )}
    </div>
  );
}

const btnS = { background: 'none', border: 'none', cursor: 'pointer', padding: 0 };
const labelStyle = { color: '#8E8E93', fontSize: 13, display: 'block', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '12px 14px', background: '#1C1F24', border: '1px solid #2C2C2E', borderRadius: 8, color: '#fff', fontSize: 15, fontFamily: 'inherit', outline: 'none', marginBottom: 14, boxSizing: 'border-box' };

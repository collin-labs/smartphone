import { useState, useEffect, useCallback } from 'react';
import { fetchBackend } from '../hooks/useNui';

const C = {
  bg: '#000', card: '#16181C', text: '#E7E9EA', textSec: '#71767B',
  separator: '#2F3336', blue: '#1D9BF0', red: '#F91880', like: '#F91880',
};

export default function Twitter({ onNavigate }) {
  const [tab, setTab] = useState('feed'); // feed | search | profile
  const [view, setView] = useState('main'); // main | compose | viewProfile
  const [tweets, setTweets] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [myProfileId, setMyProfileId] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [viewTweets, setViewTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [composeText, setComposeText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('tw_feed');
    if (res?.tweets) setTweets(res.tweets);
    if (res?.myProfileId) setMyProfileId(res.myProfileId);
    setLoading(false);
  }, []);

  const loadProfile = useCallback(async () => {
    const res = await fetchBackend('tw_profile');
    if (res?.profile) setMyProfile(res.profile);
    if (res?.tweets) setViewTweets(res.tweets);
    if (res?.myProfileId) setMyProfileId(res.myProfileId);
  }, []);

  useEffect(() => {
    if (tab === 'feed') loadFeed();
    else if (tab === 'profile') loadProfile();
  }, [tab, loadFeed, loadProfile]);

  const handleTweet = async () => {
    if (!composeText.trim()) return;
    const res = await fetchBackend('tw_tweet', { content: composeText.trim() });
    if (res?.ok) {
      setComposeText('');
      setView('main');
      if (res.tweet) setTweets(prev => [res.tweet, ...prev]);
    }
  };

  const handleLike = async (tweetId) => {
    const res = await fetchBackend('tw_like', { tweetId });
    if (res?.ok) {
      const update = t => t.id === tweetId ? { ...t, is_liked: res.liked ? 1 : 0, likes_count: t.likes_count + (res.liked ? 1 : -1) } : t;
      setTweets(prev => prev.map(update));
      setViewTweets(prev => prev.map(update));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const res = await fetchBackend('tw_search', { query: searchQuery });
    if (res?.tweets) setSearchResults(res.tweets);
  };

  const openProfile = async (profileId) => {
    const res = await fetchBackend('tw_profile', { profileId });
    if (res?.profile) { setViewProfile(res.profile); setViewTweets(res.tweets || []); setView('viewProfile'); }
  };

  const timeAgo = (d) => {
    if (!d) return '';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'agora';
    if (s < 3600) return `${Math.floor(s/60)}min`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  const TweetItem = ({ t }) => (
    <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
      <div onClick={() => openProfile(t.profile_id)} style={{ width: 40, height: 40, borderRadius: 20, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
        <span style={{ color: C.textSec, fontSize: 16 }}>{t.display_name?.[0]?.toUpperCase() || t.username?.[0]?.toUpperCase() || '?'}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span onClick={() => openProfile(t.profile_id)} style={{ color: C.text, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{t.display_name}</span>
          {t.verified === 1 && <span style={{ color: C.blue, fontSize: 12 }}>✓</span>}
          <span style={{ color: C.textSec, fontSize: 13 }}>@{t.username}</span>
          <span style={{ color: C.textSec, fontSize: 13 }}>· {timeAgo(t.created_at)}</span>
        </div>
        <div style={{ color: C.text, fontSize: 15, lineHeight: 1.4, marginTop: 4, wordBreak: 'break-word' }}>{t.content}</div>
        <div style={{ display: 'flex', gap: 32, marginTop: 10 }}>
          <button onClick={() => handleLike(t.id)} style={{ ...btn, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={t.is_liked ? C.like : 'none'} stroke={t.is_liked ? C.like : C.textSec} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            {t.likes_count > 0 && <span style={{ color: t.is_liked ? C.like : C.textSec, fontSize: 13 }}>{t.likes_count}</span>}
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // Compose
  // ============================================
  if (view === 'compose') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('main')} style={{ ...btn, color: C.text, fontSize: 15 }}>Cancelar</button>
          <button onClick={handleTweet} disabled={!composeText.trim()} style={{
            background: composeText.trim() ? C.blue : '#1A8CD8', color: '#fff', border: 'none', borderRadius: 20,
            padding: '8px 20px', fontWeight: 700, fontSize: 14, cursor: composeText.trim() ? 'pointer' : 'default',
            opacity: composeText.trim() ? 1 : 0.5,
          }}>Postar</button>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          <textarea
            placeholder="O que está acontecendo?"
            value={composeText}
            onChange={e => setComposeText(e.target.value.slice(0, 280))}
            autoFocus
            style={{ width: '100%', minHeight: 120, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 18, fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ color: C.textSec, fontSize: 13, textAlign: 'right' }}>{composeText.length}/280</div>
        </div>
      </div>
    );
  }

  // ============================================
  // View Profile
  // ============================================
  if (view === 'viewProfile' && viewProfile) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('main')} style={btn}>
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>{viewProfile.display_name}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* Banner */}
          <div style={{ height: 100, background: C.card }} />
          <div style={{ padding: '0 16px', marginTop: -30 }}>
            <div style={{ width: 60, height: 60, borderRadius: 30, background: C.bg, border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: C.textSec, fontSize: 24 }}>{viewProfile.display_name?.[0]?.toUpperCase()}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{viewProfile.display_name}</span>
                {viewProfile.verified === 1 && <span style={{ color: C.blue }}>✓</span>}
              </div>
              <div style={{ color: C.textSec, fontSize: 14 }}>@{viewProfile.username}</div>
              {viewProfile.bio && <div style={{ color: C.text, fontSize: 14, marginTop: 8 }}>{viewProfile.bio}</div>}
            </div>
          </div>
          <div style={{ borderTop: `0.5px solid ${C.separator}`, marginTop: 16 }}>
            {viewTweets.map(t => <TweetItem key={t.id} t={t} />)}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Main view
  // ============================================
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
        <span style={{ color: C.text, fontSize: 20, fontWeight: 800 }}>𝕏</span>
        <button onClick={() => { setComposeText(''); setView('compose'); }} style={{
          background: C.blue, color: '#fff', border: 'none', borderRadius: 20,
          padding: '6px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>+ Postar</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'search' ? (
          <>
            <div style={{ padding: '8px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: C.card, borderRadius: 20, padding: '8px 14px' }}>
                <input type="text" placeholder="Pesquisar" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  autoFocus
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 14, fontFamily: 'inherit' }} />
              </div>
            </div>
            {searchResults.map(t => <TweetItem key={t.id} t={t} />)}
          </>
        ) : tab === 'profile' ? (
          myProfile && (
            <>
              <div style={{ height: 80, background: C.card }} />
              <div style={{ padding: '0 16px', marginTop: -24 }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: C.bg, border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: C.textSec, fontSize: 20 }}>{myProfile.display_name?.[0]?.toUpperCase()}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>{myProfile.display_name}</div>
                  <div style={{ color: C.textSec, fontSize: 13 }}>@{myProfile.username}</div>
                  {myProfile.bio && <div style={{ color: C.text, fontSize: 14, marginTop: 6 }}>{myProfile.bio}</div>}
                </div>
              </div>
              <div style={{ borderTop: `0.5px solid ${C.separator}`, marginTop: 12 }}>
                {viewTweets.map(t => <TweetItem key={t.id} t={t} />)}
              </div>
            </>
          )
        ) : (
          loading ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Carregando...</div>
          ) : tweets.length === 0 ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Nenhum tweet ainda. Seja o primeiro!</div>
          ) : (
            tweets.map(t => <TweetItem key={t.id} t={t} />)
          )
        )}
        <div style={{ height: 60 }} />
      </div>

      {/* Bottom tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px', borderTop: `0.5px solid ${C.separator}`, background: C.bg }}>
        <button onClick={() => { setTab('feed'); setView('main'); }} style={btn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={tab === 'feed' ? '#fff' : 'none'} stroke="#fff" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
        </button>
        <button onClick={() => { setTab('search'); setView('main'); setSearchQuery(''); setSearchResults([]); }} style={btn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
        <button onClick={() => { setTab('profile'); setView('main'); }} style={btn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </div>
  );
}

const btn = { background: 'none', border: 'none', cursor: 'pointer', padding: 0 };

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBackend } from '../hooks/useNui';

const C = {
  bg: '#000', card: '#1C1C1E', text: '#fff', textSec: '#8E8E93',
  pink: '#FE2C55', blue: '#25F4EE', separator: '#2C2C2E',
};

export default function TikTok({ onNavigate }) {
  const [tab, setTab] = useState('foryou'); // foryou | profile
  const [view, setView] = useState('main'); // main | comments | newVideo | viewProfile
  const [videos, setVideos] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [myProfile, setMyProfile] = useState(null);
  const [myProfileId, setMyProfileId] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const [likeAnim, setLikeAnim] = useState(false);
  const feedRef = useRef(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('tiktok_feed');
    if (res?.videos) setVideos(res.videos);
    if (res?.myProfileId) setMyProfileId(res.myProfileId);
    setLoading(false);
  }, []);

  const loadProfile = useCallback(async () => {
    const res = await fetchBackend('tiktok_profile');
    if (res?.profile) setMyProfile(res.profile);
    if (res?.myProfileId) setMyProfileId(res.myProfileId);
  }, []);

  useEffect(() => {
    if (tab === 'foryou') loadFeed();
    else if (tab === 'profile') loadProfile();
  }, [tab, loadFeed, loadProfile]);

  const current = videos[currentIdx];

  const handleLike = async () => {
    if (!current) return;
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
    const res = await fetchBackend('tiktok_like', { videoId: current.id });
    if (res?.ok) {
      setVideos(prev => prev.map((v, i) => i === currentIdx ? {
        ...v, is_liked: res.liked ? 1 : 0, likes_count: v.likes_count + (res.liked ? 1 : -1)
      } : v));
    }
  };

  const openComments = async () => {
    if (!current) return;
    setComments([]);
    setView('comments');
    const res = await fetchBackend('tiktok_comments', { videoId: current.id });
    if (res?.comments) setComments(res.comments);
  };

  const sendComment = async () => {
    if (!commentText.trim() || !current) return;
    const res = await fetchBackend('tiktok_comment', { videoId: current.id, comment: commentText });
    if (res?.ok) {
      setComments(prev => [res.comment, ...prev]);
      setCommentText('');
      setVideos(prev => prev.map((v, i) => i === currentIdx ? { ...v, comments_count: v.comments_count + 1 } : v));
    }
  };

  const handlePost = async () => {
    if (!newCaption.trim()) return;
    const res = await fetchBackend('tiktok_post', { caption: newCaption });
    if (res?.ok) { setNewCaption(''); setView('main'); setTab('foryou'); loadFeed(); }
  };

  const openProfile = async (profileId) => {
    const res = await fetchBackend('tiktok_profile', { profileId });
    if (res?.profile) {
      setViewProfile({ ...res.profile, videos: res.videos, isFollowing: res.isFollowing });
      setView('viewProfile');
    }
  };

  const handleFollow = async (profileId) => {
    const res = await fetchBackend('tiktok_follow', { profileId });
    if (res?.ok && viewProfile) {
      setViewProfile(prev => ({
        ...prev, isFollowing: res.following,
        followers_count: prev.followers_count + (res.following ? 1 : -1)
      }));
    }
  };

  const scrollToVideo = (dir) => {
    if (dir === 'up' && currentIdx > 0) setCurrentIdx(i => i - 1);
    else if (dir === 'down' && currentIdx < videos.length - 1) setCurrentIdx(i => i + 1);
  };

  const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n/1000).toFixed(1) + 'K';
    return String(n);
  };

  const Avatar = ({ name, size = 40 }) => (
    <div style={{ width: size, height: size, borderRadius: size/2, background: '#2C2C2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: C.textSec, fontSize: size * 0.45 }}>{name?.[0]?.toUpperCase() || '?'}</span>
    </div>
  );

  // ============================================
  // Comments
  // ============================================
  if (view === 'comments') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <span style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>{current?.comments_count || 0} comentários</span>
          <button onClick={() => setView('main')} style={{ ...btnS, color: C.textSec, fontSize: 20 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px' }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <Avatar name={c.username || c.display_name} size={32} />
              <div style={{ flex: 1 }}>
                <span style={{ color: C.textSec, fontSize: 12, fontWeight: 600 }}>{c.display_name || c.username}</span>
                <div style={{ color: C.text, fontSize: 14, marginTop: 2 }}>{c.comment}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderTop: `0.5px solid ${C.separator}` }}>
          <input type="text" placeholder="Adicionar comentário..." value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendComment()}
            style={{ flex: 1, background: C.card, borderRadius: 20, padding: '8px 14px', border: 'none', outline: 'none', color: C.text, fontSize: 14, fontFamily: 'inherit' }} />
          {commentText.trim() && <button onClick={sendComment} style={{ ...btnS, color: C.pink, fontWeight: 600, fontSize: 14 }}>Enviar</button>}
        </div>
      </div>
    );
  }

  // ============================================
  // New Video
  // ============================================
  if (view === 'newVideo') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('main')} style={{ ...btnS, color: C.text, fontSize: 15 }}>Cancelar</button>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>Novo vídeo</span>
          <button onClick={handlePost} style={{ ...btnS, color: C.pink, fontWeight: 700, fontSize: 15 }}>Postar</button>
        </div>
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.card, borderRadius: 12, aspectRatio: '9/16', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: 200 }}>
            <span style={{ color: C.textSec, fontSize: 40 }}>🎬</span>
          </div>
          <textarea
            placeholder="Descreva seu vídeo..."
            value={newCaption}
            onChange={e => setNewCaption(e.target.value)}
            style={{ width: '100%', minHeight: 80, background: C.card, borderRadius: 12, padding: 14, border: 'none', outline: 'none', color: C.text, fontSize: 15, fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // View Profile
  // ============================================
  if (view === 'viewProfile' && viewProfile) {
    const isMe = viewProfile.id === myProfileId;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('main')} style={btnS}>
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>@{viewProfile.username}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
            <Avatar name={viewProfile.display_name} size={72} />
            <div style={{ color: C.text, fontSize: 16, fontWeight: 600, marginTop: 8 }}>@{viewProfile.username}</div>
            <div style={{ display: 'flex', gap: 28, marginTop: 16, textAlign: 'center' }}>
              <div><div style={{ color: C.text, fontWeight: 700 }}>{formatCount(viewProfile.following_count)}</div><div style={{ color: C.textSec, fontSize: 12 }}>Seguindo</div></div>
              <div><div style={{ color: C.text, fontWeight: 700 }}>{formatCount(viewProfile.followers_count)}</div><div style={{ color: C.textSec, fontSize: 12 }}>Seguidores</div></div>
              <div><div style={{ color: C.text, fontWeight: 700 }}>{formatCount(viewProfile.likes_count)}</div><div style={{ color: C.textSec, fontSize: 12 }}>Curtidas</div></div>
            </div>
            {viewProfile.bio && <div style={{ color: C.textSec, fontSize: 13, marginTop: 12, textAlign: 'center' }}>{viewProfile.bio}</div>}
            {!isMe && (
              <button onClick={() => handleFollow(viewProfile.id)} style={{
                marginTop: 12, padding: '8px 40px', borderRadius: 4, border: 'none', cursor: 'pointer',
                background: viewProfile.isFollowing ? C.card : C.pink, color: '#fff', fontWeight: 600, fontSize: 14,
              }}>
                {viewProfile.isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {(viewProfile.videos || []).map(v => (
              <div key={v.id} style={{ aspectRatio: '9/16', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: C.textSec, fontSize: 10, padding: 4, textAlign: 'center', wordBreak: 'break-word' }}>{v.caption?.substring(0, 30) || '🎬'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Main — For You / Profile tab
  // ============================================
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg, position: 'relative' }}>
      {/* Header tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '10px 0 6px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <button onClick={() => setTab('foryou')} style={{ ...btnS, color: tab === 'foryou' ? '#fff' : C.textSec, fontSize: 15, fontWeight: tab === 'foryou' ? 700 : 400, borderBottom: tab === 'foryou' ? '2px solid #fff' : 'none', paddingBottom: 4 }}>Para você</button>
        <button onClick={() => { setTab('profile'); setView('main'); }} style={{ ...btnS, color: tab === 'profile' ? '#fff' : C.textSec, fontSize: 15, fontWeight: tab === 'profile' ? 700 : 400, borderBottom: tab === 'profile' ? '2px solid #fff' : 'none', paddingBottom: 4 }}>Perfil</button>
      </div>

      {tab === 'profile' ? (
        /* My Profile */
        <div style={{ flex: 1, overflow: 'auto', paddingTop: 44 }}>
          {myProfile && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' }}>
                <Avatar name={myProfile.display_name} size={72} />
                <div style={{ color: C.text, fontSize: 16, fontWeight: 600, marginTop: 8 }}>@{myProfile.username}</div>
                <div style={{ display: 'flex', gap: 28, marginTop: 16, textAlign: 'center' }}>
                  <div><div style={{ color: C.text, fontWeight: 700 }}>{formatCount(myProfile.following_count)}</div><div style={{ color: C.textSec, fontSize: 12 }}>Seguindo</div></div>
                  <div><div style={{ color: C.text, fontWeight: 700 }}>{formatCount(myProfile.followers_count)}</div><div style={{ color: C.textSec, fontSize: 12 }}>Seguidores</div></div>
                  <div><div style={{ color: C.text, fontWeight: 700 }}>{formatCount(myProfile.likes_count)}</div><div style={{ color: C.textSec, fontSize: 12 }}>Curtidas</div></div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {(myProfile.videos || []).map(v => (
                  <div key={v.id} style={{ aspectRatio: '9/16', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: C.textSec, fontSize: 10, padding: 4, textAlign: 'center' }}>{v.caption?.substring(0, 30) || '🎬'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* For You feed — fullscreen vertical video style */
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} ref={feedRef}>
          {loading ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 100 }}>Carregando...</div>
          ) : videos.length === 0 ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 100 }}>Nenhum vídeo ainda</div>
          ) : current && (
            <>
              {/* Video content (text-based in RP) */}
              <div style={{
                position: 'absolute', inset: 0, background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
              }}>
                <div style={{ color: '#fff', fontSize: 18, textAlign: 'center', lineHeight: 1.6, maxWidth: '80%', wordBreak: 'break-word' }}>
                  {current.caption || '🎬'}
                </div>
              </div>

              {/* Like animation */}
              {likeAnim && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill={C.pink} style={{ animation: 'pulse 0.6s ease-out' }}>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              )}

              {/* Bottom info */}
              <div style={{ position: 'absolute', bottom: 60, left: 12, right: 60, zIndex: 10 }}>
                <div onClick={() => openProfile(current.profile_id)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                  <Avatar name={current.display_name || current.username} size={36} />
                  <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>@{current.username}</span>
                </div>
                <div style={{ color: '#fff', fontSize: 14, lineHeight: 1.4 }}>
                  {current.caption?.substring(0, 100)}{current.caption?.length > 100 ? '...' : ''}
                </div>
              </div>

              {/* Right sidebar actions */}
              <div style={{ position: 'absolute', right: 8, bottom: 80, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', zIndex: 10 }}>
                <button onClick={handleLike} style={{ ...btnS, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={current.is_liked ? C.pink : 'none'} stroke={current.is_liked ? C.pink : '#fff'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                  <span style={{ color: '#fff', fontSize: 12 }}>{formatCount(current.likes_count)}</span>
                </button>
                <button onClick={openComments} style={{ ...btnS, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                  </svg>
                  <span style={{ color: '#fff', fontSize: 12 }}>{formatCount(current.comments_count)}</span>
                </button>
              </div>

              {/* Swipe controls */}
              <div style={{ position: 'absolute', left: 0, right: 60, top: 44, bottom: 60, display: 'flex', flexDirection: 'column', zIndex: 5 }}>
                <div onClick={() => scrollToVideo('up')} style={{ flex: 1, cursor: currentIdx > 0 ? 'pointer' : 'default' }} />
                <div onDoubleClick={handleLike} style={{ flex: 2 }} />
                <div onClick={() => scrollToVideo('down')} style={{ flex: 1, cursor: currentIdx < videos.length - 1 ? 'pointer' : 'default' }} />
              </div>

              {/* Video counter */}
              <div style={{ position: 'absolute', top: 44, right: 12, zIndex: 10 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{currentIdx + 1}/{videos.length}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '6px 0 10px', borderTop: `0.5px solid ${C.separator}`, background: C.bg, zIndex: 10 }}>
        <button onClick={() => { setTab('foryou'); setView('main'); }} style={btnS}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === 'foryou' ? '#fff' : 'none'} stroke="#fff" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
        </button>
        <button onClick={() => { setNewCaption(''); setView('newVideo'); }} style={{
          width: 36, height: 24, borderRadius: 6, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: C.blue, borderRadius: '6px 0 0 6px' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 10, background: C.pink, borderRadius: '0 6px 6px 0' }} />
          <span style={{ color: '#000', fontSize: 18, fontWeight: 700, zIndex: 1 }}>+</span>
        </button>
        <button onClick={() => { setTab('profile'); setView('main'); }} style={btnS}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </div>
  );
}

const btnS = { background: 'none', border: 'none', cursor: 'pointer', padding: 0 };

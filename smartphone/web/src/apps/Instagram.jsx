import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

const C = {
  bg: '#000', card: '#1C1C1E', text: '#fff', textSec: '#8E8E93',
  separator: '#2C2C2E', blue: '#0095F6', red: '#ED4956', like: '#ED4956',
};

const Ico = {
  home: (active) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#fff' : 'none'} stroke="#fff" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  search: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  plus: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8m-4-4h8"/></svg>,
  heart: (filled) => filled ? <svg width="24" height="24" viewBox="0 0 24 24" fill="#ED4956"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  comment: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  user: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  back: <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

export default function Instagram({ onNavigate }) {
  const [tab, setTab] = useState('feed');
  const [view, setView] = useState('main'); // main | profile | comments | newPost | search
  const [posts, setPosts] = useState([]);
  const [myProfileId, setMyProfileId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [viewComments, setViewComments] = useState({ postId: null, comments: [] });
  const [loading, setLoading] = useState(true);

  // New post
  const [newCaption, setNewCaption] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Comment input
  const [commentText, setCommentText] = useState('');

  // Load feed
  const loadFeed = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('ig_feed');
    if (res?.posts) setPosts(res.posts);
    if (res?.myProfileId) setMyProfileId(res.myProfileId);
    setLoading(false);
  }, []);

  const loadExplore = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('ig_explore');
    if (res?.posts) setPosts(res.posts);
    if (res?.myProfileId) setMyProfileId(res.myProfileId);
    setLoading(false);
  }, []);

  const loadMyProfile = useCallback(async () => {
    const res = await fetchBackend('ig_profile');
    if (res?.profile) setMyProfile(res.profile);
    if (res?.myProfileId) setMyProfileId(res.myProfileId);
  }, []);

  useEffect(() => {
    if (tab === 'feed') loadFeed();
    else if (tab === 'explore') loadExplore();
    else if (tab === 'profile') loadMyProfile();
  }, [tab, loadFeed, loadExplore, loadMyProfile]);

  // IG Notification
  usePusherEvent('IG_NOTIFICATION', useCallback(() => {}, []));

  // Actions
  const handleLike = async (postId) => {
    const res = await fetchBackend('ig_like', { postId });
    if (res?.ok) {
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p, is_liked: res.liked ? 1 : 0, likes_count: p.likes_count + (res.liked ? 1 : -1)
      } : p));
    }
  };

  const openComments = async (postId) => {
    setViewComments({ postId, comments: [] });
    setView('comments');
    const res = await fetchBackend('ig_comments', { postId });
    if (res?.comments) setViewComments({ postId, comments: res.comments });
  };

  const sendComment = async () => {
    if (!commentText.trim()) return;
    const res = await fetchBackend('ig_comment', { postId: viewComments.postId, text: commentText });
    if (res?.ok) {
      setViewComments(prev => ({ ...prev, comments: [...prev.comments, res.comment] }));
      setCommentText('');
      setPosts(prev => prev.map(p => p.id === viewComments.postId ? { ...p, comments_count: p.comments_count + 1 } : p));
    }
  };

  const handlePost = async () => {
    if (!newCaption.trim()) return;
    const res = await fetchBackend('ig_post', { caption: newCaption });
    if (res?.ok) { setNewCaption(''); setTab('feed'); setView('main'); loadFeed(); }
  };

  const openProfile = async (profileId) => {
    const res = await fetchBackend('ig_profile', { profileId });
    if (res?.profile) { setViewProfile({ ...res.profile, isFollowing: res.isFollowing }); setView('profile'); }
  };

  const handleFollow = async () => {
    if (!viewProfile) return;
    const res = await fetchBackend('ig_follow', { profileId: viewProfile.id });
    if (res?.ok) {
      setViewProfile(prev => ({
        ...prev, isFollowing: res.following,
        followers: prev.followers + (res.following ? 1 : -1)
      }));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const res = await fetchBackend('ig_search', { query: searchQuery });
    if (res?.results) setSearchResults(res.results);
  };

  const timeAgo = (d) => {
    if (!d) return '';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'agora';
    if (s < 3600) return `${Math.floor(s/60)}min`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return `${Math.floor(s/86400)}d`;
  };

  const Avatar = ({ name, size = 32 }) => (
    <div style={{ width: size, height: size, borderRadius: size/2, background: '#2C2C2E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: C.textSec, fontSize: size * 0.45 }}>{name?.[0]?.toUpperCase() || '?'}</span>
    </div>
  );

  // ============================================
  // VIEW: Comments
  // ============================================
  if (view === 'comments') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('main')} style={btn}>{Ico.back}</button>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>Comentários</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px' }}>
          {viewComments.comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <Avatar name={c.username} size={32} />
              <div>
                <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{c.username} </span>
                <span style={{ color: C.text, fontSize: 13 }}>{c.text}</span>
                <div style={{ color: C.textSec, fontSize: 11, marginTop: 2 }}>{timeAgo(c.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderTop: `0.5px solid ${C.separator}` }}>
          <input type="text" placeholder="Adicionar comentário..." value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendComment()}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 14, fontFamily: 'inherit' }} />
          {commentText.trim() && <button onClick={sendComment} style={{ ...btn, color: C.blue, fontSize: 14, fontWeight: 600 }}>Publicar</button>}
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: Profile
  // ============================================
  if (view === 'profile' && viewProfile) {
    const isMe = viewProfile.id === myProfileId;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('main')} style={btn}>{Ico.back}</button>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>{viewProfile.username}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px' }}>
            <Avatar name={viewProfile.name || viewProfile.username} size={72} />
            <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
              <div><div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{viewProfile.posts?.length || 0}</div><div style={{ color: C.textSec, fontSize: 12 }}>posts</div></div>
              <div><div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{viewProfile.followers || 0}</div><div style={{ color: C.textSec, fontSize: 12 }}>seguidores</div></div>
              <div><div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{viewProfile.following || 0}</div><div style={{ color: C.textSec, fontSize: 12 }}>seguindo</div></div>
            </div>
          </div>
          <div style={{ padding: '0 20px 12px' }}>
            <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{viewProfile.name}</div>
            {viewProfile.bio && <div style={{ color: C.textSec, fontSize: 13, marginTop: 2 }}>{viewProfile.bio}</div>}
          </div>
          {!isMe && (
            <div style={{ padding: '0 20px 16px' }}>
              <button onClick={handleFollow} style={{
                width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                background: viewProfile.isFollowing ? C.card : C.blue, color: '#fff',
              }}>
                {viewProfile.isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
            </div>
          )}
          {/* Posts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {(viewProfile.posts || []).map(p => (
              <div key={p.id} style={{ aspectRatio: '1', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: C.textSec, fontSize: 11, textAlign: 'center', padding: 4, wordBreak: 'break-word' }}>
                  {p.caption?.substring(0, 40) || '📷'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: New Post
  // ============================================
  if (view === 'newPost') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => setView('main')} style={{ ...btn, color: C.text, fontSize: 15 }}>Cancelar</button>
          <span style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>Novo post</span>
          <button onClick={handlePost} style={{ ...btn, color: C.blue, fontSize: 15, fontWeight: 600 }}>Publicar</button>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          <div style={{ background: C.card, borderRadius: 12, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ color: C.textSec, fontSize: 40 }}>📸</span>
          </div>
          <textarea
            placeholder="Escreva uma legenda..."
            value={newCaption}
            onChange={e => setNewCaption(e.target.value)}
            style={{ width: '100%', minHeight: 80, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 15, fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: Search
  // ============================================
  if (view === 'search') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: `0.5px solid ${C.separator}` }}>
          <button onClick={() => { setView('main'); setTab('feed'); }} style={btn}>{Ico.back}</button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: C.card, borderRadius: 8, padding: '6px 10px' }}>
            <input type="text" placeholder="Pesquisar..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              autoFocus
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 14, fontFamily: 'inherit' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {searchResults.map(r => (
            <div key={r.id} onClick={() => openProfile(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer' }}>
              <Avatar name={r.username} size={44} />
              <div><div style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{r.username}</div><div style={{ color: C.textSec, fontSize: 13 }}>{r.name}</div></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN: Feed / Explore / Profile tabs
  // ============================================
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: `0.5px solid ${C.separator}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: C.text, fontSize: 22, fontWeight: 700, fontStyle: 'italic' }}>Instagram</span>
        <button onClick={() => { setNewCaption(''); setView('newPost'); }} style={btn}>{Ico.plus}</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>Carregando...</div>
        ) : tab === 'profile' ? (
          /* My Profile */
          myProfile && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px' }}>
                <Avatar name={myProfile.name || myProfile.username} size={72} />
                <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
                  <div><div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{myProfile.posts?.length || 0}</div><div style={{ color: C.textSec, fontSize: 12 }}>posts</div></div>
                  <div><div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{myProfile.followers || 0}</div><div style={{ color: C.textSec, fontSize: 12 }}>seguidores</div></div>
                  <div><div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{myProfile.following || 0}</div><div style={{ color: C.textSec, fontSize: 12 }}>seguindo</div></div>
                </div>
              </div>
              <div style={{ padding: '0 20px 16px' }}>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{myProfile.name}</div>
                <div style={{ color: C.text, fontSize: 13 }}>@{myProfile.username}</div>
                {myProfile.bio && <div style={{ color: C.textSec, fontSize: 13, marginTop: 4 }}>{myProfile.bio}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {(myProfile.posts || []).map(p => (
                  <div key={p.id} style={{ aspectRatio: '1', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: C.textSec, fontSize: 11, textAlign: 'center', padding: 4, wordBreak: 'break-word' }}>
                      {p.caption?.substring(0, 40) || '📷'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          /* Feed / Explore */
          posts.length === 0 ? (
            <div style={{ color: C.textSec, textAlign: 'center', paddingTop: 40 }}>
              {tab === 'feed' ? 'Siga pessoas pra ver posts' : 'Nenhum post ainda'}
            </div>
          ) : (
            posts.map(p => (
              <div key={p.id} style={{ borderBottom: `0.5px solid ${C.separator}`, paddingBottom: 8 }}>
                {/* Post header */}
                <div onClick={() => openProfile(p.profile_id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer' }}>
                  <Avatar name={p.username} size={32} />
                  <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{p.username}</span>
                  <span style={{ color: C.textSec, fontSize: 12, marginLeft: 'auto' }}>{timeAgo(p.created_at)}</span>
                </div>
                {/* Post image placeholder */}
                <div style={{ background: C.card, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: C.textSec, fontSize: 14, padding: 16, textAlign: 'center', lineHeight: 1.5 }}>
                    {p.caption || '📷'}
                  </span>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 16, padding: '10px 12px' }}>
                  <button onClick={() => handleLike(p.id)} style={btn}>{Ico.heart(p.is_liked)}</button>
                  <button onClick={() => openComments(p.id)} style={btn}>{Ico.comment}</button>
                </div>
                {/* Likes */}
                {p.likes_count > 0 && <div style={{ padding: '0 12px 4px', color: C.text, fontSize: 13, fontWeight: 600 }}>{p.likes_count} curtida{p.likes_count !== 1 ? 's' : ''}</div>}
                {/* Caption */}
                {p.caption && (
                  <div style={{ padding: '0 12px 4px' }}>
                    <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{p.username} </span>
                    <span style={{ color: C.text, fontSize: 13 }}>{p.caption}</span>
                  </div>
                )}
                {p.comments_count > 0 && (
                  <button onClick={() => openComments(p.id)} style={{ ...btn, padding: '0 12px 8px', color: C.textSec, fontSize: 13 }}>
                    Ver {p.comments_count} comentário{p.comments_count !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            ))
          )
        )}
        <div style={{ height: 60 }} />
      </div>

      {/* Bottom tabs */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px',
        borderTop: `0.5px solid ${C.separator}`, background: C.bg,
      }}>
        <button onClick={() => { setTab('feed'); setView('main'); }} style={btn}>{Ico.home(tab === 'feed')}</button>
        <button onClick={() => { setTab('explore'); setView('search'); setSearchQuery(''); setSearchResults([]); }} style={btn}>{Ico.search}</button>
        <button onClick={() => { setTab('profile'); setView('main'); }} style={btn}>{Ico.user}</button>
      </div>
    </div>
  );
}

const btn = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' };

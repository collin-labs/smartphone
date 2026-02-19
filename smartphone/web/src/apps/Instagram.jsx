import { useState, useEffect, useCallback } from 'react';
import { fetchBackend } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

const C = {
  bg:'#000',surface:'#121212',elevated:'#262626',text:'#FAFAFA',textSec:'#A8A8A8',
  textTer:'#737373',sep:'#262626',blue:'#0095F6',like:'#FF3040',
  story:'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)',
};

const I = {
  home: a => <svg width="24" height="24" viewBox="0 0 24 24" fill={a?'#fff':'none'} stroke="#fff" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  search: a => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={a?'3':'2'}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  reels: a => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={a?'3':'2'}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M10 8l6 4-6 4V8z" fill={a?'#fff':'none'}/></svg>,
  heart: f => f ? <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={C.like}/></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  comment: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  share: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  save: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  user: a => <svg width="24" height="24" viewBox="0 0 24 24" fill={a?'#fff':'none'} stroke="#fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  plus: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8m-4-4h8"/></svg>,
  back: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  messenger: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  grid: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
};

const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

const Avatar = ({ name, size = 32, ring = false }) => (
  <div style={{ width:size+(ring?6:0), height:size+(ring?6:0), borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:ring?C.story:'transparent', padding:ring?3:0, flexShrink:0 }}>
    <div style={{ width:size, height:size, borderRadius:'50%', background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', border:ring?'2px solid #000':'none' }}>
      <span style={{ color:C.textSec, fontSize:size*0.42, fontWeight:600 }}>{name?.[0]?.toUpperCase()||'?'}</span>
    </div>
  </div>
);

const fmtCount = n => { if(!n)return'0'; if(n>=1e6)return(n/1e6).toFixed(1)+'M'; if(n>=1e4)return(n/1e3).toFixed(0)+'K'; if(n>=1e3)return(n/1e3).toFixed(1)+'K'; return String(n); };
const timeAgo = d => { if(!d)return''; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60)return'agora'; if(s<3600)return Math.floor(s/60)+'min'; if(s<86400)return Math.floor(s/3600)+'h'; return Math.floor(s/86400)+'d'; };

export default function Instagram({ onNavigate }) {
  const [tab, setTab] = useState('feed');
  const [view, setView] = useState('main');
  const [posts, setPosts] = useState([]);
  const [myProfileId, setMyProfileId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [viewComments, setViewComments] = useState({ postId:null, comments:[] });
  const [loading, setLoading] = useState(true);
  const [newCaption, setNewCaption] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [likeAnim, setLikeAnim] = useState(null);

  const loadFeed = useCallback(async () => { setLoading(true); const r=await fetchBackend('ig_feed'); if(r?.posts)setPosts(r.posts); if(r?.myProfileId)setMyProfileId(r.myProfileId); setLoading(false); }, []);
  const loadExplore = useCallback(async () => { setLoading(true); const r=await fetchBackend('ig_explore'); if(r?.posts)setPosts(r.posts); if(r?.myProfileId)setMyProfileId(r.myProfileId); setLoading(false); }, []);
  const loadMyProfile = useCallback(async () => { setLoading(true); const r=await fetchBackend('ig_profile'); if(r?.profile)setMyProfile(r.profile); if(r?.myProfileId)setMyProfileId(r.myProfileId); setLoading(false); }, []);

  useEffect(() => { if(tab==='feed')loadFeed(); else if(tab==='explore')loadExplore(); else if(tab==='profile')loadMyProfile(); }, [tab, loadFeed, loadExplore, loadMyProfile]);
  usePusherEvent('IG_NOTIFICATION', useCallback(()=>{}, []));

  const handleLike = async (id) => { const r=await fetchBackend('ig_like',{postId:id}); if(r?.ok){ setPosts(p=>p.map(x=>x.id===id?{...x,is_liked:r.liked?1:0,likes_count:x.likes_count+(r.liked?1:-1)}:x)); if(r.liked){setLikeAnim(id);setTimeout(()=>setLikeAnim(null),800);} } };
  const doubleTap = async (id) => { const p=posts.find(x=>x.id===id); if(p&&!p.is_liked)handleLike(id); else{setLikeAnim(id);setTimeout(()=>setLikeAnim(null),800);} };
  const openComments = async (id) => { setViewComments({postId:id,comments:[]}); setView('comments'); const r=await fetchBackend('ig_comments',{postId:id}); if(r?.comments)setViewComments({postId:id,comments:r.comments}); };
  const sendComment = async () => { if(!commentText.trim())return; const r=await fetchBackend('ig_comment',{postId:viewComments.postId,text:commentText}); if(r?.ok){ setViewComments(p=>({...p,comments:[...p.comments,r.comment]})); setCommentText(''); setPosts(p=>p.map(x=>x.id===viewComments.postId?{...x,comments_count:x.comments_count+1}:x)); } };
  const handlePost = async () => { if(!newCaption.trim())return; const r=await fetchBackend('ig_post',{caption:newCaption}); if(r?.ok){setNewCaption('');setTab('feed');setView('main');loadFeed();} };
  const openProfile = async (id) => { const r=await fetchBackend('ig_profile',{profileId:id}); if(r?.profile){setViewProfile({...r.profile,isFollowing:r.isFollowing});setView('profile');} };
  const handleFollow = async () => { if(!viewProfile)return; const r=await fetchBackend('ig_follow',{profileId:viewProfile.id}); if(r?.ok)setViewProfile(p=>({...p,isFollowing:r.following,followers:p.followers+(r.following?1:-1)})); };
  const handleSearch = async () => { if(!searchQuery.trim())return; const r=await fetchBackend('ig_search',{query:searchQuery}); if(r?.results)setSearchResults(r.results); };

  // ===== COMMENTS =====
  if (view === 'comments') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', padding:'14px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>setView('main')} style={{...B,marginRight:16}}>{I.back}</button>
        <span style={{ color:C.text, fontSize:16, fontWeight:700 }}>Comentários</span>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'12px 16px' }}>
        {viewComments.comments.map((c,i) => (
          <div key={i} style={{ display:'flex', gap:12, marginBottom:16 }}>
            <Avatar name={c.username} size={32} />
            <div style={{ flex:1 }}>
              <div><span style={{ color:C.text, fontSize:13, fontWeight:600 }}>{c.username}</span>{' '}<span style={{ color:C.text, fontSize:13 }}>{c.text}</span></div>
              <div style={{ color:C.textTer, fontSize:12, marginTop:4 }}>{timeAgo(c.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderTop:`0.5px solid ${C.sep}` }}>
        <Avatar name="E" size={28} />
        <input type="text" placeholder="Adicione um comentário..." value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendComment()} style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:14, fontFamily:'inherit' }} />
        {commentText.trim() && <button onClick={sendComment} style={{...B,color:C.blue,fontSize:14,fontWeight:600}}>Publicar</button>}
      </div>
    </div>
  );

  // ===== OTHER PROFILE =====
  if (view === 'profile' && viewProfile) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', padding:'14px 16px', gap:12 }}>
        <button onClick={()=>{setView('main');setViewProfile(null);}} style={B}>{I.back}</button>
        <span style={{ color:C.text, fontSize:16, fontWeight:700 }}>{viewProfile.username}</span>
      </div>
      <div style={{ flex:1, overflow:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', padding:'8px 20px 16px', gap:24 }}>
          <Avatar name={viewProfile.name||viewProfile.username} size={77} />
          <div style={{ display:'flex', gap:18, flex:1, justifyContent:'center' }}>
            {[['publicações',(viewProfile.posts||[]).length],['seguidores',viewProfile.followers||0],['seguindo',viewProfile.following||0]].map(([l,v])=>(<div key={l} style={{textAlign:'center'}}><div style={{color:C.text,fontWeight:700,fontSize:16}}>{fmtCount(v)}</div><div style={{color:C.text,fontSize:13}}>{l}</div></div>))}
          </div>
        </div>
        <div style={{ padding:'0 20px 12px' }}>
          <div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{viewProfile.name}</div>
          {viewProfile.bio && <div style={{ color:C.text, fontSize:14, marginTop:2 }}>{viewProfile.bio}</div>}
        </div>
        <div style={{ display:'flex', gap:6, padding:'0 16px 16px' }}>
          <button onClick={handleFollow} style={{ flex:1, padding:'8px 0', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:14, background:viewProfile.isFollowing?C.elevated:C.blue, color:'#fff' }}>{viewProfile.isFollowing?'Seguindo':'Seguir'}</button>
          <button style={{ flex:1, padding:'8px 0', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:14, background:C.elevated, color:'#fff' }}>Mensagem</button>
        </div>
        <div style={{ display:'flex', borderTop:`0.5px solid ${C.sep}`, borderBottom:`0.5px solid ${C.sep}` }}>
          <div style={{ flex:1, display:'flex', justifyContent:'center', padding:12, borderBottom:'1px solid #fff' }}>{I.grid}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1 }}>
          {(viewProfile.posts||[]).map(p=>(<div key={p.id} style={{aspectRatio:'1',background:C.surface,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:C.textTer,fontSize:10,textAlign:'center',padding:4}}>{p.caption?.substring(0,30)||'📷'}</span></div>))}
        </div>
      </div>
    </div>
  );

  // ===== NEW POST =====
  if (view === 'newPost') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>setView('main')} style={{...B,color:C.text,fontSize:18}}>✕</button>
        <span style={{ color:C.text, fontSize:16, fontWeight:700 }}>Nova publicação</span>
        <button onClick={handlePost} style={{...B,color:C.blue,fontSize:16,fontWeight:600}}>Compartilhar</button>
      </div>
      <div style={{ flex:1, padding:16 }}>
        <div style={{ background:C.surface, borderRadius:4, aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
          <div style={{ textAlign:'center' }}><div style={{ fontSize:48,marginBottom:8 }}>📸</div><div style={{ color:C.textTer, fontSize:13 }}>Foto do RP</div></div>
        </div>
        <textarea placeholder="Escreva uma legenda..." value={newCaption} onChange={e=>setNewCaption(e.target.value)} style={{ width:'100%', minHeight:100, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:16, fontFamily:'inherit', resize:'none', boxSizing:'border-box', lineHeight:1.5 }} />
      </div>
    </div>
  );

  // ===== SEARCH / EXPLORE =====
  if (view === 'search') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ padding:'8px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', background:C.elevated, borderRadius:10, padding:'8px 12px', gap:8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSec} strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          <input type="text" placeholder="Pesquisar" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} autoFocus style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:16, fontFamily:'inherit' }} />
          {searchQuery && <button onClick={()=>{setSearchQuery('');setSearchResults([]);}} style={{...B,color:C.textSec}}>✕</button>}
        </div>
      </div>
      <div style={{ flex:1, overflow:'auto' }}>
        {searchResults.length > 0 ? searchResults.map(r=>(
          <div key={r.id} onClick={()=>openProfile(r.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer' }}>
            <Avatar name={r.username} size={44} />
            <div><div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{r.username}</div><div style={{ color:C.textSec, fontSize:13 }}>{r.name}</div></div>
          </div>
        )) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, padding:'2px 0' }}>
            {posts.map(p=>(<div key={p.id} onClick={()=>openProfile(p.profile_id)} style={{ aspectRatio:'1', background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><span style={{ color:C.textTer, fontSize:10, textAlign:'center', padding:4 }}>{p.caption?.substring(0,20)||'📷'}</span></div>))}
          </div>
        )}
      </div>
      <Nav tab={tab} setTab={setTab} setView={setView} />
    </div>
  );

  // ===== MAIN =====
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {tab==='feed' && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:2 }}>
            <span style={{ color:C.text, fontSize:22, fontWeight:700, fontStyle:'italic' }}>Instagram</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div style={{ display:'flex', gap:20 }}>
            <button onClick={()=>{setNewCaption('');setView('newPost');}} style={B}>{I.plus}</button>
            <button style={B}>{I.messenger}</button>
          </div>
        </div>
      )}

      <div style={{ flex:1, overflow:'auto' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <div style={{ width:24, height:24, border:`2px solid ${C.sep}`, borderTopColor:C.text, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : tab === 'profile' ? (
          myProfile && (<div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px' }}>
              <span style={{ color:C.text, fontSize:20, fontWeight:700 }}>{myProfile.username}</span>
              <button onClick={()=>{setNewCaption('');setView('newPost');}} style={B}>{I.plus}</button>
            </div>
            <div style={{ display:'flex', alignItems:'center', padding:'8px 20px 16px', gap:24 }}>
              <Avatar name={myProfile.name||myProfile.username} size={77} ring />
              <div style={{ display:'flex', gap:18, flex:1, justifyContent:'center' }}>
                {[['publicações',(myProfile.posts||[]).length],['seguidores',myProfile.followers||0],['seguindo',myProfile.following||0]].map(([l,v])=>(<div key={l} style={{textAlign:'center'}}><div style={{color:C.text,fontWeight:700,fontSize:16}}>{fmtCount(v)}</div><div style={{color:C.text,fontSize:13}}>{l}</div></div>))}
              </div>
            </div>
            <div style={{ padding:'0 20px 4px' }}>
              <div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{myProfile.name}</div>
              {myProfile.bio && <div style={{ color:C.text, fontSize:14, marginTop:2 }}>{myProfile.bio}</div>}
            </div>
            <div style={{ padding:'12px 16px' }}>
              <button style={{ width:'100%', padding:'7px 0', borderRadius:8, border:'none', cursor:'pointer', background:C.elevated, color:C.text, fontSize:14, fontWeight:600 }}>Editar perfil</button>
            </div>
            <div style={{ display:'flex', borderTop:`0.5px solid ${C.sep}`, borderBottom:`0.5px solid ${C.sep}` }}>
              <div style={{ flex:1, display:'flex', justifyContent:'center', padding:12, borderBottom:'1px solid #fff' }}>{I.grid}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1 }}>
              {(myProfile.posts||[]).map(p=>(<div key={p.id} style={{aspectRatio:'1',background:C.surface,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:C.textTer,fontSize:10,textAlign:'center',padding:4}}>{p.caption?.substring(0,30)||'📷'}</span></div>))}
              {(!myProfile.posts||myProfile.posts.length===0)&&(<div style={{gridColumn:'1/4',textAlign:'center',padding:40,color:C.textTer}}><div style={{fontSize:40,marginBottom:8}}>📷</div><div style={{fontSize:14}}>Nenhuma publicação</div></div>)}
            </div>
          </div>)
        ) : (
          <>
            {/* Stories */}
            <div style={{ display:'flex', gap:12, padding:'10px 14px', borderBottom:`0.5px solid ${C.sep}`, overflowX:'auto' }}>
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <div style={{ position:'relative' }}>
                  <Avatar name="+" size={58} />
                  <div style={{ position:'absolute', bottom:0, right:0, width:18, height:18, borderRadius:'50%', background:C.blue, border:'2px solid #000', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:'#fff', fontSize:14, fontWeight:700, lineHeight:1 }}>+</span>
                  </div>
                </div>
                <div style={{ color:C.text, fontSize:10, marginTop:4 }}>Seu story</div>
              </div>
              {posts.slice(0,8).map((p,i) => (
                <div key={i} style={{ textAlign:'center', flexShrink:0 }}>
                  <Avatar name={p.username} size={58} ring />
                  <div style={{ color:C.text, fontSize:10, marginTop:4, maxWidth:64, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.username}</div>
                </div>
              ))}
            </div>

            {/* Posts */}
            {posts.length===0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color:C.textSec }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📷</div>
                <div style={{ fontSize:16, fontWeight:600, color:C.text }}>Siga pessoas para ver posts</div>
              </div>
            ) : posts.map(p => (
              <div key={p.id} style={{ marginBottom:4 }}>
                {/* Header */}
                <div onClick={()=>openProfile(p.profile_id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer' }}>
                  <Avatar name={p.username} size={32} ring />
                  <span style={{ color:C.text, fontSize:13, fontWeight:600, flex:1 }}>{p.username}</span>
                  <span style={{ color:C.textTer, fontSize:12 }}>{timeAgo(p.created_at)}</span>
                </div>
                {/* Image */}
                <div onDoubleClick={()=>doubleTap(p.id)} style={{ background:C.surface, aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer', userSelect:'none' }}>
                  <span style={{ color:C.textTer, fontSize:14, padding:20, textAlign:'center', lineHeight:1.6 }}>{p.caption||'📷'}</span>
                  {likeAnim===p.id && (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                      <svg width="80" height="80" viewBox="0 0 24 24" style={{ animation:'igLike 0.8s ease-out forwards', opacity:0 }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#fff"/></svg>
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div style={{ display:'flex', alignItems:'center', padding:'10px 14px' }}>
                  <div style={{ display:'flex', gap:16, flex:1 }}>
                    <button onClick={()=>handleLike(p.id)} style={B}>{I.heart(p.is_liked)}</button>
                    <button onClick={()=>openComments(p.id)} style={B}>{I.comment}</button>
                    <button style={B}>{I.share}</button>
                  </div>
                  <button style={B}>{I.save}</button>
                </div>
                {p.likes_count>0 && <div style={{ padding:'0 14px 4px', color:C.text, fontSize:14, fontWeight:600 }}>{fmtCount(p.likes_count)} curtida{p.likes_count!==1?'s':''}</div>}
                {p.caption && <div style={{ padding:'0 14px 4px', fontSize:14 }}><span style={{ color:C.text, fontWeight:600 }}>{p.username}</span>{' '}<span style={{ color:C.text }}>{p.caption}</span></div>}
                {p.comments_count>0 && <button onClick={()=>openComments(p.id)} style={{...B,padding:'2px 14px 8px',color:C.textTer,fontSize:14}}>Ver todos os {p.comments_count} comentários</button>}
              </div>
            ))}
            <div style={{ height:60 }} />
          </>
        )}
      </div>

      <Nav tab={tab} setTab={setTab} setView={setView} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes igLike{0%{opacity:0;transform:scale(.2)}15%{opacity:1;transform:scale(1.3)}30%{transform:scale(.95)}45%{transform:scale(1.05)}80%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1)}}`}</style>
    </div>
  );
}

function Nav({ tab, setTab, setView }) {
  const b = (t, ico, fn) => <button onClick={fn||(()=>{setTab(t);setView('main');})} style={{ background:'none',border:'none',cursor:'pointer',padding:'8px 0',flex:1,display:'flex',justifyContent:'center' }}>{typeof ico==='function'?ico(tab===t):ico}</button>;
  return (
    <div style={{ display:'flex', alignItems:'center', borderTop:`0.5px solid ${C.sep}`, background:C.bg, paddingBottom:4 }}>
      {b('feed',I.home)}
      {b('explore',I.search,()=>{setTab('explore');setView('search');})}
      {b('reels',I.reels)}
      {b('profile',I.user)}
    </div>
  );
}

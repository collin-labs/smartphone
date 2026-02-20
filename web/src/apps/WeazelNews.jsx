import { useState, useEffect, useCallback } from 'react';
import { fetchBackend, fetchClient } from '../hooks/useNui';
import { usePusherEvent } from '../hooks/usePusher';

// Weazel News colors — CNN/news dark mode
const C = {
  bg:'#0A0A0A', surface:'#1A1A1A', elevated:'#242424',
  text:'#FFFFFF', textSec:'#A0A0A0', textTer:'#666666',
  sep:'#2A2A2A', red:'#CC0000', redLight:'#FF1A1A',
  accent:'#CC0000', live:'#FF0000', blue:'#2196F3',
  breaking:'#FF0000', tag:'#333333',
};

const B = { background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center' };

const Ic = {
  back: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  edit: <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  send: <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  live: <svg width="14" height="14" viewBox="0 0 24 24" fill={C.live}><circle cx="12" cy="12" r="10"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill={C.textSec}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>,
};

const CATEGORIES = ['Tudo','Urgente','Cidade','Crime','Política','Esporte','Economia'];

const timeAgo = (d) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff/60)}min`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  return `${Math.floor(diff/86400)}d`;
};

export default function WeazelNews({ onNavigate }) {
  const [view, setView] = useState('feed');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tudo');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isJournalist, setIsJournalist] = useState(false);
  // Create article
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Cidade');
  const [isBreaking, setIsBreaking] = useState(false);

  useEffect(() => {
    fetchBackend('weazel_init').then(r => {
      if (r?.articles) setArticles(r.articles);
      if (r?.isJournalist) setIsJournalist(r.isJournalist);
      setLoading(false);
    });
  }, []);

  usePusherEvent('WEAZEL_BREAKING', useCallback((d) => {
    if (d?.article) setArticles(p => [{ ...d.article, isBreaking: true }, ...p]);
    fetchClient('playSound', { sound: 'notification' });
  }, []));

  const publishArticle = async () => {
    if (!title.trim() || !body.trim()) return;
    const r = await fetchBackend('weazel_publish', { title: title.trim(), body: body.trim(), category, isBreaking });
    if (r?.ok) {
      if (r.article) setArticles(p => [r.article, ...p]);
      setTitle(''); setBody(''); setCategory('Cidade'); setIsBreaking(false); setView('feed');
    }
  };

  const filtered = activeCategory === 'Tudo' ? articles
    : activeCategory === 'Urgente' ? articles.filter(a => a.is_breaking)
    : articles.filter(a => a.category === activeCategory);

  // ===== ARTICLE DETAIL =====
  if (view === 'detail' && selectedArticle) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>{setView('feed');setSelectedArticle(null);}} style={B}>{Ic.back}</button>
        <span style={{ color:C.text, fontSize:16, fontWeight:600, flex:1 }}>Weazel News</span>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        {selectedArticle.is_breaking && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:C.breaking, borderRadius:4, padding:'3px 8px', marginBottom:10 }}>
            {Ic.live}
            <span style={{ color:'#fff', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Urgente</span>
          </div>
        )}
        <div style={{ color:C.text, fontSize:22, fontWeight:700, lineHeight:1.3, marginBottom:12 }}>{selectedArticle.title}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <span style={{ color:C.accent, fontSize:13, fontWeight:600 }}>{selectedArticle.author_name || 'Redação'}</span>
          <span style={{ color:C.textTer, fontSize:13 }}>•</span>
          <span style={{ color:C.textSec, fontSize:13 }}>{timeAgo(selectedArticle.created_at)}</span>
          {selectedArticle.category && (
            <>
              <span style={{ color:C.textTer, fontSize:13 }}>•</span>
              <span style={{ background:C.tag, color:C.textSec, fontSize:11, padding:'2px 8px', borderRadius:4 }}>{selectedArticle.category}</span>
            </>
          )}
        </div>
        <div style={{ color:C.text, fontSize:15, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{selectedArticle.body}</div>
      </div>
    </div>
  );

  // ===== CREATE ARTICLE =====
  if (view === 'create') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:`0.5px solid ${C.sep}` }}>
        <button onClick={()=>setView('feed')} style={{ ...B, color:C.textSec, fontSize:15 }}>Cancelar</button>
        <span style={{ color:C.text, fontSize:16, fontWeight:700 }}>Nova matéria</span>
        <button onClick={publishArticle} disabled={!title.trim()||!body.trim()} style={{
          ...B, background:(!title.trim()||!body.trim())?C.elevated:C.accent,
          padding:'6px 16px', borderRadius:16, opacity:(!title.trim()||!body.trim())?0.5:1,
        }}>
          <span style={{ color:'#fff', fontSize:14, fontWeight:600 }}>Publicar</span>
        </button>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        <input type="text" placeholder="Título da matéria" value={title} onChange={e=>setTitle(e.target.value)}
          style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:C.text, fontSize:20, fontWeight:700, marginBottom:16, fontFamily:'inherit' }} />

        {/* Category */}
        <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
          {CATEGORIES.filter(c=>c!=='Tudo'&&c!=='Urgente').map(c => (
            <button key={c} onClick={()=>setCategory(c)} style={{
              padding:'6px 14px', borderRadius:16, border:'none', cursor:'pointer', fontSize:13,
              background: category===c ? C.accent : C.elevated,
              color: category===c ? '#fff' : C.textSec,
            }}>{c}</button>
          ))}
        </div>

        {/* Breaking toggle */}
        <button onClick={()=>setIsBreaking(!isBreaking)} style={{
          display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:8, border:'none', cursor:'pointer',
          background: isBreaking ? C.breaking+'22' : C.elevated, marginBottom:16, width:'100%',
        }}>
          {Ic.live}
          <span style={{ color: isBreaking ? C.breaking : C.textSec, fontSize:14, fontWeight:600 }}>
            {isBreaking ? '🔴 URGENTE — Notificação global' : 'Marcar como urgente'}
          </span>
        </button>

        <textarea placeholder="Escreva a matéria completa..." value={body} onChange={e=>setBody(e.target.value)}
          style={{
            width:'100%', minHeight:200, background:C.surface, border:'none', outline:'none',
            color:C.text, fontSize:15, lineHeight:1.6, borderRadius:8, padding:14,
            fontFamily:'inherit', resize:'vertical',
          }} />
      </div>
    </div>
  );

  // ===== FEED =====
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'14px 16px 8px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <span style={{ color:C.red, fontSize:22, fontWeight:900, letterSpacing:-0.5 }}>WEAZEL</span>
            <span style={{ color:C.text, fontSize:22, fontWeight:300, marginLeft:4 }}>NEWS</span>
          </div>
          {isJournalist && (
            <button onClick={()=>setView('create')} style={{
              ...B, background:C.accent, width:38, height:38, borderRadius:19,
            }}>{Ic.edit}</button>
          )}
        </div>

        {/* Category tabs */}
        <div style={{ display:'flex', gap:6, overflow:'auto', paddingBottom:4 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>setActiveCategory(c)} style={{
              padding:'6px 14px', borderRadius:16, border:'none', cursor:'pointer', fontSize:13, fontWeight:500,
              whiteSpace:'nowrap', flexShrink:0,
              background: activeCategory===c ? C.accent : C.elevated,
              color: activeCategory===c ? '#fff' : C.textSec,
            }}>{c === 'Urgente' ? '🔴 Urgente' : c}</button>
          ))}
        </div>
      </div>

      <div style={{ height:0.5, background:C.sep }}/>

      {/* Articles */}
      <div style={{ flex:1, overflow:'auto' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
            <div style={{ width:24, height:24, border:`2px solid ${C.sep}`, borderTopColor:C.accent, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:C.textSec }}>
            <div style={{ fontSize:40, marginBottom:8 }}>📰</div>
            <div style={{ fontSize:14 }}>Nenhuma notícia</div>
            {isJournalist && <div style={{ color:C.accent, fontSize:13, marginTop:4 }}>Toque em + para criar</div>}
          </div>
        ) : filtered.map((a, i) => (
          <div key={a.id || i} onClick={()=>{setSelectedArticle(a);setView('detail');}}
            style={{ padding:'14px 16px', borderBottom:`0.5px solid ${C.sep}`, cursor:'pointer' }}>

            {/* Breaking banner */}
            {a.is_breaking && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:C.breaking, borderRadius:3, padding:'2px 8px', marginBottom:6 }}>
                <div style={{ width:6, height:6, borderRadius:3, background:'#fff', animation:'pulse 1.5s infinite' }}/>
                <span style={{ color:'#fff', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Urgente</span>
              </div>
            )}

            <div style={{ color:C.text, fontSize:16, fontWeight:600, lineHeight:1.35, marginBottom:6 }}>{a.title}</div>

            {a.body && (
              <div style={{ color:C.textSec, fontSize:13, lineHeight:1.4, marginBottom:8,
                overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              }}>{a.body}</div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ color:C.accent, fontSize:12, fontWeight:600 }}>{a.author_name || 'Redação'}</span>
              <span style={{ color:C.textTer, fontSize:12 }}>•</span>
              <span style={{ color:C.textSec, fontSize:12 }}>{timeAgo(a.created_at)}</span>
              {a.category && (
                <>
                  <span style={{ color:C.textTer, fontSize:12 }}>•</span>
                  <span style={{ background:C.tag, color:C.textSec, fontSize:10, padding:'1px 6px', borderRadius:3 }}>{a.category}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>
    </div>
  );
}

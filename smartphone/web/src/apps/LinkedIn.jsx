import React, { useState, useCallback, useEffect } from "react";
import { fetchBackend } from '../hooks/useNui';

// ============================================================
// LinkedIn App — Pixel-perfect 2025/2026 dark mode replica
// Telas: feed | network | profile
// V0 layout: 100% preservado | Backend: fetchBackend integrado
// ============================================================

// ---------- Dados mock FALLBACK (GTA RP / Los Santos) ----------

const MOCK_CURRENT_USER = {
  id: 1,
  name: "Carlos Silva",
  headline: "Gerente Operacional na Maze Bank | Los Santos",
  location: "Los Santos, San Andreas",
  connections: 487,
  followers: 1230,
  about: "Profissional com mais de 5 anos de experiencia no setor financeiro em Los Santos. Especializado em gestao de operacoes bancarias, compliance e atendimento corporativo. Sempre buscando novas oportunidades de networking e crescimento profissional na regiao.",
  experience: [
    { id: 1, role: "Gerente Operacional", company: "Maze Bank", color: "#00A550", initial: "M", period: "2023 - Presente", location: "Los Santos, SA" },
    { id: 2, role: "Analista Financeiro", company: "Fleeca Bank", color: "#2E86C1", initial: "F", period: "2021 - 2023", location: "Paleto Bay, SA" },
    { id: 3, role: "Estagiario Administrativo", company: "Dynasty 8 Real Estate", color: "#E67E22", initial: "D", period: "2020 - 2021", location: "Vinewood, SA" },
  ],
  education: [
    { id: 1, school: "Universidade de San Andreas", degree: "Bacharelado em Administracao", color: "#8E44AD", initial: "U", period: "2017 - 2021" },
  ],
  skills: ["Gestao Financeira", "Compliance Bancario", "Atendimento Corporativo", "Excel Avancado", "Lideranca de Equipe"],
  avatarColor: "#0A66C2",
  initial: "C",
};

const MOCK_CONNECTIONS = [
  { id: 2, name: "Marina Oliveira", headline: "CEO na Weazel News", color: "#FF0000", initial: "M", mutual: 12 },
  { id: 3, name: "Rafael Santos", headline: "Mecanico Chefe na LS Customs", color: "#FF6B00", initial: "R", mutual: 8 },
  { id: 4, name: "Ana Costa", headline: "Medica na Pillbox Medical", color: "#1DB954", initial: "A", mutual: 15 },
  { id: 5, name: "Pedro Almeida", headline: "Advogado na Freeman & Associates", color: "#9B59B6", initial: "P", mutual: 6 },
  { id: 6, name: "Julia Ferreira", headline: "Corretora na Dynasty 8 Real Estate", color: "#E67E22", initial: "J", mutual: 10 },
  { id: 7, name: "Lucas Martins", headline: "Piloto na Los Santos Airlines", color: "#3498DB", initial: "L", mutual: 4 },
  { id: 8, name: "Fernanda Lima", headline: "Chef no Bahama Mamas West", color: "#E74C3C", initial: "F", mutual: 9 },
];

const MOCK_INVITES = [
  { id: 9, name: "Diego Rocha", headline: "Dono da LS Tattoos", color: "#8E44AD", initial: "D", mutual: 3 },
  { id: 10, name: "Camila Souza", headline: "Personal Trainer no Iron Gym", color: "#E91E63", initial: "C", mutual: 7 },
  { id: 11, name: "Bruno Neves", headline: "DJ no Bahama Mamas", color: "#FF9800", initial: "B", mutual: 5 },
];

const MOCK_POSTS = [
  {
    id: 1, userId: 2, name: "Marina Oliveira", headline: "CEO na Weazel News", color: "#FF0000", initial: "M",
    content: "Estamos contratando! A Weazel News esta com vagas abertas para Reporter de Campo e Cinegrafista. Se voce tem paixao por jornalismo e conhece as ruas de Los Santos, mande seu curriculo.\n\n#VagasLS #Jornalismo #WeazelNews",
    likes: 145, comments: 32, reposts: 8, timeAgo: "2h",
    gradient: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
    hasImage: true,
  },
  {
    id: 2, userId: 4, name: "Ana Costa", headline: "Medica na Pillbox Medical", color: "#1DB954", initial: "A",
    content: "Dia de treinamento na Pillbox Medical! Formamos mais 5 paramedicos que vao atender a populacao de Los Santos. Orgulho dessa equipe incrivel que salva vidas todos os dias.",
    likes: 287, comments: 45, reposts: 12, timeAgo: "4h",
    gradient: null,
    hasImage: false,
  },
  {
    id: 3, userId: 3, name: "Rafael Santos", headline: "Mecanico Chefe na LS Customs", color: "#FF6B00", initial: "R",
    content: "Nova parceria fechada entre a LS Customs e a Street Racing League! Agora somos os mecanicos oficiais da competicao. Preparados pra fazer esses motores rugir.\n\n#LSCustoms #Mecanica #StreetRacing",
    likes: 198, comments: 28, reposts: 15, timeAgo: "6h",
    gradient: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)",
    hasImage: true,
  },
  {
    id: 4, userId: 5, name: "Pedro Almeida", headline: "Advogado na Freeman & Associates", color: "#9B59B6", initial: "P",
    content: "Artigo novo no meu blog: 'Direitos Trabalhistas em Los Santos - O que voce precisa saber'. Link nos comentarios. Compartilhem com quem precisa!\n\n#Direito #LossSantos #TrabalhoDigno",
    likes: 89, comments: 14, reposts: 22, timeAgo: "8h",
    gradient: null,
    hasImage: false,
  },
  {
    id: 5, userId: 6, name: "Julia Ferreira", headline: "Corretora na Dynasty 8 Real Estate", color: "#E67E22", initial: "J",
    content: "Mansion em Vinewood Hills acabou de entrar no mercado! 4 quartos, piscina, vista pro oceano. Interessados, me chamem no privado.\n\n#Imoveis #VinewoodHills #Dynasty8",
    likes: 312, comments: 56, reposts: 30, timeAgo: "10h",
    gradient: "linear-gradient(135deg, #E67E22 0%, #D35400 100%)",
    hasImage: true,
  },
  {
    id: 6, userId: 7, name: "Lucas Martins", headline: "Piloto na Los Santos Airlines", color: "#3498DB", initial: "L",
    content: "Completei 1000 horas de voo essa semana! De estagiario na pista a capitao de Boeing. Nunca desistam dos seus sonhos. O ceu nao e o limite.",
    likes: 534, comments: 78, reposts: 41, timeAgo: "12h",
    gradient: null,
    hasImage: false,
  },
];

// ---------- Inline SVG Icons (100% V0) ----------

const LinkedInLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <svg width={24} height={24} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path d="M7.5 9.5v8M7.5 6.5v.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.5 17.5v-4.5c0-1.5 1-2.5 2.5-2.5s2 1 2 2.5v4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 9.5v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

const SearchSvg = ({ size = 20, color = "#aaa" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const HomeSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    {!active && <polyline points="9 22 9 12 15 12 15 22" />}
  </svg>
);

const NetworkSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PostSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const NotifSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const BriefcaseSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke="#fff" strokeWidth={active ? 2 : 1.5}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const BackArrow = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ThumbUpSvg = ({ filled = false, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#0A66C2" : "none"} stroke={filled ? "#0A66C2" : "#aaa"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const CommentSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const RepostSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const SendSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MessageSvg = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const EditSvg = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckSvg = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#0A66C2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const MoreSvg = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="#aaa">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const GlobeSvg = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// ============================================================
// Component
// ============================================================

export default function LinkedIn({ onNavigate }) {
  const [view, setView] = useState("feed");
  const [likedPosts, setLikedPosts] = useState({});
  const [connectedUsers, setConnectedUsers] = useState({});
  const [acceptedInvites, setAcceptedInvites] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Backend state
  const [currentUser, setCurrentUser] = useState(MOCK_CURRENT_USER);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [connections, setConnections] = useState(MOCK_CONNECTIONS);
  const [invites, setInvites] = useState(MOCK_INVITES);

  // Load from backend
  useEffect(() => {
    (async () => {
      try {
        const profileRes = await fetchBackend('linkedin_get_profile');
        if (profileRes?.ok && profileRes.profile) {
          setCurrentUser(prev => ({ ...prev, ...profileRes.profile }));
        }
      } catch (e) { console.log('[LinkedIn] Profile fallback to mock'); }

      try {
        const feedRes = await fetchBackend('linkedin_get_feed');
        if (feedRes?.ok && feedRes.posts?.length) {
          setPosts(feedRes.posts.map(p => ({
            id: p.id,
            userId: p.profile_id || p.userId,
            name: p.name || 'Profissional',
            headline: p.headline || '',
            color: p.avatar || '#666',
            initial: (p.name || '?')[0].toUpperCase(),
            content: p.content,
            likes: p.likes_count || 0,
            comments: p.comments_count || 0,
            reposts: p.reposts_count || 0,
            timeAgo: p.timeAgo || '',
            gradient: null,
            hasImage: false,
            liked: p.liked ? true : false,
          })));
        }
      } catch (e) { console.log('[LinkedIn] Feed fallback to mock'); }

      try {
        const connRes = await fetchBackend('linkedin_get_professionals');
        if (connRes?.ok && connRes.profiles?.length) {
          setConnections(connRes.profiles.slice(0, 7).map(p => ({
            id: p.id,
            name: p.name,
            headline: p.headline || '',
            color: p.avatar || '#666',
            initial: (p.name || '?')[0].toUpperCase(),
            mutual: p.connections_count || 0,
          })));
        }
      } catch (e) { console.log('[LinkedIn] Connections fallback to mock'); }
    })();
  }, []);

  // Actions with backend
  const toggleLike = useCallback(async (postId) => {
    setLikedPosts((p) => ({ ...p, [postId]: !p[postId] }));
    try { await fetchBackend('linkedin_toggle_like', { postId }); } catch (e) {}
  }, []);

  const toggleConnect = useCallback(async (userId) => {
    setConnectedUsers((p) => ({ ...p, [userId]: !p[userId] }));
    try { await fetchBackend('linkedin_send_connection', { targetId: userId }); } catch (e) {}
  }, []);

  const acceptInvite = useCallback(async (userId) => {
    setAcceptedInvites((p) => ({ ...p, [userId]: true }));
    try { await fetchBackend('linkedin_accept_connection', { connectionId: userId }); } catch (e) {}
  }, []);

  // ============================================================
  // NETWORK VIEW
  // ============================================================
  if (view === "network") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderBottom: "1px solid #333", flexShrink: 0,
        }}>
          <LinkedInLogo />
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            background: "#1a1a1a", borderRadius: 8, padding: "8px 12px", gap: 8,
          }}>
            <SearchSvg size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar"
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#fff", fontSize: 13, fontFamily: "inherit",
              }}
            />
          </div>
          <button onClick={() => onNavigate?.("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <MessageSvg />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Manage network */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderBottom: "1px solid #222",
          }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Gerenciar minha rede</span>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </div>

          {/* Invitations */}
          <div style={{ padding: "14px 16px 8px", borderBottom: "1px solid #222" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>
                Convites ({invites.filter((i) => !acceptedInvites[i.id]).length})
              </span>
            </div>
            {invites.map((invite) => {
              const accepted = acceptedInvites[invite.id] || false;
              return (
                <div key={invite.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: "1px solid #1a1a1a",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                    background: invite.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, color: "#fff",
                  }}>
                    {invite.initial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{invite.name}</div>
                    <div style={{ color: "#aaa", fontSize: 12, lineHeight: 1.3 }}>{invite.headline}</div>
                    <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>{invite.mutual} conexoes em comum</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {accepted ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckSvg />
                        <span style={{ color: "#0A66C2", fontSize: 13, fontWeight: 600 }}>Conectado</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {}}
                          style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "none", border: "1px solid #666", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                        <button
                          onClick={() => acceptInvite(invite.id)}
                          style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "none", border: "1px solid #0A66C2", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#0A66C2" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* People you may know */}
          <div style={{ padding: "14px 16px 8px" }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Pessoas que voce talvez conheca</span>
          </div>
          <div style={{
            display: "flex", gap: 10, padding: "10px 16px",
            overflowX: "auto", flexShrink: 0,
          }}>
            {connections.slice(0, 6).map((person) => {
              const connected = connectedUsers[person.id] || false;
              return (
                <div key={person.id} style={{
                  minWidth: 150, background: "#1a1a1a", borderRadius: 12,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "16px 12px", gap: 8, flexShrink: 0,
                  border: "1px solid #333",
                }}>
                  <div style={{
                    height: 40, borderRadius: "8px 8px 0 0",
                    background: `linear-gradient(135deg, ${person.color}88, ${person.color})`,
                    marginTop: -16, marginLeft: -12, marginRight: -12,
                    width: "calc(100% + 24px)",
                  }} />
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: person.color, marginTop: -36,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 700, color: "#fff",
                    border: "3px solid #1a1a1a",
                  }}>
                    {person.initial}
                  </div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
                    {person.name}
                  </div>
                  <div style={{ color: "#aaa", fontSize: 11, textAlign: "center", lineHeight: 1.3, minHeight: 28 }}>
                    {person.headline.length > 40 ? person.headline.substring(0, 40) + "..." : person.headline}
                  </div>
                  <div style={{ color: "#666", fontSize: 10 }}>{person.mutual} conexoes em comum</div>
                  <button
                    onClick={() => toggleConnect(person.id)}
                    style={{
                      width: "100%", padding: "7px 0", borderRadius: 20,
                      background: connected ? "#1a1a1a" : "none",
                      border: connected ? "1px solid #666" : "1px solid #0A66C2",
                      cursor: "pointer",
                      color: connected ? "#aaa" : "#0A66C2",
                      fontSize: 13, fontWeight: 700,
                    }}
                  >
                    {connected ? "Pendente" : "Conectar"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* News section */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid #222", marginTop: 8 }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, display: "block", marginBottom: 12 }}>Noticias de Los Santos</span>
            {[
              { title: "Maze Bank anuncia novo programa de credito para pequenos negocios", time: "ha 3h", readers: "1.245 leitores" },
              { title: "Weazel News abre inscricoes para programa de trainee 2026", time: "ha 5h", readers: "892 leitores" },
              { title: "Pillbox Medical inaugura nova ala de emergencia", time: "ha 8h", readers: "2.103 leitores" },
              { title: "LS Customs fecha parceria com Street Racing League", time: "ha 12h", readers: "567 leitores" },
            ].map((news, i) => (
              <button key={i} style={{
                display: "flex", gap: 10, padding: "8px 0", width: "100%",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: "1px solid #1a1a1a", textAlign: "left",
              }}>
                <div style={{ color: "#666", fontSize: 16, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>{"#"}{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{news.title}</div>
                  <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>{news.time} - {news.readers}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ height: 16 }} />
        </div>

        <LINav active="network" setView={setView} />
      </div>
    );
  }

  // ============================================================
  // PROFILE VIEW
  // ============================================================
  if (view === "profile") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderBottom: "1px solid #333", flexShrink: 0,
        }}>
          <button onClick={() => setView("feed")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <BackArrow />
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Perfil</span>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <EditSvg />
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <MoreSvg />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: "100%", height: 100,
              background: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)",
            }} />
            <div style={{
              position: "absolute", bottom: -40, left: 16,
              width: 80, height: 80, borderRadius: "50%",
              border: "4px solid #000",
              background: currentUser.avatarColor || "#0A66C2",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 700, color: "#fff",
            }}>
              {currentUser.initial || "C"}
            </div>
          </div>

          <div style={{ padding: "48px 16px 0" }}>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{currentUser.name}</div>
            <div style={{ color: "#ccc", fontSize: 14, marginTop: 2, lineHeight: 1.4 }}>{currentUser.headline}</div>
            <div style={{ color: "#666", fontSize: 13, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              {currentUser.location}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <span style={{ color: "#0A66C2", fontSize: 13, fontWeight: 600 }}>{currentUser.connections} conexoes</span>
              <span style={{ color: "#666", fontSize: 13 }}>-</span>
              <span style={{ color: "#0A66C2", fontSize: 13, fontWeight: 600 }}>{currentUser.followers} seguidores</span>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button style={{
                flex: 1, padding: "8px 0", borderRadius: 20,
                background: "#0A66C2", border: "none", cursor: "pointer",
                color: "#fff", fontSize: 14, fontWeight: 700,
              }}>
                Disponivel para
              </button>
              <button style={{
                flex: 1, padding: "8px 0", borderRadius: 20,
                background: "none", border: "1px solid #0A66C2", cursor: "pointer",
                color: "#0A66C2", fontSize: 14, fontWeight: 700,
              }}>
                Adicionar secao
              </button>
              <button style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "none", border: "1px solid #666", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MoreSvg />
              </button>
            </div>
          </div>

          <div style={{ padding: "20px 16px", borderTop: "1px solid #222", marginTop: 16 }}>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Sobre</div>
            <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6 }}>{currentUser.about}</div>
          </div>

          <div style={{ padding: "16px 16px", borderTop: "1px solid #222" }}>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Experiencia</div>
            {(currentUser.experience || []).map((exp) => (
              <div key={exp.id} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                  background: exp.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: "#fff",
                }}>
                  {exp.initial}
                </div>
                <div>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{exp.role}</div>
                  <div style={{ color: "#ccc", fontSize: 13 }}>{exp.company}</div>
                  <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{exp.period}</div>
                  <div style={{ color: "#666", fontSize: 12 }}>{exp.location}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px 16px", borderTop: "1px solid #222" }}>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Formacao academica</div>
            {(currentUser.education || []).map((edu) => (
              <div key={edu.id} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                  background: edu.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: "#fff",
                }}>
                  {edu.initial}
                </div>
                <div>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{edu.school}</div>
                  <div style={{ color: "#ccc", fontSize: 13 }}>{edu.degree}</div>
                  <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{edu.period}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px 16px", borderTop: "1px solid #222" }}>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Competencias</div>
            {(currentUser.skills || []).map((skill, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0", borderBottom: "1px solid #1a1a1a",
              }}>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{skill}</span>
                <div style={{
                  padding: "4px 10px", borderRadius: 12,
                  background: "#1a1a1a", border: "1px solid #333",
                }}>
                  <span style={{ color: "#0A66C2", fontSize: 12, fontWeight: 600 }}>{Math.floor(Math.random() * 40) + 10} recomendacoes</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px 16px", borderTop: "1px solid #222" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>Atividade</div>
                <div style={{ color: "#0A66C2", fontSize: 13 }}>{currentUser.followers} seguidores</div>
              </div>
              <button style={{
                padding: "6px 16px", borderRadius: 20,
                background: "none", border: "1px solid #0A66C2",
                color: "#0A66C2", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
                Criar post
              </button>
            </div>
            <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.5 }}>
              Voce ainda nao publicou nada. Posts que voce criar aparecerao aqui.
            </div>
          </div>

          <div style={{ height: 16 }} />
        </div>

        <LINav active="profile" setView={setView} />
      </div>
    );
  }

  // ============================================================
  // FEED VIEW (default)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderBottom: "1px solid #333", flexShrink: 0,
      }}>
        <LinkedInLogo />
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          background: "#1a1a1a", borderRadius: 8, padding: "8px 12px", gap: 8,
        }}>
          <SearchSvg size={16} />
          <span style={{ color: "#666", fontSize: 13 }}>Pesquisar</span>
        </div>
        <button onClick={() => onNavigate?.("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          <MessageSvg />
        </button>
      </div>

      {/* Create post bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderBottom: "8px solid #1a1a1a",
      }}>
        <button onClick={() => setView("profile")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: currentUser.avatarColor || "#0A66C2",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#fff",
          }}>
            {currentUser.initial || "C"}
          </div>
        </button>
        <div style={{
          flex: 1, height: 36, borderRadius: 20, border: "1px solid #555",
          display: "flex", alignItems: "center", paddingLeft: 14,
          fontSize: 13, color: "#888", cursor: "pointer",
        }}>
          No que voce esta pensando?
        </div>
      </div>

      {/* Quick actions */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "8px 14px", borderBottom: "8px solid #1a1a1a",
      }}>
        {[
          { icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#70B5F9" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>, label: "Foto" },
          { icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#7FC15E" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><polygon points="10 8 16 12 10 16" /></svg>, label: "Video" },
          { icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#E7A33E" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, label: "Artigo" },
        ].map((action, i) => (
          <button key={i} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
          }}>
            {action.icon}
            <span style={{ color: "#aaa", fontSize: 12, fontWeight: 500 }}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {posts.map((post) => {
          const liked = likedPosts[post.id] || post.liked || false;
          return (
            <div key={post.id} style={{
              background: "#000", borderBottom: "8px solid #1a1a1a",
            }}>
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "12px 14px 8px",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: post.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, fontWeight: 700, color: "#fff",
                }}>
                  {post.initial}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{post.name}</div>
                  <div style={{ color: "#aaa", fontSize: 12, lineHeight: 1.3 }}>{post.headline}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <span style={{ color: "#666", fontSize: 11 }}>{post.timeAgo}</span>
                    <span style={{ color: "#666", fontSize: 11 }}>-</span>
                    <GlobeSvg />
                  </div>
                </div>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <MoreSvg />
                </button>
              </div>

              <div style={{ padding: "0 14px 10px" }}>
                <div style={{ color: "#ddd", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-line" }}>
                  {post.content}
                </div>
              </div>

              {post.hasImage && post.gradient && (
                <div style={{
                  width: "100%", aspectRatio: "16/10",
                  background: post.gradient,
                }} />
              )}

              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 14px",
                borderBottom: "1px solid #222",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#0A66C2",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ThumbUpSvg filled size={10} />
                  </div>
                  <span style={{ color: "#aaa", fontSize: 12 }}>{liked ? post.likes + 1 : post.likes}</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "#aaa", fontSize: 12 }}>{post.comments} comentarios</span>
                  <span style={{ color: "#aaa", fontSize: 12 }}>{post.reposts} republicacoes</span>
                </div>
              </div>

              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-around",
                padding: "4px 0",
              }}>
                {[
                  { icon: <ThumbUpSvg filled={liked} />, label: "Gostei", active: liked, action: () => toggleLike(post.id) },
                  { icon: <CommentSvg />, label: "Comentar", active: false, action: () => {} },
                  { icon: <RepostSvg />, label: "Republicar", active: false, action: () => {} },
                  { icon: <SendSvg />, label: "Enviar", active: false, action: () => {} },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.action}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      background: "none", border: "none", cursor: "pointer", padding: "8px 12px",
                    }}
                  >
                    {btn.icon}
                    <span style={{
                      color: btn.active ? "#0A66C2" : "#aaa",
                      fontSize: 11, fontWeight: btn.active ? 700 : 500,
                    }}>
                      {btn.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ height: 16 }} />
      </div>

      <LINav active="feed" setView={setView} />
    </div>
  );
}

// ---------- LinkedIn Bottom Navigation (100% V0) ----------
function LINav({ active, setView }) {
  const tabs = [
    { id: "feed", label: "Inicio", icon: <HomeSvg active={active === "feed"} /> },
    { id: "network", label: "Rede", icon: <NetworkSvg active={active === "network"} /> },
    { id: "post", label: "Publicar", icon: <PostSvg /> },
    { id: "notif", label: "Notificacoes", icon: <NotifSvg /> },
    { id: "profile", label: "Vagas", icon: <BriefcaseSvg active={active === "profile"} /> },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "6px 0 4px", borderTop: "1px solid #222", background: "#0d0d0d", flexShrink: 0,
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            if (tab.id === "feed" || tab.id === "network") setView(tab.id);
            if (tab.id === "profile") setView("profile");
          }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer", padding: "4px 6px",
          }}
        >
          {tab.icon}
          <span style={{
            color: active === tab.id || (tab.id === "profile" && active === "profile") ? "#fff" : "#aaa",
            fontSize: 9, fontWeight: active === tab.id ? 700 : 500,
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

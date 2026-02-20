// LinkedIn App — Smartphone FiveM
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { fetchBackend } from '../hooks/useNui';

// ============================================================
// LinkedIn App — Pixel-perfect 2025/2026 dark mode replica
// Telas: feed | jobs | jobDetail | network | profile | otherProfile
// ============================================================

// ---------- Dados fake (estrutura backend-ready) ----------
const CURRENT_USER = {
  id: 1,
  name: "Carlos Silva",
  headline: "Desenvolvedor Full-Stack | LS Customs",
  company: "LS Customs",
  position: "Desenvolvedor Full-Stack",
  location: "Los Santos, SA",
  connections: 487,
  avatarColor: "#0A66C2",
  initial: "C",
  bio: "Apaixonado por tecnologia e automacao. Trabalhando com sistemas de gestao veicular e ERP para oficinas mecanicas em Los Santos. Sempre buscando novas conexoes e oportunidades.",
  experience: [
    { id: 1, title: "Desenvolvedor Full-Stack", company: "LS Customs", period: "2024 - Presente", desc: "Desenvolvimento de sistemas internos e plataforma de agendamento online." },
    { id: 2, title: "Dev Junior", company: "Agencia Solucoes Digitais", period: "2022 - 2024", desc: "Criacao de websites e sistemas web para clientes de Los Santos." },
    { id: 3, title: "Estagiario de TI", company: "Pillbox Hill Medical", period: "2021 - 2022", desc: "Suporte tecnico e manutencao de sistemas hospitalares." },
  ],
  skills: ["React", "Node.js", "TypeScript", "Python", "SQL", "Git", "Docker", "Tailwind CSS"],
};

const PROFESSIONALS = [
  { id: 2, name: "Maria Oliveira", headline: "Enfermeira Chefe | Pillbox Hill Medical", company: "Pillbox Hill Medical", avatarColor: "#E1306C", initial: "M", connected: true, mutuals: 12 },
  { id: 3, name: "Joao Santos", headline: "Mecanico Chefe | LS Customs", company: "LS Customs", avatarColor: "#F77737", initial: "J", connected: true, mutuals: 24 },
  { id: 4, name: "Ana Costa", headline: "Bartender Senior | Bahama Mamas", company: "Bahama Mamas", avatarColor: "#833AB4", initial: "A", connected: false, mutuals: 8 },
  { id: 5, name: "Pedro Almeida", headline: "Personal Trainer | Iron Gym LS", company: "Iron Gym LS", avatarColor: "#43A047", initial: "P", connected: false, mutuals: 5 },
  { id: 6, name: "Larissa Mendes", headline: "CEO | Lari Fashion Store", company: "Lari Fashion Store", avatarColor: "#C13584", initial: "L", connected: true, mutuals: 18 },
  { id: 7, name: "Rafael Torres", headline: "Mec. Import | Rafa Tuner Import", company: "Rafa Tuner Import", avatarColor: "#FD1D1D", initial: "R", connected: false, mutuals: 3 },
  { id: 8, name: "Fernanda Lima", headline: "Fotografa | Freelancer", company: "Freelancer", avatarColor: "#405DE6", initial: "F", connected: true, mutuals: 15 },
  { id: 9, name: "Diego Martins", headline: "Seguranca | Maze Bank", company: "Maze Bank", avatarColor: "#2E7D32", initial: "D", connected: false, mutuals: 7 },
  { id: 10, name: "Camila Rocha", headline: "Recepcionista | Diamond Casino", company: "Diamond Casino", avatarColor: "#FF6F00", initial: "C", connected: false, mutuals: 2 },
  { id: 11, name: "Bruno Ferreira", headline: "Piloto | Los Santos Airways", company: "Los Santos Airways", avatarColor: "#0288D1", initial: "B", connected: true, mutuals: 9 },
];

const JOBS = [
  { id: 1, title: "Mecanico Automotivo", company: "LS Customs", location: "Vinewood, LS", salary: "R$ 4.500 - R$ 7.000", type: "CLT", candidates: 23, time: "ha 2h", isNew: true, desc: "Buscamos mecanico experiente para nossa unidade de Vinewood. Responsavel por manutencao preventiva e corretiva de veiculos de alta performance.", reqs: ["Experiencia minima de 2 anos", "Conhecimento em motores V6/V8", "CNH categoria B", "Disponibilidade de horario"], companyColor: "#E65100" },
  { id: 2, title: "Enfermeiro(a)", company: "Pillbox Hill Medical", location: "Pillbox Hill, LS", salary: "R$ 5.200 - R$ 8.500", type: "CLT", candidates: 45, time: "ha 5h", isNew: true, desc: "Hospital Pillbox Hill busca enfermeiros para atendimento emergencial e cuidados intensivos.", reqs: ["COREN ativo", "Experiencia em emergencia", "Plantao 12x36", "BLS obrigatorio"], companyColor: "#C62828" },
  { id: 3, title: "Bartender", company: "Bahama Mamas", location: "Del Perro, LS", salary: "R$ 2.800 - R$ 4.200", type: "CLT", candidates: 67, time: "ha 1d", isNew: false, desc: "A melhor casa noturna de Los Santos busca bartenders criativos para sua equipe.", reqs: ["Experiencia em coquetelaria", "Disponibilidade noturna", "Boa comunicacao", "Maior de 18 anos"], companyColor: "#4A148C" },
  { id: 4, title: "Desenvolvedor React", company: "Agencia Solucoes Digitais", location: "Remoto", salary: "R$ 8.000 - R$ 12.000", type: "CLT", candidates: 112, time: "ha 3h", isNew: true, desc: "Agencia busca dev React pleno/senior para projetos de clientes em Los Santos e regiao.", reqs: ["React + TypeScript", "3+ anos experiencia", "Conhecimento em APIs REST", "Portfolio atualizado"], companyColor: "#0A66C2" },
  { id: 5, title: "Fotografo(a) Profissional", company: "LS Media Group", location: "Vinewood, LS", salary: "R$ 3.500 - R$ 6.000", type: "Freelance", candidates: 34, time: "ha 8h", isNew: false, desc: "Produtora de midia busca fotografo para cobertura de eventos e producao de conteudo.", reqs: ["Portfolio profissional", "Equipamento proprio", "Edicao em Lightroom/Photoshop", "Veiculo proprio"], companyColor: "#F57F17" },
  { id: 6, title: "Personal Trainer", company: "Iron Gym LS", location: "Vespucci Beach, LS", salary: "R$ 3.000 - R$ 5.500", type: "Freelance", candidates: 19, time: "ha 2d", isNew: false, desc: "Academia busca personal trainer para atendimento VIP na unidade da praia.", reqs: ["CREF ativo", "Experiencia com musculacao", "Primeiros socorros", "Perfil comunicativo"], companyColor: "#2E7D32" },
  { id: 7, title: "Seguranca Patrimonial", company: "Maze Bank", location: "Downtown, LS", salary: "R$ 3.800 - R$ 5.000", type: "CLT", candidates: 56, time: "ha 12h", isNew: true, desc: "Maze Bank contrata seguranças para protecao de agencias e transporte de valores.", reqs: ["Curso de vigilante", "Porte de arma", "Experiencia minima 1 ano", "Ficha limpa"], companyColor: "#1B5E20" },
  { id: 8, title: "Vendedora de Moda", company: "Lari Fashion Store", location: "Rodeo Drive, LS", salary: "R$ 2.500 - R$ 3.800", type: "Meio Periodo", candidates: 28, time: "ha 6h", isNew: false, desc: "Loja de moda feminina busca vendedora com perfil fashion para a loja de Rodeo Drive.", reqs: ["Experiencia em vendas", "Conhecimento em moda", "Boa apresentacao", "Ingles basico"], companyColor: "#C13584" },
  { id: 9, title: "Piloto Comercial", company: "Los Santos Airways", location: "LSIA, LS", salary: "R$ 15.000 - R$ 22.000", type: "CLT", candidates: 8, time: "ha 4h", isNew: true, desc: "Companhia aerea busca pilotos comerciais para rotas nacionais e internacionais.", reqs: ["Brevê comercial PCH/PCA", "500h de voo minimas", "Ingles fluente", "Exames medicos em dia"], companyColor: "#0288D1" },
  { id: 10, title: "Croupier / Dealer", company: "Diamond Casino & Resort", location: "Vinewood Hills, LS", salary: "R$ 4.000 - R$ 6.500", type: "CLT", candidates: 41, time: "ha 1d", isNew: false, desc: "Casino busca croupiers para mesas de poker, blackjack e roleta.", reqs: ["Curso de croupier", "Raciocinio rapido", "Disponibilidade noturna", "Sem antecedentes"], companyColor: "#FF6F00" },
];

const FEED_POSTS = [
  { id: 1, authorId: 6, text: "Estamos contratando! A Lari Fashion Store abriu 3 vagas para vendedoras na nossa nova unidade em Rodeo Drive. Se voce tem paixao por moda, me chama no inbox!", likes: 87, comments: 23, time: "2h", liked: false },
  { id: 2, authorId: 3, text: "Orgulho de fazer parte da equipe LS Customs! Hoje completamos 500 veiculos customizados esse ano. Obrigado a todos os clientes e parceiros que confiam no nosso trabalho!", likes: 234, comments: 45, time: "4h", liked: false },
  { id: 3, authorId: 2, text: "Dica de saude: cuide do seu corpo! Acabei de participar de um workshop sobre emergencias pre-hospitalares no Pillbox. Conhecimento salva vidas!", likes: 156, comments: 18, time: "6h", liked: false },
  { id: 4, authorId: 8, text: "Nova serie de fotos do skyline de Los Santos ao entardecer. A cidade e linda quando vista de cima! Link do portfolio nos comentarios.", likes: 342, comments: 56, time: "8h", liked: false },
  { id: 5, authorId: 11, text: "Primeiro voo solo concluido com sucesso! O ceu de Los Santos nunca foi tao bonito. Gratidao a toda equipe da Los Santos Airways pelo suporte!", likes: 445, comments: 78, time: "12h", liked: false },
  { id: 6, authorId: 5, text: "Treino monstro com meus alunos VIP hoje na Iron Gym! Resultados aparecem quando a disciplina e constante. Quem quer transformar o corpo, me procura!", likes: 98, comments: 12, time: "1d", liked: false },
  { id: 7, authorId: 9, text: "Seguranca nao e custo, e investimento. Fechamos mais um contrato de protecao executiva para o Maze Bank. Profissionalismo e seriedade sempre!", likes: 67, comments: 8, time: "1d", liked: false },
];

const INVITES = [
  { id: 101, name: "Thiago Nascimento", headline: "Gerente | Cluckin' Bell LS", avatarColor: "#FF6F00", initial: "T" },
  { id: 102, name: "Isabela Cruz", headline: "Advogada | Santos & Filhos", avatarColor: "#8E24AA", initial: "I" },
  { id: 103, name: "Marcos Vieira", headline: "Chef de Cozinha | Up-n-Atom", avatarColor: "#D84315", initial: "M" },
];

// ---------- Inline SVG Icons ----------
const LinkedInLogo = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const SearchSvg = ({ size = 20, color = "#999" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const MessageSvg = ({ size = 22, color = "#B0B0B0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const BellSvg = ({ size = 22, color = "#B0B0B0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const HomeSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke={active ? "#fff" : "#999"} strokeWidth="1.8">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>{!active && <polyline points="9 22 9 12 15 12 15 22"/>}
  </svg>
);

const BriefcaseSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke={active ? "#fff" : "#999"} strokeWidth="1.8">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
  </svg>
);

const NetworkSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#999"} strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const UserSvg = ({ active = false }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#999"} strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const ThumbUpSvg = ({ filled = false, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#0A66C2" : "none"} stroke={filled ? "#0A66C2" : "#999"} strokeWidth="1.8">
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
  </svg>
);

const CommentSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const ShareSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>
);

const BackArrow = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
);

const PinSvg = ({ size = 14, color = "#999" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="#000"/></svg>
);

const BuildingSvg = ({ size = 14, color = "#999" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 22v-4h6v4"/>
  </svg>
);

const FilterSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const PlusSvg = ({ size = 24, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CheckSvg = ({ size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
);

const MoneySvg = ({ size = 14, color = "#4CAF50" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);

const ClockSvg = ({ size = 14, color = "#999" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ---------- Helpers ----------
function getAuthor(authorId) {
  return PROFESSIONALS.find((p) => p.id === authorId) || PROFESSIONALS[0];
}

// ---------- Component ----------
export default function LinkedInApp({ onNavigate }) {
  const [view, setView] = useState("feed");
  const [posts, setPosts] = useState(FEED_POSTS);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(JOBS[0]);
  const [selectedProfile, setSelectedProfile] = useState(PROFESSIONALS[0]);
  const [connectionStates, setConnectionStates] = useState>(() => {
    const init = {};
    PROFESSIONALS.forEach((p) => { init[p.id] = p.connected ? "connected" : "none"; });
    return init;
  });
  const [dismissedInvites, setDismissedInvites] = useState([]);
  const [acceptedInvites, setAcceptedInvites] = useState([]);
  const [jobSearch, setJobSearch] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  // === Backend Integration ===
  useEffect(() => {
    fetchBackend('linkedin_get_feed').then(res => { if (res?.ok && res.posts?.length) setPosts(res.posts); });
    fetchBackend('linkedin_get_connections').then(res => {
      if (res?.ok && res.connections) {
        const init = {};
        res.connections.forEach(c => { init[c.id] = c.status || "none"; });
        setConnectionStates(prev => ({ ...prev, ...init }));
      }
    });
  }, []);

  const toggleLike = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    fetchBackend('linkedin_toggle_like', { postId });
  }, []);

  const applyJob = useCallback((jobId) => {
    setAppliedJobs((prev) => prev.includes(jobId) ? prev : [...prev, jobId]);
    fetchBackend('linkedin_apply_job', { jobId });
  }, []);

  const sendConnect = useCallback((profId) => {
    setConnectionStates((prev) => ({ ...prev, [profId]: "pending" }));
    fetchBackend('linkedin_send_connection', { targetId: profId });
  }, []);

  const acceptInvite = useCallback((inviteId) => {
    setAcceptedInvites((prev) => [...prev, inviteId]);
    fetchBackend('linkedin_accept_connection', { connectionId: inviteId });
  }, []);

  const dismissInvite = useCallback((inviteId) => {
    setDismissedInvites((prev) => [...prev, inviteId]);
    fetchBackend('linkedin_reject_connection', { connectionId: inviteId });
  }, []);

  const openJob = useCallback((job) => {
    setSelectedJob(job);
    setView("jobDetail");
  }, []);

  const openProfile = useCallback((prof) => {
    setSelectedProfile(prof);
    setView("otherProfile");
  }, []);

  const activeInvites = INVITES.filter((inv) => !dismissedInvites.includes(inv.id) && !acceptedInvites.includes(inv.id));

  // ============================================================
  // TOP BAR (shared)
  // ============================================================
  const TopBar = ({ showSearch = true }) => (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
      background: "#1a1a1a", borderBottom: "1px solid #333", flexShrink: 0,
    }}>
      <LinkedInLogo />
      {showSearch && (
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 6,
          background: "#333", borderRadius: 4, padding: "6px 10px",
        }}>
          <SearchSvg size={16} color="#999" />
          <span style={{ color: "#999", fontSize: 13 }}>Pesquisar</span>
        </div>
      )}
      {!showSearch && <div style={{ flex: 1 }} />}
      <button style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: 0 }}>
        <MessageSvg />
      </button>
      <button style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: 0 }}>
        <BellSvg />
        <div style={{
          position: "absolute", top: -2, right: -2,
          width: 16, height: 16, borderRadius: "50%",
          background: "#CC1016", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 800, color: "#fff",
        }}>3</div>
      </button>
    </div>
  );

  // ============================================================
  // TAB BAR (shared)
  // ============================================================
  const TabBar = () => {
    const tabs = [
      { key: "feed", label: "Feed" },
      { key: "jobs", label: "Vagas" },
      { key: "network", label: "Rede" },
      { key: "profile", label: "Perfil" },
    ];
    const currentTab = view === "jobDetail" ? "jobs" : view === "otherProfile" ? "network" : view;
    return (
      <div style={{
        display: "flex", background: "#1a1a1a", borderBottom: "1px solid #333", flexShrink: 0,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            style={{
              flex: 1, padding: "10px 0", background: "none", border: "none",
              cursor: "pointer", position: "relative",
              color: currentTab === tab.key ? "#fff" : "#999",
              fontSize: 13, fontWeight: currentTab === tab.key ? 700 : 400,
            }}
          >
            {tab.label}
            {currentTab === tab.key && (
              <div style={{
                position: "absolute", bottom: 0, left: "20%", right: "20%",
                height: 2, background: "#0A66C2", borderRadius: 1,
              }} />
            )}
          </button>
        ))}
      </div>
    );
  };

  // ============================================================
  // JOB DETAIL VIEW
  // ============================================================
  if (view === "jobDetail") {
    const applied = appliedJobs.includes(selectedJob.id);
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 14px",
          background: "#1a1a1a", borderBottom: "1px solid #333", flexShrink: 0,
        }}>
          <button onClick={() => setView("jobs")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <BackArrow />
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12, flex: 1 }}>Detalhes da Vaga</span>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Banner */}
          <div style={{
            height: 100, background: `linear-gradient(135deg, ${selectedJob.companyColor}, ${selectedJob.companyColor}88, #0A66C2)`,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", bottom: -24, left: 16,
              width: 56, height: 56, borderRadius: 12,
              background: selectedJob.companyColor, border: "3px solid #000",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: "#fff",
            }}>
              {selectedJob.company.charAt(0)}
            </div>
          </div>

          <div style={{ padding: "32px 16px 16px" }}>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 4, lineHeight: 1.3 }}>{selectedJob.title}</div>
            <div style={{ color: "#0A66C2", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{selectedJob.company}</div>

            {/* Info rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PinSvg size={16} color="#999" />
                <span style={{ color: "#ccc", fontSize: 14 }}>{selectedJob.location}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MoneySvg size={16} color="#4CAF50" />
                <span style={{ color: "#4CAF50", fontSize: 14, fontWeight: 600 }}>{selectedJob.salary}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ClockSvg size={16} color="#999" />
                <span style={{ color: "#ccc", fontSize: 14 }}>{selectedJob.time}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                  background: selectedJob.type === "CLT" ? "rgba(10,102,194,0.2)" : selectedJob.type === "Freelance" ? "rgba(255,152,0,0.2)" : "rgba(156,39,176,0.2)",
                  color: selectedJob.type === "CLT" ? "#0A66C2" : selectedJob.type === "Freelance" ? "#FF9800" : "#9C27B0",
                }}>{selectedJob.type}</span>
              </div>
            </div>

            {/* Candidates */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
              padding: "12px", background: "#1a1a1a", borderRadius: 8,
            }}>
              <div style={{ display: "flex" }}>
                {[PROFESSIONALS[0], PROFESSIONALS[1], PROFESSIONALS[2]].map((p, i) => (
                  <div key={i} style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: p.avatarColor, border: "2px solid #000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#fff",
                    marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i,
                  }}>
                    {p.initial}
                  </div>
                ))}
              </div>
              <span style={{ color: "#999", fontSize: 13 }}>{selectedJob.candidates} pessoas se candidataram</span>
            </div>

            {/* About */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Sobre a vaga</div>
              <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6 }}>{selectedJob.desc}</div>
            </div>

            {/* Requirements */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Requisitos</div>
              {selectedJob.reqs.map((req, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0A66C2", marginTop: 6, flexShrink: 0 }} />
                  <span style={{ color: "#ccc", fontSize: 14, lineHeight: 1.5 }}>{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed bottom CTA */}
        <div style={{
          padding: "12px 16px", background: "#1a1a1a", borderTop: "1px solid #333", flexShrink: 0,
        }}>
          <button
            onClick={() => applyJob(selectedJob.id)}
            disabled={applied}
            style={{
              width: "100%", padding: "14px", borderRadius: 24,
              background: applied ? "#2E7D32" : "#0A66C2",
              border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: applied ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: applied ? 0.9 : 1,
            }}
          >
            {applied && <CheckSvg size={18} />}
            {applied ? "Candidatura enviada" : "Candidatar-se"}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // OTHER'S PROFILE VIEW
  // ============================================================
  if (view === "otherProfile") {
    const prof = selectedProfile;
    const connState = connectionStates[prof.id] || "none";
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 14px",
          background: "#1a1a1a", borderBottom: "1px solid #333", flexShrink: 0,
        }}>
          <button onClick={() => setView("network")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <BackArrow />
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12 }}>{prof.name}</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Cover */}
          <div style={{
            height: 90, background: `linear-gradient(135deg, ${prof.avatarColor}, ${prof.avatarColor}66, #1a1a1a)`,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", bottom: -36, left: 16,
              width: 72, height: 72, borderRadius: "50%",
              background: prof.avatarColor, border: "4px solid #000",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: "#fff",
            }}>
              {prof.initial}
            </div>
          </div>

          <div style={{ padding: "44px 16px 16px" }}>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{prof.name}</div>
            <div style={{ color: "#ccc", fontSize: 14, marginTop: 2 }}>{prof.headline}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <BuildingSvg size={14} color="#999" />
              <span style={{ color: "#999", fontSize: 13 }}>{prof.company}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <PinSvg size={14} color="#999" />
              <span style={{ color: "#999", fontSize: 13 }}>Los Santos, SA</span>
            </div>
            <div style={{ color: "#0A66C2", fontSize: 13, fontWeight: 600, marginTop: 8 }}>
              {prof.mutuals} conexoes em comum
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => connState === "none" && sendConnect(prof.id)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 24,
                  background: connState === "none" ? "#0A66C2" : connState === "pending" ? "transparent" : "#333",
                  border: connState === "pending" ? "1px solid #0A66C2" : "none",
                  color: connState === "pending" ? "#0A66C2" : "#fff",
                  fontSize: 14, fontWeight: 700,
                  cursor: connState === "none" ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {connState === "connected" && <><CheckSvg size={14} /> Conectado</>}
                {connState === "pending" && "Pendente"}
                {connState === "none" && "Conectar"}
              </button>
              <button style={{
                flex: 1, padding: "10px", borderRadius: 24,
                background: "transparent", border: "1px solid #666",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                Mensagem
              </button>
            </div>

            {/* About */}
            <div style={{
              marginTop: 20, padding: "16px", background: "#1a1a1a", borderRadius: 12,
            }}>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Sobre</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>
                Profissional dedicado(a) atuando em {prof.company}. Sempre em busca de novos desafios e oportunidades para crescer na area.
              </div>
            </div>

            {/* Experience */}
            <div style={{
              marginTop: 12, padding: "16px", background: "#1a1a1a", borderRadius: 12,
            }}>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Experiencia</div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: prof.avatarColor, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: "#fff",
                }}>
                  {prof.company.charAt(0)}
                </div>
                <div>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{prof.headline.split("|")[0].trim()}</div>
                  <div style={{ color: "#999", fontSize: 13 }}>{prof.company}</div>
                  <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>2023 - Presente</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PROFILE VIEW
  // ============================================================
  if (view === "profile") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar showSearch={false} />
        <TabBar />

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Cover */}
          <div style={{
            height: 90,
            background: "linear-gradient(135deg, #0A66C2, #004182, #001B3D)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", bottom: -40, left: 16,
              width: 80, height: 80, borderRadius: "50%",
              background: CURRENT_USER.avatarColor, border: "4px solid #000",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 800, color: "#fff",
            }}>
              {CURRENT_USER.initial}
            </div>
          </div>

          <div style={{ padding: "48px 16px 16px" }}>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{CURRENT_USER.name}</div>
            <div style={{ color: "#ccc", fontSize: 14, marginTop: 2 }}>{CURRENT_USER.headline}</div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <BuildingSvg size={14} color="#999" />
              <span style={{ color: "#999", fontSize: 13 }}>{CURRENT_USER.company} - {CURRENT_USER.position}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <PinSvg size={14} color="#999" />
              <span style={{ color: "#999", fontSize: 13 }}>{CURRENT_USER.location}</span>
            </div>
            <div style={{ color: "#0A66C2", fontSize: 13, fontWeight: 600, marginTop: 8 }}>
              {CURRENT_USER.connections} conexoes
            </div>

            {/* Edit button */}
            <button style={{
              width: "100%", marginTop: 16, padding: "10px", borderRadius: 24,
              background: "transparent", border: "1px solid #0A66C2",
              color: "#0A66C2", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              Editar perfil
            </button>

            {/* Bio card */}
            <div style={{
              marginTop: 20, padding: "16px", background: "#1a1a1a", borderRadius: 12,
            }}>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Sobre</div>
              <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>{CURRENT_USER.bio}</div>
            </div>

            {/* Experience */}
            <div style={{
              marginTop: 12, padding: "16px", background: "#1a1a1a", borderRadius: 12,
            }}>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Experiencia</div>
              {CURRENT_USER.experience.map((exp, i) => (
                <div key={exp.id} style={{
                  display: "flex", gap: 12,
                  paddingBottom: i < CURRENT_USER.experience.length - 1 ? 16 : 0,
                  marginBottom: i < CURRENT_USER.experience.length - 1 ? 16 : 0,
                  borderBottom: i < CURRENT_USER.experience.length - 1 ? "1px solid #333" : "none",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: i === 0 ? "#0A66C2" : "#666",
                      flexShrink: 0,
                    }} />
                    {i < CURRENT_USER.experience.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: "#333", marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{exp.title}</div>
                    <div style={{ color: "#999", fontSize: 13 }}>{exp.company}</div>
                    <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{exp.period}</div>
                    <div style={{ color: "#ccc", fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>{exp.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={{
              marginTop: 12, padding: "16px", background: "#1a1a1a", borderRadius: 12, marginBottom: 20,
            }}>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Competencias</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CURRENT_USER.skills.map((skill) => (
                  <span key={skill} style={{
                    padding: "6px 14px", borderRadius: 20,
                    background: "rgba(10,102,194,0.15)",
                    color: "#0A66C2", fontSize: 13, fontWeight: 600,
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <BottomNav active="profile" onNav={setView} />
      </div>
    );
  }

  // ============================================================
  // NETWORK VIEW
  // ============================================================
  if (view === "network") {
    const suggestions = PROFESSIONALS.filter((p) => connectionStates[p.id] !== "connected");
    const connected = PROFESSIONALS.filter((p) => connectionStates[p.id] === "connected");

    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar />
        <TabBar />

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Invites */}
          {activeInvites.length > 0 && (
            <div style={{ padding: "16px", borderBottom: "8px solid #1a1a1a" }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                Convites ({activeInvites.length})
              </div>
              {activeInvites.map((inv) => (
                <div key={inv.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid #222",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: inv.avatarColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0,
                  }}>
                    {inv.initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.name}</div>
                    <div style={{ color: "#999", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.headline}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => dismissInvite(inv.id)}
                      style={{
                        padding: "6px 12px", borderRadius: 20,
                        background: "#333", border: "none",
                        color: "#ccc", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Ignorar
                    </button>
                    <button
                      onClick={() => acceptInvite(inv.id)}
                      style={{
                        padding: "6px 12px", borderRadius: 20,
                        background: "#0A66C2", border: "none",
                        color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Aceitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          <div style={{ padding: "16px", borderBottom: "8px solid #1a1a1a" }}>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Pessoas que talvez voce conheca
            </div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
              {suggestions.map((prof) => {
                const state = connectionStates[prof.id];
                return (
                  <div key={prof.id} style={{
                    minWidth: 150, background: "#1a1a1a", borderRadius: 12,
                    padding: "16px 12px", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 8, flexShrink: 0,
                  }}>
                    <button
                      onClick={() => openProfile(prof)}
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 0 }}
                    >
                      <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: prof.avatarColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, fontWeight: 800, color: "#fff",
                      }}>
                        {prof.initial}
                      </div>
                      <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{prof.name}</div>
                      <div style={{ color: "#999", fontSize: 11, textAlign: "center", lineHeight: 1.3, minHeight: 28 }}>{prof.headline.split("|")[0].trim()}</div>
                    </button>
                    <div style={{ color: "#666", fontSize: 11 }}>{prof.mutuals} em comum</div>
                    <button
                      onClick={() => state === "none" && sendConnect(prof.id)}
                      style={{
                        width: "100%", padding: "6px", borderRadius: 20,
                        background: state === "none" ? "transparent" : state === "pending" ? "transparent" : "#333",
                        border: state === "none" ? "1px solid #0A66C2" : state === "pending" ? "1px solid #666" : "none",
                        color: state === "none" ? "#0A66C2" : state === "pending" ? "#666" : "#fff",
                        fontSize: 12, fontWeight: 700, cursor: state === "none" ? "pointer" : "default",
                      }}
                    >
                      {state === "none" ? "Conectar" : state === "pending" ? "Pendente" : "Conectado"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected */}
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>
                Minhas conexoes ({connected.length})
              </div>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            {connected.map((prof) => (
              <button
                key={prof.id}
                onClick={() => openProfile(prof)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 0", borderBottom: "1px solid #222",
                  background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                  borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#222",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: prof.avatarColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>
                  {prof.initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{prof.name}</div>
                  <div style={{ color: "#999", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prof.headline}</div>
                </div>
                <button style={{
                  padding: "6px 12px", borderRadius: 20,
                  background: "transparent", border: "1px solid #666",
                  color: "#ccc", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                }}>
                  Mensagem
                </button>
              </button>
            ))}
          </div>
        </div>

        <BottomNav active="network" onNav={setView} />
      </div>
    );
  }

  // ============================================================
  // JOBS VIEW
  // ============================================================
  if (view === "jobs") {
    const filteredJobs = jobSearch
      ? JOBS.filter((j) => j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.company.toLowerCase().includes(jobSearch.toLowerCase()))
      : JOBS;

    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar />
        <TabBar />

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "12px 16px",
            borderBottom: "1px solid #222",
          }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              background: "#1a1a1a", borderRadius: 8, padding: "10px 12px",
            }}>
              <SearchSvg size={16} color="#999" />
              <input
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Buscar vagas ou empresas"
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14 }}
              />
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <FilterSvg />
            </button>
          </div>

          {/* Section header */}
          <div style={{ padding: "16px 16px 8px" }}>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Vagas recomendadas</div>
            <div style={{ color: "#999", fontSize: 13, marginTop: 2 }}>Baseado no seu perfil e pesquisas</div>
          </div>

          {/* Job cards */}
          {filteredJobs.map((job) => {
            const applied = appliedJobs.includes(job.id);
            return (
              <button
                key={job.id}
                onClick={() => openJob(job)}
                style={{
                  display: "flex", gap: 12, padding: "14px 16px",
                  borderBottom: "1px solid #222",
                  borderLeft: job.isNew ? "3px solid #0A66C2" : "3px solid transparent",
                  background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                  borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#222",
                  borderLeftWidth: 3, borderLeftStyle: "solid", borderLeftColor: job.isNew ? "#0A66C2" : "transparent",
                }}
              >
                {/* Company icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 8,
                  background: job.companyColor, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 800, color: "#fff",
                }}>
                  {job.company.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{job.title}</span>
                    {job.isNew && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                        background: "rgba(10,102,194,0.2)", color: "#0A66C2",
                      }}>NOVA</span>
                    )}
                  </div>
                  <div style={{ color: "#999", fontSize: 13, marginTop: 2 }}>{job.company}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <PinSvg size={12} color="#666" />
                      <span style={{ color: "#999", fontSize: 12 }}>{job.location}</span>
                    </div>
                    <span style={{ color: "#4CAF50", fontSize: 12, fontWeight: 600 }}>{job.salary}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: job.type === "CLT" ? "rgba(10,102,194,0.15)" : job.type === "Freelance" ? "rgba(255,152,0,0.15)" : "rgba(156,39,176,0.15)",
                      color: job.type === "CLT" ? "#0A66C2" : job.type === "Freelance" ? "#FF9800" : "#9C27B0",
                    }}>{job.type}</span>
                    <span style={{ color: "#666", fontSize: 11 }}>{job.candidates} candidatos</span>
                    <span style={{ color: "#666", fontSize: 11 }}>{job.time}</span>
                  </div>
                  {/* Apply btn */}
                  <button
                    onClick={(e) => { e.stopPropagation(); applied ? null : applyJob(job.id); }}
                    style={{
                      marginTop: 8, padding: "6px 20px", borderRadius: 20,
                      background: applied ? "#2E7D32" : "#0A66C2",
                      border: "none", color: "#fff", fontSize: 12, fontWeight: 700,
                      cursor: applied ? "default" : "pointer",
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}
                  >
                    {applied && <CheckSvg size={12} />}
                    {applied ? "Enviada" : "Candidatar-se"}
                  </button>
                </div>
              </button>
            );
          })}
        </div>

        <BottomNav active="jobs" onNav={setView} />
      </div>
    );
  }

  // ============================================================
  // FEED VIEW (default)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar />
      <TabBar />

      <div ref={feedRef} style={{ flex: 1, overflowY: "auto" }}>
        {/* Connection stories */}
        <div style={{
          display: "flex", gap: 12, padding: "12px 14px", overflowX: "auto",
          borderBottom: "8px solid #1a1a1a",
        }}>
          {PROFESSIONALS.slice(0, 7).map((prof) => (
            <button
              key={prof.id}
              onClick={() => openProfile(prof)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: "none", border: "none", cursor: "pointer", flexShrink: 0, width: 62,
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                padding: 2.5,
                background: "linear-gradient(135deg, #0A66C2, #0288D1)",
              }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: "#000", padding: 2,
                }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: "50%",
                    background: prof.avatarColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, color: "#fff",
                  }}>
                    {prof.initial}
                  </div>
                </div>
              </div>
              <span style={{
                color: "#ccc", fontSize: 10, maxWidth: 60,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {prof.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Feed posts */}
        {posts.map((post) => {
          const author = getAuthor(post.authorId);
          return (
            <div key={post.id} style={{
              background: "#1a1a1a", marginBottom: 8,
              borderRadius: 0,
            }}>
              {/* Post header */}
              <div style={{
                display: "flex", alignItems: "flex-start", padding: "12px 14px", gap: 10,
              }}>
                <button
                  onClick={() => openProfile(author)}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: author.avatarColor, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17, fontWeight: 800, color: "#fff",
                    border: "none", cursor: "pointer", padding: 0,
                  }}
                >
                  {author.initial}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{author.name}</div>
                  <div style={{ color: "#999", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{author.headline}</div>
                  <div style={{ color: "#666", fontSize: 11, marginTop: 1 }}>{post.time}</div>
                </div>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="#999"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
              </div>

              {/* Content */}
              <div style={{ padding: "0 14px 12px" }}>
                <div style={{
                  color: "#e0e0e0", fontSize: 14, lineHeight: 1.5,
                  display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {post.text}
                </div>
                <span style={{ color: "#0A66C2", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>...ver mais</span>
              </div>

              {/* Engagement stats */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 14px 8px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#0A66C2", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ThumbUpSvg filled size={10} />
                  </div>
                  <span style={{ color: "#999", fontSize: 12 }}>{post.likes}</span>
                </div>
                <span style={{ color: "#999", fontSize: 12 }}>{post.comments} comentarios</span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#333", margin: "0 14px" }} />

              {/* Action bar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-around",
                padding: "6px 8px",
              }}>
                <button
                  onClick={() => toggleLike(post.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "8px 12px",
                    background: "none", border: "none", cursor: "pointer",
                  }}
                >
                  <ThumbUpSvg filled={post.liked} size={18} />
                  <span style={{ color: post.liked ? "#0A66C2" : "#999", fontSize: 12, fontWeight: 600 }}>Gostei</span>
                </button>
                <button style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "8px 12px",
                  background: "none", border: "none", cursor: "pointer",
                }}>
                  <CommentSvg size={18} />
                  <span style={{ color: "#999", fontSize: 12, fontWeight: 600 }}>Comentar</span>
                </button>
                <button style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "8px 12px",
                  background: "none", border: "none", cursor: "pointer",
                }}>
                  <ShareSvg size={18} />
                  <span style={{ color: "#999", fontSize: 12, fontWeight: 600 }}>Repostar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating create button */}
      <button style={{
        position: "absolute", bottom: 64, right: 16,
        width: 52, height: 52, borderRadius: "50%",
        background: "#0A66C2", border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", boxShadow: "0 4px 16px rgba(10,102,194,0.5)",
        zIndex: 10,
      }}>
        <PlusSvg size={24} color="#fff" />
      </button>

      <BottomNav active="feed" onNav={setView} />
    </div>
  );
}

// ---------- Bottom Navigation ----------
function BottomNav({ active, onNav }) {
  const tabs = [
    { id: "feed", label: "Inicio", icon: (a) => <HomeSvg active={a} /> },
    { id: "jobs", label: "Vagas", icon: (a) => <BriefcaseSvg active={a} /> },
    { id: "network", label: "Rede", icon: (a) => <NetworkSvg active={a} /> },
    { id: "profile", label: "Perfil", icon: (a) => <UserSvg active={a} /> },
  ];

  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 0 6px", background: "#1a1a1a",
      borderTop: "1px solid #333", flexShrink: 0,
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onNav(tab.id)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer",
          }}
        >
          {tab.icon(active === tab.id)}
          <span style={{
            color: active === tab.id ? "#fff" : "#999",
            fontSize: 10, fontWeight: active === tab.id ? 700 : 400,
          }}>{tab.label}</span>
          {active === tab.id && (
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#0A66C2", marginTop: -1 }} />
          )}
        </button>
      ))}
    </div>
  );
}

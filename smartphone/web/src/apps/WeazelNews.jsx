import React, { useState, useEffect, useCallback } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Weazel News App — Artigos, breaking news, publicar noticia
// Telas: feed | article | publish
// Handlers: weazel_init, weazel_publish
// ============================================================

const BREAKING = {
  title: "URGENTE: Tiroteio na Vinewood Blvd deixa 3 feridos",
  time: "Agora",
};

const ARTICLES = [
  {
    id: 1,
    title: "Prefeitura anuncia novo sistema de transporte publico",
    summary: "O prefeito de Los Santos apresentou hoje o projeto do novo BRT que vai ligar o centro a Paleto Bay.",
    author: "Jessica Torres",
    category: "Politica",
    time: "2h atras",
    gradient: "linear-gradient(135deg, #667eea, #764ba2)",
    content: "O prefeito de Los Santos apresentou hoje o projeto ambicioso do novo BRT que vai conectar o centro da cidade ate Paleto Bay, passando por Sandy Shores. O investimento previsto e de R$ 450 milhoes e as obras devem comecar no proximo semestre. A populacao tera acesso a consultas publicas a partir da proxima semana.",
    comments: 42,
  },
  {
    id: 2,
    title: "Policia Federal apreende carregamento recorde no porto",
    summary: "Operacao Maremoto resultou na maior apreensao de contrabando da historia de Los Santos.",
    author: "Roberto Mendes",
    category: "Seguranca",
    time: "4h atras",
    gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    content: "A Policia Federal realizou na madrugada de hoje a maior apreensao de contrabando da historia do porto de Los Santos. A Operacao Maremoto, que durou 6 meses de investigacao, resultou na captura de 3 toneladas de mercadorias ilegais e na prisao de 12 suspeitos. O delegado responsavel afirmou que a operacao desarticulou uma quadrilha que atuava ha mais de 5 anos.",
    comments: 89,
  },
  {
    id: 3,
    title: "Evento de carros classicos reune 500 veiculos em LS",
    summary: "A exposicao no Pier de Santa Maria atraiu entusiastas de todo o estado.",
    author: "Ana Beatriz",
    category: "Cultura",
    time: "6h atras",
    gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    content: "O tradicional evento de carros classicos de Los Santos bateu recorde de publico neste fim de semana. Mais de 500 veiculos foram expostos no Pier de Santa Maria, atraindo mais de 10 mil visitantes. Destaques para um Imponte Dukes 1969 restaurado e um Vapid Ellie original.",
    comments: 34,
  },
  {
    id: 4,
    title: "Hospital Central inaugura ala de emergencia moderna",
    summary: "Investimento de R$ 80 milhoes trouxe equipamentos de ultima geracao.",
    author: "Carlos Henrique",
    category: "Saude",
    time: "8h atras",
    gradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    content: "O Hospital Central Pillbox Hill inaugurou nesta segunda-feira a nova ala de emergencia, equipada com tecnologia de ponta. O investimento de R$ 80 milhoes permitiu a aquisicao de 15 novos leitos de UTI, equipamentos de diagnostico por imagem e um centro cirurgico robotizado.",
    comments: 21,
  },
  {
    id: 5,
    title: "Los Santos FC vence classico e assume lideranca",
    summary: "Gol nos acrescimos garantiu vitoria por 2x1 sobre o rival.",
    author: "Diego Fernandes",
    category: "Esportes",
    time: "10h atras",
    gradient: "linear-gradient(135deg, #fa709a, #fee140)",
    content: "Em partida emocionante no Maze Bank Arena, o Los Santos FC venceu o classico contra o Blaine County United por 2 a 1, com gol nos acrescimos de Rafael Santos. Com a vitoria, o time assume a lideranca do campeonato estadual com 3 pontos de vantagem.",
    comments: 156,
  },
];

export default function WeazelNewsApp({ onNavigate }) {
  const [view, setView] = useState("feed");
  const [selectedArticle, setSelectedArticle] = useState(ARTICLES[0]);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishContent, setPublishContent] = useState("");
  const [publishCategory, setPublishCategory] = useState("Geral");
  const [filter, setFilter] = useState("Todos");
  const [articles, setArticles] = useState(ARTICLES);

  const categories = ["Todos", "Politica", "Seguranca", "Cultura", "Saude", "Esportes"];
  const filteredArticles = filter === "Todos" ? articles : articles.filter((a) => a.category === filter);

  // ── weazel_init ──
  useEffect(() => {
    (async () => {
      const res = await fetchBackend("weazel_init");
      if (res?.articles?.length) {
        setArticles(res.articles.map((a, i) => ({
          id: a.id || i + 1, title: a.title || "?", summary: a.summary || "",
          author: a.author || "Redacao", category: a.category || "Geral",
          time: a.time || "", content: a.content || a.summary || "",
          comments: a.comments || 0,
          gradient: ARTICLES[i % ARTICLES.length]?.gradient || "linear-gradient(135deg, #667eea, #764ba2)",
        })));
      }
    })();
  }, []);

  // ── weazel_publish ──
  const handlePublish = useCallback(async () => {
    if (!publishTitle.trim() || !publishContent.trim()) return;
    await fetchBackend("weazel_publish", {
      title: publishTitle.trim(),
      content: publishContent.trim(),
      category: publishCategory,
    });
    setPublishTitle("");
    setPublishContent("");
    setView("feed");
  }, [publishTitle, publishContent, publishCategory]);

  // ============================================================
  // PUBLISH VIEW
  // ============================================================
  if (view === "publish") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0f0f0f", display: "flex", flexDirection: "column" }}>
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 16px",
          borderBottom: "1px solid #222",
        }}>
          <button onClick={() => setView("feed")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginLeft: 12, flex: 1 }}>Publicar Noticia</span>
          <button onClick={handlePublish} style={{
            background: "#D32F2F", border: "none", borderRadius: 6,
            padding: "6px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            Publicar
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#888", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Titulo</div>
            <input
              value={publishTitle}
              onChange={(e) => setPublishTitle(e.target.value)}
              placeholder="Titulo da noticia..."
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                background: "#1a1a1a", border: "1px solid #333",
                color: "#fff", fontSize: 15, fontWeight: 600, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#888", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Categoria</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Geral", "Politica", "Seguranca", "Cultura", "Esportes"].map((cat) => (
                <button key={cat} onClick={() => setPublishCategory(cat)} style={{
                  padding: "6px 12px", borderRadius: 16,
                  background: publishCategory === cat ? "#D32F2F" : "#1a1a1a",
                  border: `1px solid ${publishCategory === cat ? "#D32F2F" : "#333"}`,
                  color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#888", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Conteudo</div>
            <textarea
              value={publishContent}
              onChange={(e) => setPublishContent(e.target.value)}
              placeholder="Escreva sua noticia aqui..."
              rows={10}
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                background: "#1a1a1a", border: "1px solid #333",
                color: "#fff", fontSize: 14, lineHeight: 1.6, outline: "none",
                resize: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{
            padding: 12, borderRadius: 8, background: "#1a1a1a",
            border: "1px dashed #333", textAlign: "center",
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" style={{ margin: "0 auto 4px", display: "block" }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#666"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <div style={{ color: "#666", fontSize: 12 }}>Adicionar foto (opcional)</div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ARTICLE VIEW
  // ============================================================
  if (view === "article") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#0f0f0f", display: "flex", flexDirection: "column" }}>
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 16px",
          borderBottom: "1px solid #222",
        }}>
          <button onClick={() => setView("feed")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ color: "#D32F2F", fontSize: 14, fontWeight: 800, marginLeft: 12 }}>WEAZEL NEWS</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Hero image */}
          <div style={{
            height: 180, background: selectedArticle.gradient,
            display: "flex", alignItems: "flex-end", padding: 16,
          }}>
            <span style={{
              padding: "4px 10px", borderRadius: 4,
              background: "#D32F2F", color: "#fff",
              fontSize: 11, fontWeight: 700,
            }}>
              {selectedArticle.category}
            </span>
          </div>

          <div style={{ padding: 16 }}>
            <h1 style={{
              color: "#fff", fontSize: 22, fontWeight: 800,
              lineHeight: 1.3, marginBottom: 12, margin: 0,
            }}>
              {selectedArticle.title}
            </h1>

            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "#D32F2F",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#fff",
              }}>
                {selectedArticle.author.charAt(0)}
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{selectedArticle.author}</div>
                <div style={{ color: "#888", fontSize: 11 }}>{selectedArticle.time}</div>
              </div>
            </div>

            <p style={{
              color: "#ccc", fontSize: 15, lineHeight: 1.7, margin: 0, marginBottom: 20,
            }}>
              {selectedArticle.content}
            </p>

            {/* Actions */}
            <div style={{
              display: "flex", gap: 16, padding: "16px 0",
              borderTop: "1px solid #222",
            }}>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "none", cursor: "pointer",
              }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                </svg>
                <span style={{ color: "#888", fontSize: 13 }}>{selectedArticle.comments}</span>
              </button>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "none", cursor: "pointer",
              }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                <span style={{ color: "#888", fontSize: 13 }}>Compartilhar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // FEED VIEW (default)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#0f0f0f", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderBottom: "1px solid #222", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: "#D32F2F",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>WEAZEL</span>
          <span style={{ color: "#D32F2F", fontSize: 16, fontWeight: 800 }}>NEWS</span>
        </div>
        <button onClick={() => setView("publish")} style={{
          background: "#D32F2F", border: "none", borderRadius: 6,
          padding: "6px 12px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Publicar</span>
        </button>
      </div>

      {/* Breaking news */}
      <div style={{
        margin: "8px 16px", padding: "10px 12px", borderRadius: 8,
        background: "linear-gradient(90deg, #D32F2F, #B71C1C)",
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <span style={{
          padding: "2px 6px", borderRadius: 3, background: "#fff",
          color: "#D32F2F", fontSize: 10, fontWeight: 800,
          flexShrink: 0,
        }}>
          AO VIVO
        </span>
        <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
          {BREAKING.title}
        </span>
      </div>

      {/* Categories */}
      <div style={{
        display: "flex", gap: 6, padding: "8px 16px",
        overflowX: "auto", flexShrink: 0,
      }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: "6px 14px", borderRadius: 16, flexShrink: 0,
            background: filter === cat ? "#D32F2F" : "#1a1a1a",
            border: filter === cat ? "none" : "1px solid #333",
            color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px" }}>
        {/* Featured first article */}
        {filter === "Todos" && (
          <button
            onClick={() => { setSelectedArticle(articles[0]); setView("article"); }}
            style={{
              width: "100%", borderRadius: 12, overflow: "hidden",
              marginBottom: 12, border: "none", cursor: "pointer",
              display: "block", textAlign: "left",
            }}
          >
            <div style={{
              height: 140, background: articles[0].gradient,
              display: "flex", alignItems: "flex-end", padding: 12,
            }}>
              <div>
                <span style={{
                  padding: "2px 8px", borderRadius: 3, background: "#D32F2F",
                  color: "#fff", fontSize: 10, fontWeight: 700,
                }}>
                  {articles[0].category}
                </span>
                <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginTop: 8, lineHeight: 1.3 }}>
                  {articles[0].title}
                </div>
              </div>
            </div>
          </button>
        )}

        {/* List articles */}
        {(filter === "Todos" ? filteredArticles.slice(1) : filteredArticles).map((article) => (
          <button
            key={article.id}
            onClick={() => { setSelectedArticle(article); setView("article"); }}
            style={{
              width: "100%", display: "flex", gap: 12,
              padding: "12px 0", borderBottom: "1px solid #1a1a1a",
              background: "none", border: "none", borderBlockEnd: "1px solid #1a1a1a",
              cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ flex: 1 }}>
              <span style={{
                color: "#D32F2F", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase",
              }}>
                {article.category}
              </span>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginTop: 4, marginBottom: 4 }}>
                {article.title}
              </div>
              <div style={{ color: "#888", fontSize: 11 }}>
                {article.author} - {article.time}
              </div>
            </div>
            <div style={{
              width: 72, height: 72, borderRadius: 8,
              background: article.gradient, flexShrink: 0,
            }} />
          </button>
        ))}
      </div>
    </div>
  );
}

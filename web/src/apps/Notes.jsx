import { useState, useCallback, useEffect } from "react";
import { fetchBackend } from "../hooks/useNui";

// ============================================================
// Notes App — Visual V0 pixel-perfect + Backend FiveM
// Views: list | editor
// Handlers: notes_list, notes_save, notes_delete
// ============================================================

const COLORS = ["#FFD600", "#FF9500", "#FFD600", "#FF9500"];
const getColor = (id) => COLORS[(id || 0) % COLORS.length];

const formatDate = (dateStr) => {
  if (!dateStr) return "Agora";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) {
    return `Hoje, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
  if (diff < 172800000) return "Ontem";
  return d.toLocaleDateString("pt-BR");
};

const B = { background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, alignItems: "center", justifyContent: "center" };

export function NotesApp() {
  const [view, setView] = useState("list");
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ===== Backend: carregar notas =====
  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetchBackend("notes_list");
      if (r?.notes) setNotes(r.notes);
      setLoading(false);
    })();
  }, []);

  const openNote = useCallback((note) => {
    setSelectedNote(note);
    setEditTitle(note.title || "");
    setEditBody(note.content || "");
    setView("editor");
  }, []);

  const createNote = useCallback(() => {
    setSelectedNote(null);
    setEditTitle("");
    setEditBody("");
    setView("editor");
  }, []);

  // ===== Backend: salvar nota =====
  const saveNote = useCallback(async () => {
    if (!editTitle.trim() && !editBody.trim()) {
      setView("list");
      return;
    }
    const params = {
      title: editTitle || "Sem titulo",
      content: editBody,
    };
    if (selectedNote?.id) params.id = selectedNote.id;

    const r = await fetchBackend("notes_save", params);
    if (r?.ok) {
      if (selectedNote?.id) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === selectedNote.id
              ? { ...n, title: params.title, content: editBody, updated_at: new Date().toISOString() }
              : n
          )
        );
      } else {
        setNotes((prev) => [
          { id: r.id, title: params.title, content: editBody, updated_at: new Date().toISOString() },
          ...prev,
        ]);
      }
    }
    setView("list");
  }, [editTitle, editBody, selectedNote]);

  // ===== Backend: deletar nota =====
  const deleteNote = useCallback(async (id) => {
    await fetchBackend("notes_delete", { id });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setView("list");
  }, []);

  const filteredNotes = searchQuery
    ? notes.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.content || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  // ============================================================
  // EDITOR VIEW (100% V0 visual)
  // ============================================================
  if (view === "editor") {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderBottom: "1px solid #222", flexShrink: 0,
        }}>
          <button onClick={saveNote} style={{
            ...B, gap: 4,
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            <span style={{ color: "#FFD600", fontSize: 14, fontWeight: 600 }}>Notas</span>
          </button>
          <div style={{ display: "flex", gap: 16 }}>
            {selectedNote?.id && (
              <button onClick={() => deleteNote(selectedNote.id)} style={B}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            )}
            <button onClick={saveNote} style={{
              background: "#FFD600", border: "none", borderRadius: 6,
              padding: "4px 12px", cursor: "pointer",
              color: "#000", fontSize: 13, fontWeight: 700,
            }}>
              OK
            </button>
          </div>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Titulo"
            style={{
              background: "none", border: "none", outline: "none",
              color: "#fff", fontSize: 24, fontWeight: 700,
            }}
          />
          <div style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>
            {selectedNote ? formatDate(selectedNote.updated_at) : "Agora"}
          </div>
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            placeholder="Escreva aqui..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#ccc", fontSize: 15, lineHeight: 1.6,
              resize: "none", fontFamily: "inherit",
            }}
          />
        </div>

        {/* Bottom toolbar (V0) */}
        <div style={{
          display: "flex", justifyContent: "space-around", alignItems: "center",
          padding: "10px 16px", borderTop: "1px solid #222", flexShrink: 0,
        }}>
          {[
            <svg key="1" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
            <svg key="2" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
            <svg key="3" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
            <svg key="4" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
          ].map((icon, i) => (
            <button key={i} style={B}>{icon}</button>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // LIST VIEW (default — 100% V0 visual)
  // ============================================================
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
        }}>
          <div style={{ width: 22 }} />
          <span style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>Notas</span>
          <button style={B}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#1a1a1a", borderRadius: 10, padding: "8px 12px",
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14 }}
          />
        </div>
      </div>

      {/* Notes list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <div style={{ width: 24, height: 24, border: "2px solid #222", borderTopColor: "#FFD600", borderRadius: "50%", animation: "notesSpin 0.8s linear infinite" }} />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Nenhuma nota</div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Toque no + para criar</div>
          </div>
        ) : (
          <>
            <div style={{ color: "#888", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
              Notas
            </div>
            {filteredNotes.map((note) => (
              <button key={note.id} onClick={() => openNote(note)} style={{
                width: "100%", textAlign: "left", background: "#1a1a1a",
                border: "none", borderRadius: 12, padding: "12px 14px",
                marginBottom: 8, cursor: "pointer",
                borderLeft: `3px solid ${getColor(note.id)}`,
              }}>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{note.title || "Sem titulo"}</div>
                <div style={{ color: "#888", fontSize: 12, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {(note.content || "").split("\n")[0] || "Nota vazia"}
                </div>
                <div style={{ color: "#555", fontSize: 11 }}>{formatDate(note.updated_at)}</div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* FAB + counter */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px", borderTop: "1px solid #222", flexShrink: 0,
      }}>
        <span style={{ color: "#666", fontSize: 12 }}>{notes.length} nota{notes.length !== 1 ? "s" : ""}</span>
        <button onClick={createNote} style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "#FFD600", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      <style>{`@keyframes notesSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

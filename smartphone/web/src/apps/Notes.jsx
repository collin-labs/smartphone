import { useState, useCallback, useEffect } from "react";
import { fetchBackend } from "../hooks/useNui";

export function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar notas do banco
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchBackend('notes_list');
      if (res?.notes) setNotes(res.notes);
      setLoading(false);
    })();
  }, []);

  const handleOpen = useCallback((note) => {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
    setCreating(false);
  }, []);

  const handleNew = useCallback(() => {
    setCreating(true);
    setEditing(null);
    setTitle("");
    setContent("");
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      setCreating(false);
      setEditing(null);
      return;
    }

    if (creating) {
      const res = await fetchBackend('notes_save', {
        title: title || "Sem título",
        content,
      });
      if (res?.ok) {
        setNotes(prev => [{
          id: res.id,
          title: title || "Sem título",
          content,
          updated_at: new Date().toISOString(),
        }, ...prev]);
      }
    } else if (editing) {
      await fetchBackend('notes_save', {
        id: editing.id,
        title,
        content,
      });
      setNotes(prev =>
        prev.map(n =>
          n.id === editing.id
            ? { ...n, title, content, updated_at: new Date().toISOString() }
            : n
        )
      );
    }

    setCreating(false);
    setEditing(null);
  }, [creating, editing, title, content]);

  const handleDelete = useCallback(async (id) => {
    await fetchBackend('notes_delete', { id });
    setNotes(prev => prev.filter(n => n.id !== id));
    setEditing(null);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Editor view
  if (editing || creating) {
    return (
      <div className="flex h-full flex-col bg-black">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <button
            onClick={handleSave}
            className="text-[15px] font-medium text-[#0A84FF]"
          >
            {"← Voltar"}
          </button>
          {editing && (
            <button
              onClick={() => handleDelete(editing.id)}
              className="text-[15px] font-medium text-[#FF453A]"
            >
              Apagar
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4 phone-scrollbar overflow-y-auto">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="bg-transparent text-[22px] font-bold text-white placeholder-white/30 outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comece a escrever..."
            className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-white/80 placeholder-white/20 outline-none"
          />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="flex h-full flex-col bg-black">
      <div className="px-4 pt-2 pb-3">
        <div className="rounded-xl bg-[#1c1c1e] px-3 py-2">
          <span className="text-[15px] text-white/30">{"Buscar notas..."}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-[13px] font-medium text-white/40">
          {loading ? 'Carregando...' : `${notes.length} ${notes.length === 1 ? "nota" : "notas"}`}
        </span>
        <button
          onClick={handleNew}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD60A]/20"
        >
          <span className="text-[18px] leading-none text-[#FFD60A]">+</span>
        </button>
      </div>

      <div className="phone-scrollbar flex-1 overflow-y-auto px-4">
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => handleOpen(note)}
              className="flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-[#1c1c1e] p-3 text-left transition-colors active:bg-[#2c2c2e]"
            >
              <span className="text-[15px] font-semibold text-white">
                {note.title}
              </span>
              <span className="line-clamp-2 text-[13px] leading-snug text-white/50">
                {note.content}
              </span>
              <span className="mt-1 text-[11px] text-white/25">{formatDate(note.updated_at)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

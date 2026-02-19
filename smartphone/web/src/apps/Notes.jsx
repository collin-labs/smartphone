import { useState, useCallback } from "react";

const INITIAL_NOTES = [
  {
    id: "1",
    title: "Locais importantes",
    content: "Garagem central - Rua Principal 450\nHospital - Av. Santos, 120\nDelegacia - Centro",
    date: "19/02/2026",
  },
  {
    id: "2",
    title: "Contatos do trampo",
    content: "Jorge (mecânico): 555-0147\nMaria (advogada): 555-0293",
    date: "18/02/2026",
  },
  {
    id: "3",
    title: "Lista de compras",
    content: "Colete\nRádio\nLanterna\nKit médico",
    date: "17/02/2026",
  },
];

export function NotesApp() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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

  const handleSave = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      setCreating(false);
      setEditing(null);
      return;
    }
    if (creating) {
      const newNote = {
        id: Date.now().toString(),
        title: title || "Sem título",
        content,
        date: new Date().toLocaleDateString("pt-BR"),
      };
      setNotes((prev) => [newNote, ...prev]);
    } else if (editing) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editing.id ? { ...n, title, content, date: new Date().toLocaleDateString("pt-BR") } : n
        )
      );
    }
    setCreating(false);
    setEditing(null);
  }, [creating, editing, title, content]);

  const handleDelete = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setEditing(null);
  }, []);

  // Editor view
  if (editing || creating) {
    return (
      <div className="flex h-full flex-col bg-black">
        {/* Editor header */}
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
      {/* Search bar area */}
      <div className="px-4 pt-2 pb-3">
        <div className="rounded-xl bg-[#1c1c1e] px-3 py-2">
          <span className="text-[15px] text-white/30">{"Buscar notas..."}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-[13px] font-medium text-white/40">
          {notes.length} {notes.length === 1 ? "nota" : "notas"}
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
              <span className="mt-1 text-[11px] text-white/25">{note.date}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

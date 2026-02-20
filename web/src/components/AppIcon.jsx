import { useState, useCallback } from "react";

export function AppIcon({ app, onOpen, size = 60 }) {
  const [pressed, setPressed] = useState(false);

  const handlePointerDown = useCallback(() => setPressed(true), []);
  const handlePointerUp = useCallback(() => {
    setPressed(false);
    onOpen(app);
  }, [app, onOpen]);
  const handlePointerLeave = useCallback(() => setPressed(false), []);

  return (
    <button
      className="flex flex-col items-center gap-[6px] outline-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      style={{ userSelect: "none" }}
    >
      <div
        className="overflow-hidden shadow-lg"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.233,
          transform: pressed ? "scale(0.85)" : "scale(1)",
          transition: "transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          boxShadow: `0 4px 16px ${app.color}40`,
        }}
      >
        <img
          src={app.icon}
          alt={app.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <span className="max-w-[72px] truncate text-center text-[11px] font-medium text-white/90">
        {app.name}
      </span>
    </button>
  );
}

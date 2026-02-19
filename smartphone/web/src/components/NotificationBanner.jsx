import { useEffect, useState } from "react";

export function NotificationBanner({ notification, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div
      className="absolute left-3 right-3 z-[100] rounded-2xl border border-white/[0.1] p-3 transition-all duration-300"
      style={{
        top: visible ? 50 : -100,
        opacity: visible ? 1 : 0,
        background: "rgba(40, 40, 40, 0.75)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] overflow-hidden"
          style={{ background: notification.color }}
        >
          {notification.icon.startsWith("./") ? (
            <img src={notification.icon} alt="" className="w-full h-full object-cover" draggable={false} />
          ) : (
            <span className="text-[20px]">{notification.icon}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="text-[13px] font-semibold text-white">
            {notification.title}
          </span>
          <span className="truncate text-[13px] text-white/60">
            {notification.message}
          </span>
        </div>
        <span className="text-[11px] text-white/30">agora</span>
      </div>
    </div>
  );
}

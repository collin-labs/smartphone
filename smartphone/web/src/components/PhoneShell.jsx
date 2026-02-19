import { useState, useCallback, useEffect } from "react";
import { HomeScreen } from "./HomeScreen";
import { NotificationBanner } from "./NotificationBanner";
import { CalculatorApp } from "../apps/Calculator";
import { NotesApp } from "../apps/Notes";
import { SettingsApp } from "../apps/Settings";
import usePhone from "../store/usePhone";

const INITIAL_SETTINGS = {
  darkMode: true,
  notifications: true,
  sound: true,
  volume: 75,
  zoom: 100,
  wallpaper: 0,
};

export default function PhoneShell() {
  const { isOpen, close } = usePhone();
  const [currentApp, setCurrentApp] = useState(null);
  const [transitioning, setTransitioning] = useState(null); // "in" | "out" | null
  const [notification, setNotification] = useState(null);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // Show demo notification when phone opens
  useEffect(() => {
    if (!isOpen) return;
    // Reset state when phone opens
    setCurrentApp(null);
    setTransitioning(null);

    const timer = setTimeout(() => {
      setNotification({
        id: "demo",
        appId: "whatsapp",
        appName: "WhatsApp",
        icon: "./apps/whatsapp.jpg",
        color: "#25D366",
        title: "WhatsApp",
        message: "Jorge: E aí mano, bora fazer aquele corre?",
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleOpenApp = useCallback((app) => {
    setCurrentApp(app);
    setTransitioning("in");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitioning(null);
      });
    });
  }, []);

  const handleBack = useCallback(() => {
    setTransitioning("out");
    setTimeout(() => {
      setCurrentApp(null);
      setTransitioning(null);
    }, 250);
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const renderApp = () => {
    if (!currentApp) return null;
    switch (currentApp.component) {
      case "calculator":
        return <CalculatorApp />;
      case "notes":
        return <NotesApp />;
      case "settings":
        return (
          <SettingsApp
            settings={settings}
            onSettingsChange={setSettings}
          />
        );
      default:
        // Placeholder for unimplemented apps
        return (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-black">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-[22px] overflow-hidden"
              style={{
                boxShadow: `0 8px 32px ${currentApp.color}50`,
              }}
            >
              <img src={currentApp.icon} alt={currentApp.name} className="w-full h-full object-cover" draggable={false} />
            </div>
            <span className="text-[17px] font-semibold text-white">
              {currentApp.name}
            </span>
            <span className="text-[13px] text-white/40">Em breve...</span>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-end pr-8 pointer-events-none"
      style={{ userSelect: "none" }}
    >
      {/* Phone frame */}
      <div
        className="phone-frame pointer-events-auto relative overflow-hidden"
        style={{
          width: 375,
          height: 812,
          borderRadius: 44,
          border: "1.5px solid rgba(120, 120, 128, 0.35)",
          boxShadow: `
            0 0 0 1px rgba(0,0,0,0.3),
            0 20px 60px rgba(0,0,0,0.5),
            0 8px 20px rgba(0,0,0,0.3),
            inset 0 0 0 1px rgba(255,255,255,0.05)
          `,
          animation: "phoneOpen 350ms cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Notification */}
        <NotificationBanner
          notification={notification}
          onDismiss={dismissNotification}
        />

        {/* Home Screen */}
        <div
          className="absolute inset-0"
          style={{
            transform: currentApp ? "scale(0.92)" : "scale(1)",
            opacity: currentApp ? 0 : 1,
            transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1), opacity 300ms ease",
            pointerEvents: currentApp ? "none" : "auto",
          }}
        >
          <HomeScreen
            onOpenApp={handleOpenApp}
            wallpaper={settings.wallpaper}
          />
        </div>

        {/* App View */}
        {currentApp && (
          <div
            className="absolute inset-0 flex flex-col bg-black"
            style={{
              transform:
                transitioning === "in"
                  ? "translateX(100%)"
                  : transitioning === "out"
                    ? "translateX(100%)"
                    : "translateX(0)",
              opacity: transitioning === "out" ? 0.7 : 1,
              transition:
                transitioning === "out"
                  ? "transform 200ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease"
                  : "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            {/* App header */}
            <div
              className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-4 pb-2 pt-[60px]"
              style={{
                background: `linear-gradient(180deg, #000000 0%, ${currentApp.color}20 100%)`,
              }}
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-[15px] font-medium text-[#0A84FF]"
              >
                <svg
                  width="10"
                  height="18"
                  viewBox="0 0 10 18"
                  fill="none"
                  className="mr-[2px]"
                >
                  <path
                    d="M9 1L1 9L9 17"
                    stroke="#0A84FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Voltar
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-white">
                {currentApp.name}
              </span>
              <div className="w-14" />
            </div>

            {/* App content */}
            <div className="flex-1 overflow-hidden">{renderApp()}</div>

            {/* Home indicator bar */}
            <button
              onClick={handleBack}
              className="flex justify-center bg-black/80 py-2"
            >
              <div className="h-[5px] w-[134px] rounded-full bg-white/30 transition-colors hover:bg-white/50" />
            </button>
          </div>
        )}
      </div>

      {/* Close button (outside phone) */}
      <button
        onClick={() => {
          // Close via NUI callback (same as ESC)
          fetch('https://smartphone/phone:close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }).catch(() => {});
          close();
        }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 border border-white/20
                   flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80
                   transition-all text-lg pointer-events-auto"
        title="Fechar celular (ESC)"
      >
        ✕
      </button>
    </div>
  );
}

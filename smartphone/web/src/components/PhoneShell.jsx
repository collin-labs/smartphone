import { useState, useCallback, useEffect } from "react";
import { HomeScreen } from "./HomeScreen";
import { APPS, DOCK_APPS } from "./data";
import { fetchBackend, fetchClient } from "../hooks/useNui";
import { NotificationBanner } from "./NotificationBanner";
import { CalculatorApp } from "../apps/Calculator";
import { NotesApp } from "../apps/Notes";
import { SettingsApp } from "../apps/Settings";
import Contacts from "../apps/Contacts";
import Phone from "../apps/Phone";
import SMS from "../apps/SMS";
import WhatsApp from "../apps/WhatsApp";
import Bank from "../apps/Bank";
import Instagram from "../apps/Instagram";
import Twitter from "../apps/Twitter";
import TikTok from "../apps/TikTok";
import Tinder from "../apps/Tinder";
import Marketplace from "../apps/Marketplace";
import Uber from "../apps/Uber";
import Waze from "../apps/Waze";
import WeazelNews from "../apps/WeazelNews";
import YellowPages from "../apps/YellowPages";
import PayPal from "../apps/PayPal";
import Blaze from "../apps/Blaze";
import IFood from "../apps/IFood";
import Spotify from "../apps/Spotify";
import Tor from "../apps/Tor";
import Minesweeper from "../apps/Minesweeper";
import Grindr from "../apps/Grindr";
import Gallery from "../apps/Gallery";
import AppStore from "../apps/AppStore";
import FleecaBank from "../apps/FleecaBank";
import Discord from "../apps/Discord";
import Camera from "../apps/Camera";
import Truco from "../apps/Truco";
import YouTube from "../apps/YouTube";
import LinkedIn from "../apps/LinkedIn";
import ControlCenter from "./ControlCenter";
// import LockScreen from "./LockScreen"; // DESABILITADO
import { usePusherEvent } from "../hooks/usePusher";
import { setIncomingCall } from "../store/callState";
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
  const [locked, setLocked] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [pin, setPin] = useState(null); // null=no pin, '1234'=has pin

  // Show demo notification in dev mode only
  useEffect(() => {
    if (!isOpen) return;
    setCurrentApp(null);
    setTransitioning(null);
    setShowCC(false);
    // setLocked(true); // Lock screen disabled

    // Only in browser dev mode - in FiveM, real notifications come via pusher
    const isInGame = typeof GetParentResourceName === 'function' || window.invokeNative !== undefined;
    if (isInGame) return;

    const timer = setTimeout(() => {
      setNotification({
        id: "demo",
        appId: "whatsapp",
        appName: "WhatsApp",
        icon: "./apps/whatsapp.webp",
        color: "#25D366",
        title: "WhatsApp",
        message: "Jorge: E aí mano, bora fazer aquele corre?",
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Load settings from server when phone opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const res = await fetchBackend('download');
      if (res?.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
        if (res.settings.pin) setPin(res.settings.pin);
      }
    })();
  }, [isOpen]);

  // Global: Auto-open Phone app on incoming call
  usePusherEvent('CALL_INCOMING', useCallback((data) => {
    setIncomingCall(data); // Store globally so Phone.jsx can read on mount
    const phoneApp = DOCK_APPS.find(a => a.id === 'phone');
    if (phoneApp) {
      setCurrentApp({ ...phoneApp });
      setTransitioning(null);
    }
  }, []));

  // Global: Show SMS notification when not in SMS app
  usePusherEvent('SMS_MESSAGE', useCallback((data) => {
    if (currentApp?.component !== 'sms') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({
        id: `sms-${data.id}`,
        appId: 'sms',
        appName: 'Mensagens',
        icon: './apps/messages.webp',
        color: '#30D158',
        title: data.senderName || data.sender_phone,
        message: data.message,
      });
    }
  }, [currentApp]));

  // Global: Show WhatsApp notification when not in WhatsApp app
  usePusherEvent('WHATSAPP_MESSAGE', useCallback((data) => {
    if (currentApp?.component !== 'whatsapp') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({
        id: `wa-${data.id}`,
        appId: 'whatsapp',
        appName: 'WhatsApp',
        icon: './apps/whatsapp.webp',
        color: '#25D366',
        title: data.senderName || data.sender_phone,
        message: data.message,
      });
    }
  }, [currentApp]));

  // Global: Show Bank notification when receiving money
  usePusherEvent('BANK_RECEIVED', useCallback((data) => {
    if (currentApp?.component !== 'bank') {
      fetchClient('playSound', { sound: 'notification' });
      const amount = Number(data.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      setNotification({
        id: `bank-${data.id}`,
        appId: 'bank',
        appName: 'Nubank',
        icon: './apps/nubank.webp',
        color: '#820AD1',
        title: 'PIX recebido',
        message: `R$ ${amount} de ${data.senderName || data.from_phone}`,
      });
    }
  }, [currentApp]));

  // Global: Tinder match notification
  usePusherEvent('TINDER_MATCH', useCallback((data) => {
    if (currentApp?.component !== 'tinder') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({
        id: `tinder-match-${data.matchId}`,
        appId: 'tinder',
        appName: 'Tinder',
        icon: './apps/tinder.webp',
        color: '#FE3C72',
        title: 'Novo Match! 🔥',
        message: `Você e ${data.profile?.name || 'alguém'} deram match`,
      });
    }
  }, [currentApp]));

  // Global: Tinder message notification
  usePusherEvent('TINDER_MESSAGE', useCallback((data) => {
    if (currentApp?.component !== 'tinder') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({
        id: `tinder-msg-${data.message?.id}`,
        appId: 'tinder',
        appName: 'Tinder',
        icon: './apps/tinder.webp',
        color: '#FE3C72',
        title: data.senderName || 'Match',
        message: data.message?.message || 'Nova mensagem',
      });
    }
  }, [currentApp]));

  // Global: Marketplace sold notification
  usePusherEvent('MARKET_SOLD', useCallback((data) => {
    if (currentApp?.component !== 'marketplace') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({
        id: `market-${data.listingId}`,
        appId: 'marketplace',
        appName: 'Marketplace',
        icon: './apps/marketplace.webp',
        color: '#34C759',
        title: 'Item vendido! 🎉',
        message: `${data.title} por R$ ${Number(data.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      });
    }
  }, [currentApp]));

  usePusherEvent('UBER_RIDE_REQUEST', useCallback((data) => {
    if (currentApp?.component !== 'uber') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({ id: `uber-req-${data.id}`, appId: 'uber', appName: 'Uber', icon: './apps/uber.webp', color: '#276EF1',
        title: 'Nova corrida! 🚗', message: `${data.passenger_name} → ${data.destination}` });
    }
  }, [currentApp]));

  usePusherEvent('UBER_RIDE_ACCEPTED', useCallback((data) => {
    if (currentApp?.component !== 'uber') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({ id: `uber-acc-${data.rideId}`, appId: 'uber', appName: 'Uber', icon: './apps/uber.webp', color: '#06C167',
        title: 'Motorista a caminho! 🚗', message: `${data.driver_name} aceitou sua corrida` });
    }
  }, [currentApp]));

  usePusherEvent('UBER_RIDE_COMPLETED', useCallback((data) => {
    if (currentApp?.component !== 'uber') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({ id: `uber-done-${data.rideId}`, appId: 'uber', appName: 'Uber', icon: './apps/uber.webp', color: '#06C167',
        title: 'Corrida finalizada! ✅', message: `Valor: R$ ${Number(data.price||0).toFixed(2)}` });
    }
  }, [currentApp]));

  usePusherEvent('UBER_RIDE_CANCELLED', useCallback((data) => {
    if (currentApp?.component !== 'uber') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({ id: `uber-cancel-${data.rideId}`, appId: 'uber', appName: 'Uber', icon: './apps/uber.webp', color: '#FF453A',
        title: 'Corrida cancelada', message: 'A corrida foi cancelada' });
    }
  }, [currentApp]));

  usePusherEvent('WEAZEL_BREAKING', useCallback((data) => {
    if (currentApp?.component !== 'weazel') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({ id: `weazel-${Date.now()}`, appId: 'weazel', appName: 'Weazel News', icon: './apps/weazel.webp', color: '#FF0000',
        title: '🔴 URGENTE', message: data.article?.title || 'Nova notícia urgente' });
    }
  }, [currentApp]));

  usePusherEvent('PAYPAL_RECEIVED', useCallback((data) => {
    if (currentApp?.component !== 'paypal') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({ id: `paypal-${Date.now()}`, appId: 'paypal', appName: 'PayPal', icon: './apps/paypal.webp', color: '#0070BA',
        title: 'Você recebeu dinheiro! 💰', message: `R$ ${Number(data.amount||0).toFixed(2)} de ${data.from}` });
    }
  }, [currentApp]));

  usePusherEvent('IFOOD_STATUS', useCallback((data) => {
    if (currentApp?.component !== 'ifood') {
      const msgs = { preparing: '👨‍🍳 Pedido sendo preparado', delivering: '🛵 Saiu para entrega!', delivered: '🎉 Pedido entregue!' };
      if (msgs[data.status]) {
        fetchClient('playSound', { sound: 'notification' });
        setNotification({ id: `ifood-${Date.now()}`, appId: 'ifood', appName: 'iFood', icon: './apps/ifood.webp', color: '#EA1D2C',
          title: 'iFood', message: msgs[data.status] });
      }
    }
  }, [currentApp]));

  usePusherEvent('TOR_MESSAGE', useCallback((data) => {
    if (currentApp?.component !== 'tor') {
      fetchClient('playSound', { sound: 'notification' });
      setNotification({ id: `tor-${Date.now()}`, appId: 'tor', appName: 'Tor', icon: './apps/tor.jpg', color: '#7D4698',
        title: `🧅 ${data.channel}`, message: `${data.message?.alias}: ${data.message?.message?.slice(0,40)}` });
    }
  }, [currentApp]));

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

  const handleNavigate = useCallback((appId, params) => {
    const allApps = [...APPS, ...DOCK_APPS];
    const target = allApps.find(a => a.id === appId);
    if (target) {
      handleOpenApp({ ...target, params });
    }
  }, [handleOpenApp]);

  const isFullscreen = currentApp?.fullscreen;

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
      case "contacts":
        return <Contacts onNavigate={handleNavigate} />;
      case "phone":
        return <Phone onNavigate={handleNavigate} />;
      case "sms":
        return <SMS onNavigate={handleNavigate} params={currentApp?.params} />;
      case "whatsapp":
        return <WhatsApp onNavigate={handleNavigate} params={currentApp?.params} />;
      case "bank":
        return <Bank onNavigate={handleNavigate} />;
      case "instagram":
        return <Instagram onNavigate={handleNavigate} />;
      case "twitter":
        return <Twitter onNavigate={handleNavigate} />;
      case "tiktok":
        return <TikTok onNavigate={handleNavigate} />;
      case "tinder":
        return <Tinder onNavigate={handleNavigate} />;
      case "marketplace":
        return <Marketplace onNavigate={handleNavigate} />;
      case "uber":
        return <Uber onNavigate={handleNavigate} />;
      case "waze":
        return <Waze onNavigate={handleNavigate} />;
      case "weazel":
        return <WeazelNews onNavigate={handleNavigate} />;
      case "yellowpages":
        return <YellowPages onNavigate={handleNavigate} />;
      case "paypal":
        return <PayPal onNavigate={handleNavigate} />;
      case "casino":
        return <Blaze onNavigate={handleNavigate} />;
      case "ifood":
        return <IFood onNavigate={handleNavigate} />;
      case "spotify":
        return <Spotify />;
      case "tor":
        return <Tor onNavigate={handleNavigate} />;
      case "minesweeper":
        return <Minesweeper />;
      case "gallery":
        return <Gallery onNavigate={handleNavigate} />;
      case "appstore":
        return <AppStore onNavigate={handleNavigate} />;
      case "fleeca":
        return <FleecaBank onNavigate={handleNavigate} />;
      case "grindr":
        return <Grindr onNavigate={handleNavigate} />;
      case "discord":
        return <Discord onNavigate={handleNavigate} />;
      case "camera":
        return <Camera onNavigate={handleNavigate} />;
      case "truco":
        return <Truco />;
      case "youtube":
        return <YouTube onNavigate={handleNavigate} />;
      case "linkedin":
        return <LinkedIn onNavigate={handleNavigate} />;
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
      {/* Force hide scrollbars in CEF/FiveM */}
      <style>{`
        .phone-frame *::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }
        .phone-frame * { scrollbar-width:none !important; -ms-overflow-style:none !important; }
      `}</style>
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
        {/* Dynamic Island */}
        <div style={{
          position:'absolute', top:8, left:'50%', transform:'translateX(-50%)',
          width:120, height:34, borderRadius:17, background:'#000',
          zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
        }}>
          {notification ? (
            <div style={{
              display:'flex', alignItems:'center', gap:6, padding:'0 10px',
              animation:'diExpand 300ms ease-out',
            }}>
              {notification.icon && <img src={notification.icon} style={{ width:18, height:18, borderRadius:4 }} />}
              <span style={{ color:'#fff', fontSize:10, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:70 }}>
                {notification.title}
              </span>
            </div>
          ) : (
            <div style={{ width:8, height:8, borderRadius:4, background:'#1C1C1E' }} />
          )}
        </div>

        {/* Lock Screen — DESABILITADO */}

        {/* Control Center */}
        {showCC && (
          <ControlCenter
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowCC(false)}
          />
        )}

        {/* Control Center trigger - top right area */}
          <button onClick={() => setShowCC(!showCC)} style={{
            position:'absolute', top:0, right:0, width:100, height:50,
            zIndex:150, background:'transparent', border:'none', cursor:'pointer',
          }} title="Control Center" />

        {/* Notification */}
        <NotificationBanner
          notification={notification}
          onDismiss={dismissNotification}
          onTap={(appId) => handleNavigate(appId)}
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
            {/* App header - only for non-fullscreen apps */}
            {!isFullscreen && (
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
            )}

            {/* Fullscreen safe area top */}
            {isFullscreen && <div style={{ height: 50 }} />}

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

import { useEffect, useRef } from "react";
import { WALLPAPERS } from "../components/data";
import { fetchBackend } from "../hooks/useNui";

export function SettingsApp({ settings, onSettingsChange }) {
  const saveTimerRef = useRef(null);

  // Debounced save to backend
  const saveSettings = (newSettings) => {
    onSettingsChange(newSettings);

    // Debounce: salva 500ms após última mudança
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetchBackend('settings_save', newSettings);
    }, 500);
  };

  // Cleanup timer on unmount (force save)
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        fetchBackend('settings_save', settings);
      }
    };
  }, [settings]);

  const toggle = (key) => {
    saveSettings({ ...settings, [key]: !settings[key] });
  };

  const setSlider = (key, value) => {
    saveSettings({ ...settings, [key]: value });
  };

  const setWallpaper = (idx) => {
    saveSettings({ ...settings, wallpaper: idx });
    // Também atualizar perfil (wallpaper é campo separado)
    const wp = WALLPAPERS[idx];
    if (wp) fetchBackend('profile_update', { wallpaper: wp.id });
  };

  return (
    <div className="phone-scrollbar flex h-full flex-col gap-5 overflow-y-auto bg-black px-4 pt-2 pb-6">
      {/* Toggles section */}
      <div className="flex flex-col gap-[1px] overflow-hidden rounded-xl">
        <SettingsRow label="Modo Escuro" icon="🌙">
          <ToggleSwitch active={settings.darkMode} onToggle={() => toggle("darkMode")} />
        </SettingsRow>
        <SettingsRow label="Notificações" icon="🔔">
          <ToggleSwitch active={settings.notifications} onToggle={() => toggle("notifications")} />
        </SettingsRow>
        <SettingsRow label="Som" icon="🔊">
          <ToggleSwitch active={settings.sound} onToggle={() => toggle("sound")} />
        </SettingsRow>
      </div>

      {/* Sliders section */}
      <div className="flex flex-col gap-[1px] overflow-hidden rounded-xl">
        <div className="flex flex-col gap-3 border-b border-white/[0.04] bg-[#1c1c1e] p-4">
          <div className="flex items-center gap-3">
            <span className="text-[18px]">🔈</span>
            <span className="flex-1 text-[15px] text-white">Volume</span>
            <span className="text-[13px] text-white/40">{settings.volume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(e) => setSlider("volume", parseInt(e.target.value))}
            className="phone-slider w-full"
          />
        </div>
        <div className="flex flex-col gap-3 bg-[#1c1c1e] p-4">
          <div className="flex items-center gap-3">
            <span className="text-[18px]">🔍</span>
            <span className="flex-1 text-[15px] text-white">Zoom</span>
            <span className="text-[13px] text-white/40">{settings.zoom}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={200}
            value={settings.zoom}
            onChange={(e) => setSlider("zoom", parseInt(e.target.value))}
            className="phone-slider w-full"
          />
        </div>
      </div>

      {/* Wallpaper section */}
      <div className="flex flex-col gap-3">
        <span className="px-1 text-[13px] font-semibold uppercase tracking-wider text-white/30">
          Papel de Parede
        </span>
        <div className="grid grid-cols-4 gap-2">
          {WALLPAPERS.map((wp, idx) => (
            <button
              key={wp.id}
              onClick={() => setWallpaper(idx)}
              className="relative aspect-[9/19] overflow-hidden rounded-xl border-2 transition-all"
              style={{
                borderColor:
                  settings.wallpaper === idx ? "#0A84FF" : "rgba(255,255,255,0.06)",
              }}
            >
              <img
                src={wp.src}
                alt={wp.name}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              {settings.wallpaper === idx && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="text-[18px] text-white">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* About section */}
      <div className="flex flex-col gap-[1px] overflow-hidden rounded-xl">
        <div className="flex items-center justify-between bg-[#1c1c1e] p-4">
          <span className="text-[15px] text-white">Versão</span>
          <span className="text-[15px] text-white/40">2.0.0</span>
        </div>
        <div className="flex items-center justify-between bg-[#1c1c1e] p-4">
          <span className="text-[15px] text-white">Dispositivo</span>
          <span className="text-[15px] text-white/40">iPhone 15 Pro</span>
        </div>
        <div className="flex items-center justify-between bg-[#1c1c1e] p-4">
          <span className="text-[15px] text-white">Desenvolvido por</span>
          <span className="text-[15px] text-white/40">Agência SD</span>
        </div>
      </div>
    </div>
  );
}

function SettingsRow({ label, icon, children }) {
  return (
    <div className="flex items-center justify-between bg-[#1c1c1e] p-4">
      <div className="flex items-center gap-3">
        <span className="text-[18px]">{icon}</span>
        <span className="text-[15px] text-white">{label}</span>
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative h-[31px] w-[51px] rounded-full transition-colors duration-200"
      style={{ background: active ? "#30D158" : "#3a3a3c" }}
    >
      <div
        className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-md transition-all duration-200"
        style={{ left: active ? 22 : 2 }}
      />
    </button>
  );
}

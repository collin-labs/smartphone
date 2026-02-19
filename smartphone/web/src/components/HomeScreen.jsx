import { useCallback } from "react";
import { APPS, DOCK_APPS, WALLPAPERS } from "./data";
import { StatusBar } from "./StatusBar";
import { AppIcon } from "./AppIcon";

export function HomeScreen({ onOpenApp, wallpaper }) {
  const handleOpen = useCallback(
    (app) => {
      onOpenApp(app);
    },
    [onOpenApp]
  );

  const wp = WALLPAPERS[wallpaper] || WALLPAPERS[0];

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Real wallpaper image */}
      <img
        src={wp.src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content on top of wallpaper */}
      <div className="relative z-10 flex flex-col h-full">
        <StatusBar />

        {/* App grid area */}
        <div className="phone-scrollbar flex-1 overflow-y-auto px-5 pt-3 pb-2">
          <div className="grid grid-cols-4 gap-x-2 gap-y-5">
            {APPS.map((app) => (
              <div key={app.id} className="flex justify-center">
                <AppIcon app={app} onOpen={handleOpen} />
              </div>
            ))}
          </div>
        </div>

        {/* Dock */}
        <div
          className="relative mx-3 mb-2 rounded-[28px] border border-white/[0.08] px-3 py-3"
          style={{
            background: "rgba(30, 30, 30, 0.65)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
          }}
        >
          <div className="grid grid-cols-4 gap-1">
            {DOCK_APPS.map((app) => (
              <div key={app.id} className="flex justify-center">
                <AppIcon app={app} onOpen={handleOpen} size={54} />
              </div>
            ))}
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2">
          <div className="h-[5px] w-[134px] rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}

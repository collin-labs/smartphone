import { useState, useCallback, useRef } from "react";
import { APPS, DOCK_APPS, WALLPAPERS } from "./data";
import { StatusBar } from "./StatusBar";
import { AppIcon } from "./AppIcon";

const APPS_PER_PAGE = 24; // 4 columns × 6 rows

export function HomeScreen({ onOpenApp, wallpaper }) {
  const [currentPage, setCurrentPage] = useState(0);
  const touchRef = useRef({ startX: 0, startY: 0, isDragging: false });
  const containerRef = useRef(null);

  const handleOpen = useCallback(
    (app) => {
      onOpenApp(app);
    },
    [onOpenApp]
  );

  const wp = WALLPAPERS[wallpaper] || WALLPAPERS[0];

  // Split apps into pages
  const pages = [];
  for (let i = 0; i < APPS.length; i += APPS_PER_PAGE) {
    pages.push(APPS.slice(i, i + APPS_PER_PAGE));
  }
  const totalPages = pages.length;

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    touchRef.current.startX = e.touches[0].clientX;
    touchRef.current.startY = e.touches[0].clientY;
    touchRef.current.isDragging = false;
  };

  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      touchRef.current.isDragging = true;
    }
  };

  const onTouchEnd = (e) => {
    if (!touchRef.current.isDragging) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    if (dx < -50 && currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else if (dx > 50 && currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
    touchRef.current.isDragging = false;
  };

  // Mouse swipe fallback (for browser testing)
  const onMouseDown = (e) => {
    touchRef.current.startX = e.clientX;
    touchRef.current.isDragging = true;
  };

  const onMouseUp = (e) => {
    if (!touchRef.current.isDragging) return;
    const dx = e.clientX - touchRef.current.startX;
    if (dx < -50 && currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else if (dx > 50 && currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
    touchRef.current.isDragging = false;
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Wallpaper */}
      <img
        src={wp.src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <StatusBar />

        {/* Swipeable pages area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          <div
            className="flex h-full"
            style={{
              width: `${totalPages * 100}%`,
              transform: `translateX(-${currentPage * (100 / totalPages)}%)`,
              transition: "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {pages.map((pageApps, pageIndex) => (
              <div
                key={pageIndex}
                className="h-full px-5 pt-3 pb-1"
                style={{ width: `${100 / totalPages}%` }}
              >
                <div className="grid grid-cols-4 gap-x-2 gap-y-4 h-full content-start">
                  {pageApps.map((app) => (
                    <div key={app.id} className="flex justify-center">
                      <AppIcon app={app} onOpen={handleOpen} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-[6px] py-2">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className="border-none outline-none cursor-pointer p-0"
                style={{
                  width: currentPage === i ? 7 : 6,
                  height: currentPage === i ? 7 : 6,
                  borderRadius: "50%",
                  background: currentPage === i
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.35)",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        )}

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

import { useEffect, useState } from "react";

export function StatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-50 flex h-[54px] w-full items-center justify-between px-8 pt-[14px]">
      {/* Time */}
      <span className="text-[15px] font-semibold tracking-tight text-white">
        {time}
      </span>

      {/* Dynamic Island */}
      <div className="absolute left-1/2 top-[10px] h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" />

      {/* Right icons */}
      <div className="flex items-center gap-[6px]">
        {/* Signal bars */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="9" width="3" height="3" rx="0.5" fill="white" />
          <rect x="4" y="6" width="3" height="6" rx="0.5" fill="white" />
          <rect x="8" y="3" width="3" height="9" rx="0.5" fill="white" />
          <rect x="12" y="0" width="3" height="12" rx="0.5" fill="white" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="white" />
          <path
            d="M4.46 8.46a5 5 0 017.08 0"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M1.76 5.76a9 9 0 0112.48 0"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-[2px]">
          <div className="flex h-[12px] w-[24px] items-center rounded-[3px] border border-white/50 p-[1.5px]">
            <div className="h-full w-[75%] rounded-[1.5px] bg-white" />
          </div>
          <div className="h-[5px] w-[1.5px] rounded-r-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}

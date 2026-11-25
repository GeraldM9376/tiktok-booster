"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function TikTokLogo() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <div className="absolute inset-2 rounded-full bg-[#25F4EE]/10 blur-2xl" />
      <div className="absolute inset-2 rounded-full bg-[#FE2C55]/10 blur-2xl" />

      <img
        src="/tiktok-logo.png"
        alt="TikTok"
        className="relative h-28 w-28 object-contain animate-pulse drop-shadow-[0_0_12px_rgba(37,244,238,0.65)]"
      />
    </div>
  );
}

export function GlobalLoadingScreen() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setVisible(true);
    setProgress(5);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return 92;
        return Math.min(92, current + Math.random() * 7 + 2);
      });
    }, 120);

    const finish = window.setTimeout(() => {
      setProgress(100);

      window.setTimeout(() => {
        setVisible(false);
      }, 350);
    }, 1600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(finish);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#050505]">
      <div className="flex w-[min(280px,75vw)] flex-col items-center">
        <TikTokLogo />

        <div className="mt-7 h-[4px] w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#25F4EE] via-white to-[#FE2C55] transition-[width] duration-200 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow:
                "0 0 12px rgba(37,244,238,.8), 0 0 15px rgba(254,44,85,.7)",
            }}
          />
        </div>

        <div className="mt-4 flex w-full items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[4px] text-white/45">
            LOADING
          </p>
          <p className="text-[10px] tabular-nums text-white/45">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
}

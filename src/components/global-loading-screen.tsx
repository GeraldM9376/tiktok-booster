"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function NeonMusicMark() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      {/* Cyan neon shadow */}
      <svg
        viewBox="0 0 100 100"
        className="absolute h-24 w-24 translate-x-[-7px] translate-y-[3px] text-[#25F4EE] blur-[2px]"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="29" cy="70" r="12" fill="currentColor" />
        <path
          d="M41 69V22L79 13V58"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M41 37C54 27 66 30 79 39"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>

      {/* Pink neon shadow */}
      <svg
        viewBox="0 0 100 100"
        className="absolute h-24 w-24 translate-x-[7px] translate-y-[-3px] text-[#FE2C55] blur-[2px]"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="29" cy="70" r="12" fill="currentColor" />
        <path
          d="M41 69V22L79 13V58"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M41 37C54 27 66 30 79 39"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>

      {/* Main original white music symbol */}
      <svg
        viewBox="0 0 100 100"
        className="relative h-24 w-24 animate-pulse text-white drop-shadow-[0_0_13px_rgba(255,255,255,0.65)]"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="29" cy="70" r="12" fill="currentColor" />
        <path
          d="M41 69V22L79 13V58"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M41 37C54 27 66 30 79 39"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
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
        <NeonMusicMark />

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

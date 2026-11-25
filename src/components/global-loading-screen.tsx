"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function GlobalLoadingScreen() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setVisible(true);
    setProgress(8);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return 90;
        return Math.min(90, current + Math.random() * 8 + 2);
      });
    }, 100);

    const finish = window.setTimeout(() => {
      setProgress(100);

      window.setTimeout(() => {
        setVisible(false);
      }, 250);
    }, 1500);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(finish);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#080808]">
      <div className="flex w-[min(280px,75vw)] flex-col items-center">
        <div className="relative mb-9 flex h-24 w-24 items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="absolute h-[76px] w-[76px] translate-x-[-5px] translate-y-[3px] text-[#25F4EE] blur-[1px]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12.53.02C13.86 0 15.18.01 16.5 0c.08 1.5.62 2.95 1.7 4.02 1.07 1.09 2.56 1.6 4.04 1.74v4.08c-1.39-.05-2.78-.37-4.05-.97-.55-.25-1.07-.57-1.58-.89-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.78-1.35 3.93-1.3 1.92-3.55 3.17-5.88 3.21-1.43.08-2.86-.31-4.07-1.08-2.01-1.29-3.38-3.63-3.42-6.03-.04-1.49.37-2.98 1.17-4.24 1.29-2.08 3.65-3.42 6.1-3.46.23-.02.46-.01.69.01.02 1.51-.04 3.02-.04 4.53-1.01-.33-2.2-.24-3.08.37-.64.42-1.12 1.08-1.36 1.81-.2.49-.14 1.03-.13 1.55.24 1.64 1.81 3.02 3.48 2.87 1.11-.01 2.17-.67 2.75-1.61.19-.33.4-.68.41-1.07.1-1.78.06-3.57.07-5.35.01-4.02-.01-8.04.02-12.06z" />
          </svg>

          <svg
            viewBox="0 0 24 24"
            className="absolute h-[76px] w-[76px] translate-x-[5px] translate-y-[-3px] text-[#FE2C55] blur-[1px]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12.53.02C13.86 0 15.18.01 16.5 0c.08 1.5.62 2.95 1.7 4.02 1.07 1.09 2.56 1.6 4.04 1.74v4.08c-1.39-.05-2.78-.37-4.05-.97-.55-.25-1.07-.57-1.58-.89-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.78-1.35 3.93-1.3 1.92-3.55 3.17-5.88 3.21-1.43.08-2.86-.31-4.07-1.08-2.01-1.29-3.38-3.63-3.42-6.03-.04-1.49.37-2.98 1.17-4.24 1.29-2.08 3.65-3.42 6.1-3.46.23-.02.46-.01.69.01.02 1.51-.04 3.02-.04 4.53-1.01-.33-2.2-.24-3.08.37-.64.42-1.12 1.08-1.36 1.81-.2.49-.14 1.03-.13 1.55.24 1.64 1.81 3.02 3.48 2.87 1.11-.01 2.17-.67 2.75-1.61.19-.33.4-.68.41-1.07.1-1.78.06-3.57.07-5.35.01-4.02-.01-8.04.02-12.06z" />
          </svg>

          <svg
            viewBox="0 0 24 24"
            className="relative h-[76px] w-[76px] animate-pulse text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.45)]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12.53.02C13.86 0 15.18.01 16.5 0c.08 1.5.62 2.95 1.7 4.02 1.07 1.09 2.56 1.6 4.04 1.74v4.08c-1.39-.05-2.78-.37-4.05-.97-.55-.25-1.07-.57-1.58-.89-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.78-1.35 3.93-1.3 1.92-3.55 3.17-5.88 3.21-1.43.08-2.86-.31-4.07-1.08-2.01-1.29-3.38-3.63-3.42-6.03-.04-1.49.37-2.98 1.17-4.24 1.29-2.08 3.65-3.42 6.1-3.46.23-.02.46-.01.69.01.02 1.51-.04 3.02-.04 4.53-1.01-.33-2.2-.24-3.08.37-.64.42-1.12 1.08-1.36 1.81-.2.49-.14 1.03-.13 1.55.24 1.64 1.81 3.02 3.48 2.87 1.11-.01 2.17-.67 2.75-1.61.19-.33.4-.68.41-1.07.1-1.78.06-3.57.07-5.35.01-4.02-.01-8.04.02-12.06z" />
          </svg>
        </div>

        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#25F4EE] via-white to-[#FE2C55] transition-[width] duration-200 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 12px rgba(37,244,238,.7), 0 0 12px rgba(254,44,85,.5)",
            }}
          />
        </div>

        <p className="mt-4 text-[10px] font-semibold tracking-[4px] text-white/45">
          LOADING
        </p>
      </div>
    </div>
  );
}

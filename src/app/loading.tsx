// src/app/loading.tsx
import { Logo } from "@/components/brand/logo";

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 md:px-6 backdrop-blur">
        <div className="h-8 w-32 animate-pulse rounded-md bg-secondary/50" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 animate-pulse rounded-full bg-secondary/50" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-secondary/50" />
        </div>
      </div>

      <div className="flex flex-1">
        <div className="hidden w-64 flex-col border-r border-border/60 bg-sidebar p-4 md:flex">
          <div className="mb-8 mt-2"><Logo /></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-secondary/30" />
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#25F4EE] opacity-20 blur-2xl animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-[#FE2C55] opacity-20 blur-2xl animate-pulse delay-75" />
              
              <svg viewBox="0 0 448 512" className="relative h-24 w-24 animate-[bounce_2s_infinite]">
                <path fill="#25F4EE" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] origin-center" />
                <path fill="#FE2C55" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" style={{ mixBlendMode: 'screen', opacity: 0.9 }} />
              </svg>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Loading TikTok Booster</h2>
              <p className="mt-1 text-sm text-muted-foreground">Preparing your dashboard...</p>
            </div>
            
            <div className="h-1.5 w-64 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
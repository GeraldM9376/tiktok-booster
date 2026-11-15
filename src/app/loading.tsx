// src/app/loading.tsx
import { Logo } from "@/components/brand/logo";

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top Nav Skeleton */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 md:px-6 backdrop-blur">
        <div className="h-8 w-32 animate-pulse rounded-md bg-secondary/50" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 animate-pulse rounded-full bg-secondary/50" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-secondary/50" />
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar Skeleton */}
        <div className="hidden w-64 flex-col border-r border-border/60 bg-sidebar p-4 md:flex">
          <div className="mb-8 mt-2">
            <Logo />
          </div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-secondary/30" />
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
            {/* Animated Logo */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-accent to-primary shadow-glow animate-pulse">
              <span className="text-2xl font-extrabold text-background">TB</span>
            </div>
            
            {/* Loading Text */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Loading TikTok Booster</h2>
              <p className="mt-1 text-sm text-muted-foreground">Preparing your dashboard...</p>
            </div>
            
            {/* Custom Loader Bar */}
            <div className="h-1.5 w-64 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
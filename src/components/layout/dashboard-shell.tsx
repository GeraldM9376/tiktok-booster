// src/components/layout/dashboard-shell.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "./dashboard-layout-client";

interface DashboardShellProps {
  children: React.ReactNode;
  type: "earner" | "creator" | "admin";
  authPath: string;
}

async function DashboardShellContent({ children, type, authPath }: DashboardShellProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(authPath);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("available_balance")
    .eq("user_id", user.id)
    .single();

  return (
    <DashboardLayoutClient
      type={type}
      userEmail={user.email ?? ""}
      displayName={profile?.display_name ?? null}
      avatarUrl={profile?.avatar_url ?? null}
      walletBalance={wallet?.available_balance}
    >
      {children}
    </DashboardLayoutClient>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#25F4EE] opacity-20 blur-2xl animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-[#FE2C55] opacity-20 blur-2xl animate-pulse delay-75" />
          
          <svg viewBox="0 0 448 512" className="relative h-16 w-16 animate-[bounce_2s_infinite]">
            <path fill="#25F4EE" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
            <path fill="#FE2C55" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" style={{ mixBlendMode: 'screen', opacity: 0.9 }} />
          </svg>
        </div>
        
        <div className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55]" />
        </div>
      </div>
    }>
      <DashboardShellContent {...props} />
    </Suspense>
  );
}
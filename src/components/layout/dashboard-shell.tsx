// src/components/layout/dashboard-shell.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
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
        <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-primary shadow-glow animate-pulse">
          <span className="text-lg font-extrabold text-background">TB</span>
        </div>
        <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    }>
      <DashboardShellContent {...props} />
    </Suspense>
  );
}
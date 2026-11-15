// src/components/layout/dashboard-shell.tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
  type: "earner" | "creator" | "admin";
  authPath: string;
}

// 1. Inner component that fetches the data
async function DashboardShellContent({ children, type, authPath }: DashboardShellProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(authPath);
  }

  // Fetch the profile + wallet
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
    <div className="flex min-h-dvh">
      <Sidebar type={type} />
      <div className="flex flex-1 flex-col">
        <Topbar
          userEmail={user.email ?? ""}
          displayName={profile?.display_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          walletBalance={wallet?.available_balance}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

// 2. The exported shell wraps the content in Suspense
export function DashboardShell(props: DashboardShellProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DashboardShellContent {...props} />
    </Suspense>
  );
}
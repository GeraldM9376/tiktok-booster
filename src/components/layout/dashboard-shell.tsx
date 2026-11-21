
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "./dashboard-layout-client";

interface DashboardShellProps {
  children: React.ReactNode;
  type: "earner" | "creator" | "admin";
  authPath: string;
}

async function DashboardShellContent({
  children,
  type,
  authPath,
}: DashboardShellProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(authPath);
  }

  if (type === "admin") {
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id);

    const isAdmin =
      !roleError &&
      (roleData ?? []).some((item) => {
        const relation = item.roles;
        const roles = Array.isArray(relation) ? relation : [relation];

        return roles.some(
          (role) =>
            role !== null &&
            typeof role === "object" &&
            "name" in role &&
            role.name === "admin"
        );
      });

    if (!isAdmin) {
      redirect("/");
    }
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
    <Suspense
      fallback={
        <div className="flex min-h-dvh w-full items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <DashboardShellContent {...props} />
    </Suspense>
  );
}

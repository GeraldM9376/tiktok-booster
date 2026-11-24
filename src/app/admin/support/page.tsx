
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSupportClient } from "./support-client";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

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

  if (!isAdmin) redirect("/");

  const admin = createAdminClient();

  const { data: tickets, error } = await admin
    .from("support_tickets")
    .select(
      "id,user_id,subject,message,status,response,created_at,updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Failed to load support tickets:", error);
  }

  const userIds = [...new Set((tickets ?? []).map((ticket) => ticket.user_id))];

  let profiles: {
    id: string;
    email: string | null;
    display_name: string | null;
  }[] = [];

  if (userIds.length > 0) {
    const { data } = await admin
      .from("profiles")
      .select("id,email,display_name")
      .in("id", userIds);

    profiles = data ?? [];
  }

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

  const enrichedTickets = (tickets ?? []).map((ticket) => {
    const profile = profileMap.get(ticket.user_id);

    return {
      ...ticket,
      email: profile?.email ?? "",
      display_name: profile?.display_name ?? "",
    };
  });

  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="mt-2 text-muted-foreground">
            Review Creator requests and manage support responses.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
            Unable to load support tickets. Please refresh and try again.
          </div>
        ) : (
          <AdminSupportClient tickets={enrichedTickets} />
        )}
      </div>
    </DashboardShell>
  );
}

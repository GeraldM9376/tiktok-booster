
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { DeleteUserButton } from "./delete-user-button";
import { resolveAvatar } from "@/lib/utils";

type Relation = Record<string, unknown>;

function firstRelation(value: unknown): Relation | undefined {
  if (Array.isArray(value)) {
    return value[0] as Relation | undefined;
  }

  if (value && typeof value === "object") {
    return value as Relation;
  }

  return undefined;
}

function relationName(value: unknown): string | undefined {
  return firstRelation(value)?.name as string | undefined;
}

async function UsersContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      display_name,
      created_at,
      wallets (available_balance),
      user_roles (roles (name)),
      earner_profiles!user_id (approved),
      creator_profiles!user_id (approved),
      user_ranks!user_id (status, purchased_at, rank_packages (name))
    `)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
          Error loading users: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage registered platform accounts. ({profiles?.length ?? 0} users loaded)
        </p>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {profiles?.map((profile) => {
                const userRole = firstRelation(profile.user_roles);
                const role = relationName(userRole?.roles) ?? "earner";

                const wallet = firstRelation(profile.wallets);
                const balance = Number(wallet?.available_balance ?? 0);

                const rank = firstRelation(profile.user_ranks);
                const rankName =
                  relationName(rank?.rank_packages) ?? "Unranked";
                const rankStatus = String(rank?.status ?? "none");

                const email = profile.email ?? "";

                return (
                  <tr key={profile.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={resolveAvatar(null, profile.id)}
                          />
                          <AvatarFallback>
                            {profile.display_name?.slice(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="font-medium">
                            {profile.display_name || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          role === "admin"
                            ? "destructive"
                            : role === "creator"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {role}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{rankName}</span>

                        {rankStatus !== "none" && (
                          <Badge
                            variant={
                              rankStatus === "approved"
                                ? "default"
                                : rankStatus === "rejected"
                                  ? "destructive"
                                  : "outline"
                            }
                            className="w-max text-[10px]"
                          >
                            {rankStatus.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {balance.toLocaleString("en-KE")}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString("en-KE")}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {profile.id !== user.id ? (
                        <DeleteUserButton
                          userId={profile.id}
                          userEmail={email}
                        />
                      ) : (
                        <Badge variant="outline">Current account</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}

              {(!profiles || profiles.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {profiles && profiles.length === 1000 && (
        <p className="text-sm text-muted-foreground">
          Showing the first 1,000 users. Additional accounts may exist.
        </p>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <UsersContent />
      </Suspense>
    </DashboardShell>
  );
}


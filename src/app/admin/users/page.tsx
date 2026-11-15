// src/app/admin/users/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { DeleteUserButton } from "./delete-user-button";
import { resolveAvatar } from "@/lib/utils";

async function UsersContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/auth");

  // Fetch all profiles with safe disambiguation for relationships
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
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Error loading users: {error.message}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage all registered accounts on the platform. ({profiles?.length || 0} total)
        </p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles?.map((profile) => {
                const role = (profile.user_roles as any)?.[0]?.roles?.name || "earner";
                const balance = (profile.wallets as any)?.[0]?.available_balance || 0;
                
                // Safely extract the most recent rank (handles both array and single object returns)
                let rankName = "Unranked";
                let rankStatus = "none";
                const rankData = profile.user_ranks as any;

                if (rankData) {
                  if (Array.isArray(rankData) && rankData.length > 0) {
                    const latestRank = rankData.sort((a: any, b: any) => 
                      new Date(b.purchased_at || 0).getTime() - new Date(a.purchased_at || 0).getTime()
                    )[0];
                    rankName = latestRank.rank_packages?.name || "Unranked";
                    rankStatus = latestRank.status || "none";
                  } else if (typeof rankData === "object" && rankData.rank_packages) {
                    rankName = rankData.rank_packages.name || "Unranked";
                    rankStatus = rankData.status || "none";
                  }
                }

                return (
                  <tr key={profile.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={resolveAvatar(null, profile.id)} />
                          <AvatarFallback>{profile.display_name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.display_name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">{profile.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={role === "admin" ? "destructive" : role === "creator" ? "default" : "secondary"}>
                        {role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{rankName}</span>
                        {rankStatus !== "none" && (
                          <Badge variant={rankStatus === "approved" ? "default" : rankStatus === "rejected" ? "destructive" : "outline"} className="w-max text-[10px]">
                            {rankStatus.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{balance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteUserButton userId={profile.id} userEmail={profile.email} />
                    </td>
                  </tr>
                );
              })}
              {(!profiles || profiles.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <UsersContent />
      </Suspense>
    </DashboardShell>
  );
}
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

  // Fetch all profiles with their wallet balance, roles, and earner/creator status
  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      display_name,
      created_at,
      wallets (available_balance),
      user_roles (roles (name)),
      earner_profiles (approved),
      creator_profiles (approved)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage all registered accounts on the platform.
        </p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles?.map((profile) => {
                const role = (profile.user_roles as any)?.[0]?.roles?.name || "earner";
                const balance = (profile.wallets as any)?.[0]?.available_balance || 0;
                const earnerApproved = (profile.earner_profiles as any)?.[0]?.approved;
                const creatorApproved = (profile.creator_profiles as any)?.[0]?.approved;
                
                const isApproved = role === "earner" ? earnerApproved : creatorApproved;
                const safeId = profile.id;

                return (
                  <tr key={profile.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={resolveAvatar(null, safeId)} />
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
                      <Badge variant={isApproved ? "default" : "outline"}>
                        {isApproved ? "Active" : "Pending"}
                      </Badge>
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
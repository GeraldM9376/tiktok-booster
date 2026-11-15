// src/app/admin/ranks/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { RankActions } from "./rank-actions";

async function RanksContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/auth");

  // Fetch rank requests with explicit disambiguation
  const { data: requests, error } = await supabase
    .from("user_ranks")
    .select(`
      user_id,
      status,
      purchased_at,
      profiles!user_id (id, email),
      rank_packages (name, tier_value)
    `)
    .order("purchased_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Error loading requests: {error.message}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rank Approvals</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review and approve user rank purchases. ({requests?.length || 0} total)</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests?.map((req) => (
                <tr key={req.user_id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {req.purchased_at ? new Date(req.purchased_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">{(req.profiles as any)?.email || "Unknown"}</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {(req.rank_packages as any)?.name || "-"}
                  </td>
                  <td className="px-4 py-3">Ksh {(req.rank_packages as any)?.tier_value?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3">
                    <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}>
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {req.status === "pending" ? (
                      <RankActions requestId={req.user_id} userId={req.user_id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!requests || requests.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No rank requests found.
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

export default function AdminRanksPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <RanksContent />
      </Suspense>
    </DashboardShell>
  );
}
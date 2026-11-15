// src/app/admin/topups/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TopupActions } from "./topup-actions";
import { Loader2 } from "lucide-react";

async function TopupsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/auth");

  const { data: requests } = await supabase
    .from("topup_requests")
    .select(`
      id,
      requested_credits,
      transaction_reference,
      status,
      created_at,
      profiles (id, email),
      topup_packages (name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top-Up Requests</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and approve creators' credit purchases.
        </p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Credits</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests?.map((req) => (
                <tr key={req.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 truncate max-w-[150px]">
                    {(req.profiles as any)?.email || "Unknown"}
                  </td>
                  <td className="px-4 py-3">{(req.topup_packages as any)?.name || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    +{req.requested_credits.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{req.transaction_reference}</td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      req.status === "approved" ? "default" :
                      req.status === "rejected" ? "destructive" : "secondary"
                    }>
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {req.status === "pending" ? (
                      <TopupActions requestId={req.id} userId={(req.profiles as any)?.id} credits={req.requested_credits} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!requests || requests.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No top-up requests found.
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

export default function AdminTopupsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense fallback={
        <div className="flex h-[50vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <TopupsContent />
      </Suspense>
    </DashboardShell>
  );
}
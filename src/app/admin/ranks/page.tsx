
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { RankActions } from "./rank-actions";

export const dynamic = "force-dynamic";

function getRelation(value: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(value)) {
    return value[0] as Record<string, unknown> | undefined;
  }

  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return undefined;
}

async function RanksContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data: requests, error } = await supabase
    .from("user_ranks")
    .select(`
      user_id,
      status,
      purchased_at,
      profiles!user_id (id, email),
      rank_packages (name, tier_value)
    `)
    .order("purchased_at", { ascending: false })
    .limit(1000);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Rank Approvals</h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
          Failed to load rank requests: {error.message}
        </div>
      </div>
    );
  }

  const { data: logs, error: logsError } = await supabase
    .from("audit_logs")
    .select("actor_id, metadata, created_at")
    .eq("action", "rank_upgrade_requested")
    .order("created_at", { ascending: false })
    .limit(1000);

  const mpesaCodes = new Map<string, string>();

  logs?.forEach((log) => {
    const metadata = log.metadata as Record<string, unknown> | null;
    const code = metadata?.mpesa_code;

    if (
      log.actor_id &&
      typeof code === "string" &&
      code.trim() &&
      !mpesaCodes.has(log.actor_id)
    ) {
      mpesaCodes.set(log.actor_id, code);
    }
  });

  const pendingCount = requests?.filter(
    (request) => request.status === "pending"
  ).length ?? 0;

  const approvedCount = requests?.filter(
    (request) => request.status === "approved"
  ).length ?? 0;

  const rejectedCount = requests?.filter(
    (request) => request.status === "rejected"
  ).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rank Approvals</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and process user rank purchases.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Pending Requests</p>
          <p className="mt-2 text-3xl font-bold">{pendingCount}</p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="mt-2 text-3xl font-bold">{approvedCount}</p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="mt-2 text-3xl font-bold">{rejectedCount}</p>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Rank Purchase Requests</h2>
          <p className="text-sm text-muted-foreground">
            {requests?.length ?? 0} requests loaded
          </p>
        </div>

        {logsError && (
          <div className="border-b border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-600">
            M-Pesa payment codes could not be loaded: {logsError.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">M-Pesa Code</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {requests?.map((request) => {
                const profile = getRelation(request.profiles);
                const rank = getRelation(request.rank_packages);

                const email =
                  typeof profile?.email === "string"
                    ? profile.email
                    : "Unknown";

                const rankName =
                  typeof rank?.name === "string"
                    ? rank.name
                    : "Unknown Rank";

                const price = Number(rank?.tier_value ?? 0);

                return (
                  <tr
                    key={request.user_id}
                    className="hover:bg-secondary/20"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      {request.purchased_at
                        ? new Date(request.purchased_at).toLocaleDateString("en-KE")
                        : "-"}
                    </td>

                    <td className="px-4 py-3">{email}</td>

                    <td className="px-4 py-3 font-semibold text-primary">
                      {rankName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      Ksh {price.toLocaleString("en-KE")}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs">
                      {mpesaCodes.get(request.user_id) ?? "N/A"}
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {request.status === "pending" ? (
                        <RankActions requestId={request.user_id} />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {(!requests || requests.length === 0) && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
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
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <RanksContent />
      </Suspense>
    </DashboardShell>
  );
}

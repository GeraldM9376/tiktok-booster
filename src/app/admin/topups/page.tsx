
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TopupActions } from "./topup-actions";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

type Relation = Record<string, unknown>;

function getRelation(value: unknown): Relation | undefined {
  if (Array.isArray(value)) {
    return value[0] as Relation | undefined;
  }

  if (value && typeof value === "object") {
    return value as Relation;
  }

  return undefined;
}

function getStatusVariant(status: string) {
  if (status === "approved") return "default" as const;
  if (status === "rejected") return "destructive" as const;
  return "secondary" as const;
}

async function TopupsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data: requests, error } = await supabase
    .from("topup_requests")
    .select(`
      id,
      user_id,
      requested_credits,
      transaction_reference,
      status,
      created_at,
      profiles (
        id,
        email
      ),
      topup_packages (
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Top-Up Requests
        </h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
          Failed to load top-up requests: {error.message}
        </div>
      </div>
    );
  }

  const pending = requests?.filter(
    (request) => request.status === "pending"
  ) ?? [];

  const approved = requests?.filter(
    (request) => request.status === "approved"
  ) ?? [];

  const rejected = requests?.filter(
    (request) => request.status === "rejected"
  ) ?? [];

  const pendingCredits = pending.reduce(
    (total, request) => total + Number(request.requested_credits),
    0
  );

  const approvedCredits = approved.reduce(
    (total, request) => total + Number(request.requested_credits),
    0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Top-Up Requests
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and approve creators' credit purchases.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Requests</p>
          <p className="mt-2 text-3xl font-bold">
            {requests?.length ?? 0}
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Pending Requests</p>
          <p className="mt-2 text-3xl font-bold">{pending.length}</p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Pending Credits</p>
          <p className="mt-2 text-2xl font-bold">
            {pendingCredits.toLocaleString("en-KE")}
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Approved Credits</p>
          <p className="mt-2 text-2xl font-bold">
            {approvedCredits.toLocaleString("en-KE")}
          </p>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">Top-Up History</h2>
            <p className="text-sm text-muted-foreground">
              Latest {requests?.length ?? 0} requests
            </p>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary">
              {pending.length} Pending
            </Badge>
            <Badge variant="destructive">
              {rejected.length} Rejected
            </Badge>
          </div>
        </div>

        {!requests?.length ? (
          <div className="p-10 text-center text-muted-foreground">
            No top-up requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Package</th>
                  <th className="px-4 py-3 font-medium">Credits</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {requests.map((request) => {
                  const profile = getRelation(request.profiles);
                  const packageInfo = getRelation(request.topup_packages);

                  return (
                    <tr
                      key={request.id}
                      className="hover:bg-secondary/20"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(request.created_at).toLocaleString("en-KE")}
                      </td>

                      <td className="max-w-[180px] truncate px-4 py-3">
                        {typeof profile?.email === "string"
                          ? profile.email
                          : request.user_id}
                      </td>

                      <td className="px-4 py-3">
                        {typeof packageInfo?.name === "string"
                          ? packageInfo.name
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-primary">
                        +{Number(request.requested_credits).toLocaleString("en-KE")}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs">
                        {request.transaction_reference || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(request.status)}>
                          {request.status}
                        </Badge>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {request.status === "pending" ? (
                          <TopupActions
                            requestId={request.id}
                            credits={request.requested_credits}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {requests?.length === 500 && (
        <p className="text-sm text-muted-foreground">
          Showing the latest 500 requests. Older records may exist.
        </p>
      )}
    </div>
  );
}

export default function AdminTopupsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <TopupsContent />
      </Suspense>
    </DashboardShell>
  );
}

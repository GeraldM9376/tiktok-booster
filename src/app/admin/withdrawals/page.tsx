
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { WithdrawalActions } from "./withdrawal-actions";
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

function getText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getStatusVariant(status: string) {
  if (status === "approved" || status === "paid") {
    return "default" as const;
  }

  if (status === "rejected") {
    return "destructive" as const;
  }

  return "secondary" as const;
}

async function WithdrawalsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data: requests, error } = await supabase
    .from("withdrawal_requests")
    .select(`
      id,
      user_id,
      amount,
      qualified_referrals,
      status,
      admin_comment,
      created_at,
      reviewed_at,
      profiles:profiles!withdrawal_requests_user_id_fkey (
        id,
        email,
        earner_profiles:earner_profiles!earner_profiles_user_id_fkey (
          payment_details
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Withdrawal Requests
        </h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
          Failed to load withdrawal requests: {error.message}
        </div>
      </div>
    );
  }

  const pending =
    requests?.filter((request) => request.status === "pending") ?? [];

  const approved =
    requests?.filter(
      (request) =>
        request.status === "approved" || request.status === "paid"
    ) ?? [];

  const rejected =
    requests?.filter((request) => request.status === "rejected") ?? [];

  const pendingAmount = pending.reduce(
    (total, request) => total + Number(request.amount),
    0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Withdrawal Requests
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and process earner payout requests.
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
          <p className="text-sm text-muted-foreground">Pending Amount</p>
          <p className="mt-2 text-2xl font-bold">
            Ksh {pendingAmount.toLocaleString("en-KE")}
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Approved / Paid
          </p>
          <p className="mt-2 text-3xl font-bold">{approved.length}</p>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">Withdrawal History</h2>
            <p className="text-sm text-muted-foreground">
              Latest {requests?.length ?? 0} requests
            </p>
          </div>

          <Badge variant="destructive">
            {rejected.length} Rejected
          </Badge>
        </div>

        {!requests?.length ? (
          <div className="p-10 text-center text-muted-foreground">
            No withdrawal requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Referrals</th>
                  <th className="px-4 py-3 font-medium">Payment Details</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {requests.map((request) => {
                  const profile = getRelation(request.profiles);
                  const earner = getRelation(profile?.earner_profiles);
                  const payment = getRelation(earner?.payment_details);

                  const method = getText(payment?.method).toLowerCase();
                  const email = getText(profile?.email);
                  const mpesaNumber = getText(payment?.mpesa_number);
                  const bankName = getText(payment?.bank_name);
                  const accountNumber = getText(payment?.account_number);

                  return (
                    <tr
                      key={request.id}
                      className="hover:bg-secondary/20"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(request.created_at).toLocaleString("en-KE")}
                      </td>

                      <td className="px-4 py-3">
                        <p>{email || "Unknown user"}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.user_id.slice(0, 8)}...
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-semibold">
                        Ksh {Number(request.amount).toLocaleString("en-KE")}
                      </td>

                      <td className="px-4 py-3">
                        {request.qualified_referrals}
                      </td>

                      <td className="min-w-40 px-4 py-3">
                        {payment && method ? (
                          <div className="rounded-lg bg-secondary/50 p-3 text-xs">
                            <p className="mb-1 font-bold uppercase text-primary">
                              {method}
                            </p>

                            {method === "mpesa" ? (
                              <p>{mpesaNumber || "Number not provided"}</p>
                            ) : (
                              <>
                                <p>{bankName || "Bank not provided"}</p>
                                <p>
                                  {accountNumber || "Account not provided"}
                                </p>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-red-500">
                            No payment details saved
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(request.status)}>
                          {request.status}
                        </Badge>

                        {request.admin_comment && (
                          <p className="mt-2 max-w-40 text-xs text-muted-foreground">
                            {request.admin_comment}
                          </p>
                        )}

                        {request.reviewed_at && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Reviewed:{" "}
                            {new Date(request.reviewed_at).toLocaleDateString(
                              "en-KE"
                            )}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {request.status === "pending" ? (
                          <WithdrawalActions
                            requestId={request.id}
                            amount={request.amount}
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

export default function AdminWithdrawalsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <WithdrawalsContent />
      </Suspense>
    </DashboardShell>
  );
}

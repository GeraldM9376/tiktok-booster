
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

type ProfileRelation = {
  email?: string | null;
};

function getProfile(
  value: ProfileRelation | ProfileRelation[] | null
): ProfileRelation | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function formatType(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );
}

function getStatusVariant(status: string) {
  if (status === "completed") return "default" as const;
  if (status === "failed" || status === "reversed") {
    return "destructive" as const;
  }
  return "secondary" as const;
}

async function TransactionsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select(`
      id,
      user_id,
      type,
      amount,
      status,
      created_at,
      description,
      profiles!user_id (email)
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold">Transaction Ledger</h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
          Failed to load transactions: {error.message}
        </div>
      </div>
    );
  }

  const transactions = data ?? [];

  const completed = transactions.filter(
    (tx) => tx.status === "completed"
  );

  const pendingCount = transactions.filter(
    (tx) => tx.status === "pending"
  ).length;

  const failedCount = transactions.filter(
    (tx) => tx.status === "failed" || tx.status === "reversed"
  ).length;

  const completedAmount = completed.reduce(
    (total, tx) => total + Number(tx.amount),
    0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Transaction Ledger
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitor wallet transactions across the platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Transactions Loaded
          </p>
          <p className="mt-2 text-3xl font-bold">
            {transactions.length}
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Pending Transactions
          </p>
          <p className="mt-2 text-3xl font-bold">{pendingCount}</p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Completed Amount (Recorded)
          </p>
          <p className="mt-2 text-2xl font-bold">
            {completedAmount.toLocaleString("en-KE")}
          </p>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <p className="text-sm text-muted-foreground">
              Latest {transactions.length} records
            </p>
          </div>

          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>Failed / Reversed: {failedCount}</span>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {transactions.map((tx) => {
                  const profile = getProfile(tx.profiles);
                  const amount = Number(tx.amount);

                  return (
                    <tr key={tx.id} className="hover:bg-secondary/20">
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString("en-KE")}
                      </td>

                      <td className="px-4 py-3">
                        <p>{profile?.email || "Unknown user"}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.user_id.slice(0, 8)}...
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {formatType(tx.type)}
                      </td>

                      <td className="max-w-xs px-4 py-3 text-muted-foreground">
                        <span className="line-clamp-2">
                          {tx.description || "No description"}
                        </span>
                      </td>

                      <td
                        className={`whitespace-nowrap px-4 py-3 font-semibold ${
                          amount > 0
                            ? "text-green-500"
                            : amount < 0
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {amount > 0 ? "+" : ""}
                        {amount.toLocaleString("en-KE")}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(tx.status)}>
                          {formatType(tx.status)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {transactions.length === 500 && (
        <p className="text-sm text-muted-foreground">
          Showing the latest 500 transactions. Older records may exist.
        </p>
      )}
    </div>
  );
}

export default function AdminTransactionsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <TransactionsContent />
      </Suspense>
    </DashboardShell>
  );
}


import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TransactionsClient from "./transactions-client";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
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
      balance_before,
      balance_after,
      status,
      created_at,
      description,
      profiles!user_id(email)
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      {error ? (
        <div className="mx-auto max-w-6xl space-y-6">
          <h1 className="text-3xl font-bold">Transaction Ledger</h1>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
            Failed to load transactions: {error.message}
          </div>
        </div>
      ) : (
        <TransactionsClient
          transactions={(data ?? []) as unknown as any[]}
        />
      )}
    </DashboardShell>
  );
}

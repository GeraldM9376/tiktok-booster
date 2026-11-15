// src/app/admin/transactions/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

async function TransactionsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/auth");

  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select(`id, type, amount, status, created_at, description, profiles!user_id (email)`)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-3xl font-bold">Transaction Ledger</h1>
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions?.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-3 text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">{(tx.profiles as any)?.email}</td>
                <td className="px-4 py-3 capitalize">{tx.type.replace("_", " ")}</td>
                <td className={`px-4 py-3 font-semibold ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                </td>
                <td className="px-4 py-3"><Badge>{tx.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminTransactionsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <TransactionsContent />
      </Suspense>
    </DashboardShell>
  );
}
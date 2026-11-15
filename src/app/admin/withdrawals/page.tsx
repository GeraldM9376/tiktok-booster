// src/app/admin/withdrawals/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { WithdrawalActions } from "./withdrawal-actions";
import { Loader2 } from "lucide-react";

async function WithdrawalsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/auth");

  const { data: requests } = await supabase
    .from("withdrawal_requests")
    .select(`
      id, amount, qualified_referrals, status, created_at,
      profiles (id, email, earner_profiles (payment_details))
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review and approve earner payouts.</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests?.map((req) => {
              const paymentDetails = (req.profiles as any)?.earner_profiles?.[0]?.payment_details;
              
              return (
                <tr key={req.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{(req.profiles as any)?.email}</td>
                  <td className="px-4 py-3 font-semibold text-red-400">-{req.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {paymentDetails ? (
                      <div className="text-xs bg-secondary/50 p-2 rounded">
                        <p className="font-bold uppercase text-primary">{paymentDetails.method}</p>
                        <p>{paymentDetails.mpesa_number || paymentDetails.account_number}</p>
                        {paymentDetails.bank_name && <p>{paymentDetails.bank_name}</p>}
                      </div>
                    ) : (
                      <span className="text-red-500 text-xs">No details saved</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}>
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {req.status === "pending" ? (
                      <WithdrawalActions requestId={req.id} userId={(req.profiles as any)?.id} amount={req.amount} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Processed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminWithdrawalsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <WithdrawalsContent />
      </Suspense>
    </DashboardShell>
  );
}
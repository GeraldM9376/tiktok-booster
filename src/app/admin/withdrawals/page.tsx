
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { WithdrawalActions } from "./withdrawal-actions";
import { Loader2 } from "lucide-react";

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
      profiles (
        id,
        email,
        earner_profiles (
          payment_details
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Withdrawal requests error:", error.message);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Withdrawal Requests
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and approve earner payouts.
        </p>
      </div>

      <div className="glass overflow-x-auto rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Referrals</th>
              <th className="px-4 py-3">Payment Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {requests?.map((req) => {
              const profile = req.profiles as any;
              const paymentDetails =
                profile?.earner_profiles?.[0]?.payment_details;

              return (
                <tr key={req.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {profile?.email || req.user_id}
                  </td>

                  <td className="px-4 py-3 font-semibold text-red-400">
                    {req.amount.toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    {req.qualified_referrals}
                  </td>

                  <td className="px-4 py-3">
                    {paymentDetails ? (
                      <div className="rounded bg-secondary/50 p-2 text-xs">
                        <p className="font-bold uppercase text-primary">
                          {paymentDetails.method}
                        </p>

                        {paymentDetails.method === "mpesa" ? (
                          <p>{paymentDetails.mpesa_number}</p>
                        ) : (
                          <>
                            <p>{paymentDetails.bank_name}</p>
                            <p>{paymentDetails.account_number}</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-red-500">
                        No details saved
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        req.status === "approved" || req.status === "paid"
                          ? "default"
                          : req.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {req.status}
                    </Badge>

                    {req.admin_comment && (
                      <p className="mt-1 max-w-40 text-xs text-muted-foreground">
                        {req.admin_comment}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {req.status === "pending" ? (
                      <WithdrawalActions
                        requestId={req.id}
                        amount={req.amount}
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

            {!requests?.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No withdrawal requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminWithdrawalsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <WithdrawalsContent />
      </Suspense>
    </DashboardShell>
  );
}

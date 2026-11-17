
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
} from "lucide-react";
import { WithdrawalForm } from "./withdrawal-form";
import { PaymentSettingsForm } from "./payment-settings-form";

async function EarningsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/earn/auth");

  const [
    walletResult,
    profileResult,
    rankResult,
    referralsResult,
    withdrawalsResult,
  ] = await Promise.all([
    supabase
      .from("wallets")
      .select("available_balance")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("earner_profiles")
      .select("payment_details")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("user_ranks")
      .select("rank_packages(stars)")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .maybeSingle(),

    supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user.id)
      .eq("status", "approved"),

    supabase
      .from("withdrawal_requests")
      .select(
        "id, amount, status, admin_comment, created_at, reviewed_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const wallet = walletResult.data;
  const profile = profileResult.data;
  const rankData = rankResult.data;

  const hasDetails = !!profile?.payment_details;
  const userStars = (rankData?.rank_packages as any)?.stars || 1;
  const requiredReferrals = Math.max(0, 8 - userStars);
  const qualifiedReferrals = referralsResult.count || 0;

  const withdrawals = withdrawalsResult.data || [];

  const totalWithdrawn = withdrawals
    .filter(
      (item) => item.status === "approved" || item.status === "paid"
    )
    .reduce((sum, item) => sum + Number(item.amount), 0);

  function getStatus(status: string) {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className:
            "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
          icon: <Clock className="h-4 w-4" />,
        };

      case "approved":
        return {
          label: "Approved",
          className:
            "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: <CheckCircle2 className="h-4 w-4" />,
        };

      case "paid":
        return {
          label: "Paid",
          className:
            "bg-green-500/10 text-green-600 border-green-500/20",
          icon: <CheckCircle2 className="h-4 w-4" />,
        };

      case "rejected":
        return {
          label: "Rejected",
          className:
            "bg-red-500/10 text-red-600 border-red-500/20",
          icon: <XCircle className="h-4 w-4" />,
        };

      default:
        return {
          label: status,
          className: "bg-muted text-muted-foreground border-border",
          icon: <Clock className="h-4 w-4" />,
        };
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Withdrawals
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Request payouts and track your withdrawal history.
        </p>
      </div>

      {!hasDetails && (
        <div className="flex flex-col gap-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-orange-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">
              You must set up payment details before you can withdraw.
            </p>
          </div>

          <div className="rounded-lg border border-orange-500/20 bg-background p-4">
            <h3 className="mb-4 text-sm font-bold text-foreground">
              Payment Details Setup
            </h3>
            <PaymentSettingsForm initialDetails={null} />
          </div>
        </div>
      )}

      <WithdrawalForm
        availableBalance={wallet?.available_balance || 0}
        qualifiedReferrals={qualifiedReferrals}
        requiredReferrals={requiredReferrals}
        hasPaymentDetails={hasDetails}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Withdrawal History
            </h2>
            <p className="text-sm text-muted-foreground">
              Track the status of your payout requests.
            </p>
          </div>
          <Banknote className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Total requests
            </p>
            <p className="mt-1 text-2xl font-bold">
              {withdrawals.length}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Total approved/paid
            </p>
            <p className="mt-1 text-2xl font-bold">
              KSh {totalWithdrawn.toLocaleString()}
            </p>
          </div>
        </div>

        {withdrawalsResult.error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
            Could not load withdrawal history:{" "}
            {withdrawalsResult.error.message}
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Banknote className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-semibold">
              No withdrawal history yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your withdrawal requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((item) => {
              const status = getStatus(item.status);

              return (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold">
                        KSh {Number(item.amount).toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Requested:{" "}
                        {new Date(item.created_at).toLocaleString(
                          "en-KE",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {item.reviewed_at && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Reviewed:{" "}
                      {new Date(item.reviewed_at).toLocaleString(
                        "en-KE",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </p>
                  )}

                  {item.admin_comment && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Admin comment
                      </p>
                      <p className="mt-1 text-sm">
                        {item.admin_comment}
                      </p>
                    </div>
                  )}

                  {item.status === "rejected" && (
                    <p className="mt-3 text-xs font-medium text-green-600">
                      Your withdrawal was rejected. The amount has
                      been returned to your wallet if it was deducted.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function EarningsPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <EarningsContent />
      </Suspense>
    </DashboardShell>
  );
}

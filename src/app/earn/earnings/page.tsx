// src/app/earn/earnings/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WithdrawalForm } from "./withdrawal-form";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

async function EarningsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  const { data: wallet } = await supabase
    .from("wallets")
    .select("available_balance")
    .eq("user_id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("earner_profiles")
    .select("payment_details")
    .eq("user_id", user.id)
    .single();

  const { count: qualifiedReferrals } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id)
    .eq("status", "approved");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Request a payout of your earned credits.
        </p>
      </div>

      {!profile?.payment_details && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Payment Details Missing</p>
            <p className="text-sm">You must set up your payment details before you can withdraw.</p>
            <Link href="/earn/settings" className="text-sm font-bold underline mt-1 inline-block">
              Go to Settings
            </Link>
          </div>
        </div>
      )}

      <WithdrawalForm 
        availableBalance={wallet?.available_balance || 0}
        qualifiedReferrals={qualifiedReferrals || 0}
        hasPaymentDetails={!!profile?.payment_details}
      />
    </div>
  );
}

export default function EarningsPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <EarningsContent />
      </Suspense>
    </DashboardShell>
  );
}
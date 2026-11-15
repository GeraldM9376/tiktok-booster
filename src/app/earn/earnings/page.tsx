// src/app/earn/earnings/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { WithdrawalForm } from "./withdrawal-form";
import { PaymentSettingsForm } from "./payment-settings-form";

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
    .maybeSingle();

  const hasDetails = !!profile?.payment_details;

  const { data: rankData } = await supabase
    .from("user_ranks")
    .select("rank_packages(stars)")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  const userStars = (rankData?.rank_packages as any)?.stars || 1;
  const requiredReferrals = 8 - userStars;

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

      {!hasDetails && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">You must set up payment details before you can withdraw.</p>
          </div>
          <div className="bg-background rounded-lg p-4 border border-orange-500/20">
            <h3 className="text-sm font-bold mb-4 text-foreground">Payment Details Setup</h3>
            <PaymentSettingsForm initialDetails={null} />
          </div>
        </div>
      )}

      <WithdrawalForm 
        availableBalance={wallet?.available_balance || 0}
        qualifiedReferrals={qualifiedReferrals || 0}
        requiredReferrals={requiredReferrals}
        hasPaymentDetails={hasDetails}
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
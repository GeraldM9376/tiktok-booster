// src/app/earn/earnings/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WithdrawalForm } from "./withdrawal-form";
import { Loader2 } from "lucide-react";

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

      <WithdrawalForm 
        availableBalance={wallet?.available_balance || 0}
        qualifiedReferrals={qualifiedReferrals || 0}
        requiredReferrals={requiredReferrals}
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
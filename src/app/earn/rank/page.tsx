// src/app/earn/rank/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2, Star, CheckCircle2, Lock } from "lucide-react";
import { RankUpgradeClient } from "./rank-upgrade-client";

async function RankContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  const { data: ranks } = await supabase
    .from("rank_packages")
    .select("*")
    .order("stars", { ascending: true });

  const { data: userRank } = await supabase
    .from("user_ranks")
    .select("status, rank_id, rank_packages(name, stars)")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", ["payment_paybill", "payment_account"]);
    
  const paybill = settings?.find(s => s.key === "payment_paybill")?.value || "400200";
  const account = settings?.find(s => s.key === "payment_account")?.value || "TIKTOKBOOSTER";

  const currentRankId = userRank?.rank_id || 0;
  const isPending = userRank?.status === "pending";
  const currentRankName = (userRank?.rank_packages as any)?.name || "Unranked";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Ranks</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upgrade your rank to unlock higher daily task limits.
        </p>
      </div>

      <div className="glass rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <p className="text-sm text-muted-foreground">Current Plan</p>
          <h2 className="text-2xl font-bold">{isPending ? "Pending Upgrade" : currentRankName}</h2>
        </div>
      </div>

      {/* Always show the upgrade client, passing the current rank ID */}
      <RankUpgradeClient 
        ranks={ranks || []} 
        paybill={paybill} 
        account={account} 
        currentRankId={currentRankId} 
      />
    </div>
  );
}

export default function RankPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <RankContent />
      </Suspense>
    </DashboardShell>
  );
}

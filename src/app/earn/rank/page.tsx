// src/app/earn/rank/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2, Star, CheckCircle2, Lock, AlertCircle } from "lucide-react";
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

  const currentRankId = userRank?.rank_id;
  const isPending = userRank?.status === "pending";
  const isApproved = userRank?.status === "approved";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Ranks</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Purchase a rank to unlock daily tasks and start earning credits.
        </p>
      </div>

      {isPending && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Approval Pending</p>
            <p className="text-sm">Your rank purchase is awaiting admin approval. You cannot earn credits until it is approved.</p>
          </div>
        </div>
      )}

      {!isApproved && !isPending ? (
        <RankUpgradeClient ranks={ranks || []} paybill={paybill} account={account} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ranks?.map((rank) => {
            const isCurrent = currentRankId === rank.id && isApproved;
            const isUnlocked = currentRankId >= rank.id && isApproved;

            return (
              <div key={rank.id} className={`glass rounded-xl p-6 flex flex-col ${isCurrent ? "border-primary shadow-glow" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {Array.from({ length: rank.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                    ))}
                  </div>
                  {isCurrent && <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded">ACTIVE</span>}
                  {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <h3 className="text-lg font-bold">{rank.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">Value: {rank.tier_value.toLocaleString()} Ksh</p>
                <ul className="space-y-2 text-sm mt-auto">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${isUnlocked ? "text-green-500" : "text-muted-foreground"}`} />
                    <span>{rank.daily_follow_tasks} Follows / day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${isUnlocked ? "text-green-500" : "text-muted-foreground"}`} />
                    <span>{rank.daily_like_tasks} Likes / day</span>
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      )}
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
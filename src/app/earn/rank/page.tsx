// src/app/earn/rank/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2, Star, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function RankContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  // Fetch all rank packages
  const { data: ranks } = await supabase
    .from("rank_packages")
    .select("*")
    .order("stars", { ascending: true });

  // Fetch user's current rank
  const { data: userRank } = await supabase
    .from("user_ranks")
    .select("status, rank_packages(name, stars)")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentStars = (userRank?.rank_packages as any)?.stars || 0;
  const isApproved = userRank?.status === "approved";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Ranks</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upgrade your rank to unlock higher daily task limits and bigger earnings.
        </p>
      </div>

      {/* Current Rank Card */}
      <div className="glass rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Star className="h-8 w-8 text-primary fill-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your Current Rank</p>
            <h2 className="text-2xl font-bold">
              {isApproved ? (userRank?.rank_packages as any)?.name : "Unranked"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isApproved ? "Active member" : "Upgrade to start earning"}
            </p>
          </div>
        </div>
        {!isApproved && (
          <Button className="shadow-glow">Upgrade Rank</Button>
        )}
      </div>

      {/* Ranks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ranks?.map((rank) => {
          const isCurrent = currentStars === rank.stars && isApproved;
          const isUnlocked = currentStars >= rank.stars && isApproved;

          return (
            <div key={rank.id} className={`glass rounded-xl p-6 flex flex-col ${isCurrent ? "border-primary shadow-glow" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {Array.from({ length: rank.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                {isCurrent && <Badge>Current</Badge>}
                {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>

              <h3 className="text-lg font-bold">{rank.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">Tier Value: {rank.tier_value.toLocaleString()}</p>

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
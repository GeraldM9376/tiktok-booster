
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskButton } from "../../creators/[id]/task-button";
import { Loader2, Clock } from "lucide-react";
import { resolveAvatar, getRealName, getRealUsername } from "@/lib/utils";
import { CountdownTimer } from "@/components/earn/countdown-timer";

function getNicheName(niches: any): string {
  if (!niches) return "Uncategorized";
  if (Array.isArray(niches)) return niches[0]?.name || "Uncategorized";
  return niches.name || "Uncategorized";
}

async function DailyTasksContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/earn/auth");

  const { data: todayData } = await supabase.rpc("get_local_date");

  const today =
    todayData ||
    new Date(Date.now() + 3 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

  const { data: rankData } = await supabase
    .from("user_ranks")
    .select("rank_packages(name, daily_follow_tasks)")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  const followLimit =
    (rankData?.rank_packages as any)?.daily_follow_tasks || 5;

  const rankName =
    (rankData?.rank_packages as any)?.name || "Unranked";

  const { data: creators } = await supabase
    .from("creators")
    .select("*, niches(name)")
    .limit(50);

  const { data: completed } = await supabase
    .from("completed_tasks")
    .select("target_id")
    .eq("user_id", user.id)
    .eq("task_type", "follow")
    .eq("day_bucket", today);

  const completedIds = completed?.map((c) => c.target_id) || [];
  const allDone = completedIds.length >= followLimit;

  const dailySeed = today.replace(/-/g, "").slice(2);

  const shuffled = (creators || [])
    .sort((a, b) => {
      const hashA = (parseInt(dailySeed) + a.id.charCodeAt(0)) % 1000;
      const hashB = (parseInt(dailySeed) + b.id.charCodeAt(0)) % 1000;
      return hashA - hashB;
    })
    .slice(0, followLimit);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Daily Follow Tasks
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            You are on the <strong>{rankName}</strong> plan. You can follow up
            to {followLimit} creators today.
          </p>
        </div>

        <div className="glass px-4 py-3 rounded-xl flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />

          <div>
            <p className="text-xs text-muted-foreground">Resets in</p>
            <p className="font-mono font-bold text-foreground">
              <CountdownTimer />
            </p>
          </div>
        </div>
      </div>

      {allDone && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
          ðŸŽ‰ All follow tasks done for today! Click "Earn More" to like videos.
        </div>
      )}

      <div>
        {shuffled.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shuffled.map((creator) => (
              <Card key={creator.id} className="glass overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={resolveAvatar(creator.avatar_url, creator.id)}
                    />
                    <AvatarFallback>
                      {getRealName(creator.id).slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <Link
                      href={`/earn/creators/${creator.id}`}
                      className="font-bold hover:underline"
                    >
                      {getRealName(creator.id)}
                    </Link>

                    <p className="text-xs text-muted-foreground">
                      @{getRealUsername(creator.id, creator.username)}
                    </p>

                    <p className="text-xs font-medium mt-1 text-primary">
                      {getNicheName(creator.niches)}
                    </p>
                  </div>

                  <div className="w-full pt-4 border-t">
                    <TaskButton
                      targetId={creator.id}
                      type="follow"
                      isOnDailyTaskPage={true}
                      liveUrl={creator.profile_id === null ? "/earn/demo-feed" : creator.tiktok_profile_url}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-12 text-center">
            <h2 className="text-xl font-bold mb-2">No tasks available</h2>
            <p className="text-muted-foreground">Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DailyTasksPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <DailyTasksContent />
      </Suspense>
    </DashboardShell>
  );
}


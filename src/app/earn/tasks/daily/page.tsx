// src/app/earn/tasks/daily/page.tsx
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

function getNicheName(niches: any): string {
  if (!niches) return "Uncategorized";
  if (Array.isArray(niches)) return niches[0]?.name || "Uncategorized";
  return niches.name || "Uncategorized";
}

async function DailyTasksContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  const today = new Date().toISOString().split("T")[0];

  // 1. Get rank limit
  const { data: rankData } = await supabase
    .from("user_ranks")
    .select("rank_packages(name, daily_follow_tasks)")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  const followLimit = (rankData?.rank_packages as any)?.daily_follow_tasks || 5;
  const rankName = (rankData?.rank_packages as any)?.name || "Unranked";

  // 2. Get today's completed tasks
  const { data: completed } = await supabase
    .from("completed_tasks")
    .select("target_id")
    .eq("user_id", user.id)
    .eq("task_type", "follow")
    .eq("day_bucket", today);

  const completedIds = completed?.map(c => c.target_id) || [];

  // 3. Fetch creators not yet followed today, up to the daily limit
  const { data: creators } = await supabase
    .from("creators")
    .select("*, niches(name)")
    .limit(50); // Fetch a pool to choose from

  const tasks = (creators || [])
    .filter(c => !completedIds.includes(c.id))
    .slice(0, followLimit);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Follow Tasks</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You are on the <strong>{rankName}</strong> plan. You can follow up to {followLimit} creators today.
          </p>
        </div>
        <div className="glass px-4 py-3 rounded-xl flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Resets in</p>
            <p className="font-mono font-bold text-foreground"><CountdownTimer /></p>
          </div>
        </div>
      </div>

      <div>
        {tasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((creator) => (
              <Card key={creator.id} className="glass overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={resolveAvatar(creator.avatar_url, creator.id)} />
                    <AvatarFallback>{getRealName(creator.id).slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/earn/creators/${creator.id}`} className="font-bold hover:underline">
                      {getRealName(creator.id)}
                    </Link>
                    <p className="text-xs text-muted-foreground">@{getRealUsername(creator.id, creator.username)}</p>
                    <p className="text-xs font-medium mt-1 text-primary">{getNicheName(creator.niches)}</p>
                  </div>
                  <div className="w-full pt-4 border-t">
                    <TaskButton targetId={creator.id} type="follow" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-12 text-center">
            <h2 className="text-xl font-bold mb-2">All caught up! 🎉</h2>
            <p className="text-muted-foreground">You've completed your daily follow limit. Come back tomorrow!</p>
            <Link href="/earn/marketplace" className="inline-block mt-4 text-primary hover:underline font-medium">Browse the Marketplace for Likes</Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { CountdownTimer } from "@/components/earn/countdown-timer";

export default function DailyTasksPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <DailyTasksContent />
      </Suspense>
    </DashboardShell>
  );
}
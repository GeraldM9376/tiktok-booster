// src/app/earn/tasks/daily/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskButton } from "../../creators/[id]/task-button";
import { Loader2 } from "lucide-react";
import { resolveAvatar } from "@/lib/utils";

async function DailyTasksContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  const today = new Date().toISOString().split("T")[0];
  const { data: completed } = await supabase
    .from("completed_tasks")
    .select("target_id")
    .eq("user_id", user.id)
    .eq("day_bucket", today);

  const completedIds = completed?.map(c => c.target_id) || [];

  const { data: creators } = await supabase
    .from("creators")
    .select("*, niches(name)")
    .order("created_at", { ascending: false })
    .limit(10);

  const tasks = creators?.filter(c => !completedIds.includes(c.id)).slice(0, 5) || [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Tasks</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete these tasks to earn extra credits today. Resets at midnight.
        </p>
      </div>

      {tasks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((creator) => (
            <Card key={creator.id} className="glass overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={resolveAvatar(creator.avatar_url, creator.username)} />
                  <AvatarFallback>{creator.display_name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/earn/creators/${creator.id}`} className="font-bold hover:underline">{creator.display_name}</Link>
                  <p className="text-xs text-muted-foreground">@{creator.username}</p>
                  <p className="text-xs font-medium mt-1 text-primary">{(creator.niches as any)?.name}</p>
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
          <p className="text-muted-foreground">You've completed all your daily tasks. Come back tomorrow!</p>
          <Link href="/earn/marketplace" className="inline-block mt-4 text-primary hover:underline font-medium">Browse the Marketplace for more</Link>
        </div>
      )}
    </div>
  );
}

export default function DailyTasksPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <DailyTasksContent />
      </Suspense>
    </DashboardShell>
  );
}
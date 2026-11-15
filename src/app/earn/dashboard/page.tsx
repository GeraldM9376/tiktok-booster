// src/app/earn/dashboard/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getEarnerDashboardData } from "@/lib/services/earnings";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Wallet, CheckCircle2, TrendingUp, Star, Loader2 } from "lucide-react";
import { DashboardChart } from "./chart";
import Link from "next/link";

async function DashboardContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  const data = await getEarnerDashboardData(user.id);

  // Fetch today's specific statistics
  const today = new Date().toISOString().split("T")[0];
  const { data: todayStats } = await supabase
    .from("user_daily_statistics")
    .select("earnings, tasks_completed")
    .eq("user_id", user.id)
    .eq("day", today)
    .maybeSingle();

  const todayEarnings = todayStats?.earnings || 0;
  const todayTasks = todayStats?.tasks_completed || 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Here is a summary of your account activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Wallet className="h-4 w-4 text-primary" />}
          label="Total Earnings"
          value={data.wallet.lifetime_earned.toLocaleString()}
          sub="credits earned"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
          label="Today's Earnings"
          value={todayEarnings.toLocaleString()}
          sub="credits today"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-blue-400" />}
          label="Tasks Completed"
          value={(data.tasksTotal).toLocaleString()}
          sub={`${todayTasks} today`}
        />
        <StatCard
          icon={<Star className="h-4 w-4 text-yellow-400" />}
          label="Current Rank"
          value={data.rank ? data.rank.name : "Unranked"}
          sub={data.rank ? `${data.rank.stars} Stars` : "Upgrade to start"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Earnings (Last 7 Days)</h2>
          <DashboardChart data={data.dailyData} />
        </div>

        <div className="glass rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <h2 className="text-lg font-semibold mb-2">Start Earning</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Visit the Daily Tasks to follow creators (+10) or browse videos to like (+1).
          </p>
          <div className="flex gap-4">
            <Link href="/earn/tasks/daily" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Daily Tasks
            </Link>
            <Link href="/earn/marketplace" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export default function EarnDashboardPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <DashboardContent />
      </Suspense>
    </DashboardShell>
  );
}
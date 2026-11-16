// src/lib/services/earnings.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getEarnerDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("available_balance, lifetime_earned, referral_earned")
    .eq("user_id", userId)
    .single();

  const { data: rankData } = await supabase
    .from("user_ranks")
    .select("status, rank_packages(name, stars)")
    .eq("user_id", userId)
    .maybeSingle();

  // Get local date safely
  const { data: todayData, error: dateError } = await supabase.rpc("get_local_date");
  const today = !dateError && todayData 
    ? todayData 
    : new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Get today's stats from user_daily_statistics
  const { data: todayStats } = await supabase
    .from("user_daily_statistics")
    .select("earnings, tasks_completed, follows_completed, likes_completed")
    .eq("user_id", userId)
    .eq("day", today)
    .maybeSingle();

  const { count: tasksToday } = await supabase
    .from("completed_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("day_bucket", today);

  const { count: tasksTotal } = await supabase
    .from("completed_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Last 7 days chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const { data: txData } = await supabase
    .from("wallet_transactions")
    .select("amount, created_at")
    .eq("user_id", userId)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    dailyMap.set(d.toLocaleDateString("en-US", { weekday: "short" }), 0);
  }
  (txData ?? []).forEach((tx) => {
    if (tx.amount > 0) {
      const day = new Date(tx.created_at).toLocaleDateString("en-US", { weekday: "short" });
      if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) || 0) + tx.amount);
    }
  });

  const dailyData = Array.from(dailyMap.entries()).map(([name, earnings]) => ({ name, earnings }));

  return {
    wallet: wallet || { available_balance: 0, lifetime_earned: 0, referral_earned: 0 },
    rank: (rankData?.rank_packages as any) || null,
    tasksToday: tasksToday ?? 0,
    tasksTotal: tasksTotal ?? 0,
    todayEarnings: todayStats?.earnings || 0,
    dailyData,
  };
}

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { OverviewCharts, type OverviewData } from "./overview-charts";

export const dynamic = "force-dynamic";

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getRoleName(roles: unknown): string {
  if (Array.isArray(roles)) {
    return (roles[0] as { name?: string } | undefined)?.name || "";
  }

  return (roles as { name?: string } | null)?.name || "";
}

async function AdminOverviewContent() {
  const supabase = await createClient();

  const today = new Date();
  const endDate = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    )
  );

  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 89);

  const startISO = startDate.toISOString();

  // Fetch dashboard data in parallel.
  const [
    profilesCountResult,
    profilesResult,
    rolesResult,
    pendingTopupsResult,
    pendingWithdrawalsResult,
    topupsResult,
    withdrawalsResult,
    transactionsResult,
    referralsCountResult,
    referralsResult,
    ranksResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", startISO)
      .order("created_at", { ascending: true }),

    supabase
      .from("user_roles")
      .select("user_id, roles(name)"),

    supabase
      .from("topup_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("withdrawal_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("topup_requests")
      .select("status, requested_credits, created_at")
      .gte("created_at", startISO)
      .order("created_at", { ascending: true }),

    supabase
      .from("withdrawal_requests")
      .select("status, amount, created_at")
      .gte("created_at", startISO)
      .order("created_at", { ascending: true }),

    supabase
      .from("wallet_transactions")
      .select("id, type, amount, status, created_at, description")
      .gte("created_at", startISO)
      .order("created_at", { ascending: true }),

    supabase
      .from("referrals")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("referrals")
      .select("created_at")
      .gte("created_at", startISO)
      .order("created_at", { ascending: true }),

    supabase
      .from("user_ranks")
      .select("status, rank_packages(name)")
      .eq("status", "approved"),
  ]);

  const queryErrors = [
    profilesCountResult.error,
    profilesResult.error,
    rolesResult.error,
    pendingTopupsResult.error,
    pendingWithdrawalsResult.error,
    topupsResult.error,
    withdrawalsResult.error,
    transactionsResult.error,
    referralsCountResult.error,
    referralsResult.error,
    ranksResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    return (
      <div className="mx-auto max-w-6xl rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold text-destructive">
          Could not load dashboard statistics
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {queryErrors[0]?.message}
        </p>
      </div>
    );
  }

  const totalUsers = profilesCountResult.count || 0;
  const roles = rolesResult.data || [];
  const transactions = transactionsResult.data || [];
  const topups = topupsResult.data || [];
  const withdrawals = withdrawalsResult.data || [];
  const referrals = referralsResult.data || [];
  const ranks = ranksResult.data || [];

  // Calculate unique users in each role.
  const roleUsers = new Map<string, Set<string>>();
  const assignedUsers = new Set<string>();

  for (const row of roles) {
    const roleName = getRoleName(row.roles);

    if (!roleName) continue;

    assignedUsers.add(row.user_id);

    if (!roleUsers.has(roleName)) {
      roleUsers.set(roleName, new Set());
    }

    roleUsers.get(roleName)!.add(row.user_id);
  }

  const creators = roleUsers.get("creator")?.size || 0;
  const earners = roleUsers.get("earner")?.size || 0;
  const admins = roleUsers.get("admin")?.size || 0;
  const unassigned = Math.max(0, totalUsers - assignedUsers.size);

  const roleDistribution = [
    { name: "Creators", value: creators },
    { name: "Earners", value: earners },
    { name: "Admins", value: admins },
    { name: "Unassigned", value: unassigned },
  ].filter((item) => item.value > 0);

  // Retrieve wallet balances in pages to avoid the default row limit.
  let walletBalance = 0;
  let walletOffset = 0;
  const walletPageSize = 1000;

  while (true) {
    const { data: wallets, error: walletError } = await supabase
      .from("wallets")
      .select("available_balance")
      .range(walletOffset, walletOffset + walletPageSize - 1);

    if (walletError) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Could not load wallet balances: {walletError.message}
        </div>
      );
    }

    const page = wallets || [];

    walletBalance += page.reduce(
      (sum, wallet) => sum + Number(wallet.available_balance || 0),
      0
    );

    if (page.length < walletPageSize) break;

    walletOffset += walletPageSize;
  }

  // Create a complete daily activity timeline.
  const activityMap = new Map<
    string,
    { date: string; registrations: number; transactions: number; referrals: number }
  >();

  const paymentMap = new Map<
    string,
    { date: string; topups: number; withdrawals: number }
  >();

  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + i);

    const key = getDateKey(date);

    activityMap.set(key, {
      date: key,
      registrations: 0,
      transactions: 0,
      referrals: 0,
    });

    paymentMap.set(key, {
      date: key,
      topups: 0,
      withdrawals: 0,
    });
  }

  for (const profile of profilesResult.data || []) {
    const key = getDateKey(new Date(profile.created_at));
    const item = activityMap.get(key);
    if (item) item.registrations++;
  }

  for (const transaction of transactions) {
    const key = getDateKey(new Date(transaction.created_at));
    const item = activityMap.get(key);
    if (item) item.transactions++;
  }

  for (const referral of referrals) {
    const key = getDateKey(new Date(referral.created_at));
    const item = activityMap.get(key);
    if (item) item.referrals++;
  }

  for (const topup of topups) {
    const key = getDateKey(new Date(topup.created_at));
    const item = paymentMap.get(key);

    if (item) {
      item.topups += Number(topup.requested_credits || 0);
    }
  }

  for (const withdrawal of withdrawals) {
    const key = getDateKey(new Date(withdrawal.created_at));
    const item = paymentMap.get(key);

    if (item) {
      item.withdrawals += Number(withdrawal.amount || 0);
    }
  }

  // Build rank distribution.
  const rankCounts = new Map<string, number>();

  for (const rank of ranks) {
    const rankName = getRoleName(rank.rank_packages) ||
      (Array.isArray(rank.rank_packages)
        ? (rank.rank_packages[0] as { name?: string } | undefined)?.name
        : (rank.rank_packages as { name?: string } | null)?.name) ||
      "Unknown Rank";

    rankCounts.set(rankName, (rankCounts.get(rankName) || 0) + 1);
  }

  const rankDistribution = Array.from(rankCounts, ([name, value]) => ({
    name,
    value,
  }));

  // Build status distributions.
  function countStatuses(rows: { status: string }[]) {
    const counts = new Map<string, number>();

    for (const row of rows) {
      const status = row.status || "unknown";
      counts.set(status, (counts.get(status) || 0) + 1);
    }

    return Array.from(counts, ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }

  const transactionTypeCounts = new Map<string, number>();

  for (const transaction of transactions) {
    const type = transaction.type || "unknown";
    transactionTypeCounts.set(
      type,
      (transactionTypeCounts.get(type) || 0) + 1
    );
  }

  const transactionTypes = Array.from(
    transactionTypeCounts,
    ([name, value]) => ({
      name: name.replaceAll("_", " "),
      value,
    })
  );

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 10)
    .map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount || 0),
      status: transaction.status,
      createdAt: transaction.created_at,
      description: transaction.description,
    }));

  const dashboardData: OverviewData = {
    stats: {
      totalUsers,
      creators,
      earners,
      admins,
      walletBalance,
      pendingTopups: pendingTopupsResult.count || 0,
      pendingWithdrawals: pendingWithdrawalsResult.count || 0,
      totalReferrals: referralsCountResult.count || 0,
    },
    roleDistribution,
    rankDistribution,
    topupStatus: countStatuses(topups),
    withdrawalStatus: countStatuses(withdrawals),
    transactionTypes,
    activity: Array.from(activityMap.values()),
    paymentActivity: Array.from(paymentMap.values()),
    recentTransactions,
  };

  return <OverviewCharts data={dashboardData} />;
}

export default function AdminDashboardPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <AdminOverviewContent />
    </DashboardShell>
  );
}

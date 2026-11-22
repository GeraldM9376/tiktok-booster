
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type ProfileRelation = {
  email?: string | null;
  display_name?: string | null;
};

type ReferralRow = {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  created_at: string;
  referrer: ProfileRelation | ProfileRelation[] | null;
  referred: ProfileRelation | ProfileRelation[] | null;
};

function getProfile(
  value: ProfileRelation | ProfileRelation[] | null
): ProfileRelation | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function isQualified(status: string) {
  return ["approved", "qualified", "completed"].includes(
    status?.toLowerCase()
  );
}

async function ReferralsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data, error } = await supabase
    .from("referrals")
    .select(`
      id,
      referrer_id,
      referred_id,
      status,
      created_at,
      referrer:profiles!referrals_referrer_id_fkey(email, display_name),
      referred:profiles!referrals_referred_id_fkey(email, display_name)
    `)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold">Referral Tracking</h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
          Failed to load referrals: {error.message}
        </div>
      </div>
    );
  }

  const referrals = (data ?? []) as unknown as ReferralRow[];

  const referrerIds = [...new Set(referrals.map((ref) => ref.referrer_id))];

  const { data: rewards, error: rewardsError } =
    referrerIds.length > 0
      ? await supabase
          .from("referral_rewards")
          .select("referrer_id, amount")
          .in("referrer_id", referrerIds)
      : { data: [], error: null };

  const rewardTotals = new Map<string, number>();

  rewards?.forEach((reward) => {
    rewardTotals.set(
      reward.referrer_id,
      (rewardTotals.get(reward.referrer_id) ?? 0) +
        Number(reward.amount ?? 0)
    );
  });

  const grouped = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      total: number;
      qualified: number;
      pending: number;
      referrals: ReferralRow[];
    }
  >();

  referrals.forEach((referral) => {
    const profile = getProfile(referral.referrer);
    const key = referral.referrer_id;
    const status = referral.status?.toLowerCase();

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        name: profile?.display_name || "Anonymous",
        email: profile?.email || "Unknown email",
        total: 0,
        qualified: 0,
        pending: 0,
        referrals: [],
      });
    }

    const group = grouped.get(key)!;

    group.total += 1;

    if (isQualified(status)) {
      group.qualified += 1;
    } else if (status !== "rejected") {
      group.pending += 1;
    }

    group.referrals.push(referral);
  });

  const groups = [...grouped.values()].sort(
    (a, b) => b.total - a.total
  );

  const qualifiedCount = referrals.filter((ref) =>
    isQualified(ref.status)
  ).length;

  const pendingCount = referrals.filter(
    (ref) =>
      !isQualified(ref.status) &&
      ref.status?.toLowerCase() !== "rejected"
  ).length;

  const totalRewards = [...rewardTotals.values()].reduce(
    (sum, amount) => sum + amount,
    0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Referral Tracking
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitor referrals, approval status and referral rewards.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Referrals</p>
          <p className="mt-2 text-3xl font-bold">{referrals.length}</p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Approved Referrals</p>
          <p className="mt-2 text-3xl font-bold text-green-500">
            {qualifiedCount}
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Pending Referrals</p>
          <p className="mt-2 text-3xl font-bold text-yellow-500">
            {pendingCount}
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Recorded Rewards</p>
          <p className="mt-2 text-3xl font-bold">
            Ksh {totalRewards.toLocaleString("en-KE")}
          </p>
        </div>
      </div>

      {rewardsError && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-600">
          Referral records loaded, but reward totals could not be retrieved:
          {" "}{rewardsError.message}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Referrers ({groups.length})
        </h2>

        {groups.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center text-muted-foreground">
            No referral records found.
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="glass space-y-4 rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{group.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {group.email}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ID: {group.id}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {group.total} Total Referrals
                  </p>
                  <p className="text-sm text-green-500">
                    {group.qualified} Approved
                  </p>
                  <p className="text-sm text-yellow-500">
                    {group.pending} Pending
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rewards: Ksh{" "}
                    {(rewardTotals.get(group.id) ?? 0).toLocaleString("en-KE")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {group.referrals.map((referral) => {
                  const referredProfile = getProfile(referral.referred);
                  const approved = isQualified(referral.status);

                  return (
                    <div
                      key={referral.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary/50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {referredProfile?.display_name || "Unknown user"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {referredProfile?.email || "No email"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString("en-KE")}
                        </p>
                      </div>

                      <Badge
                        variant={
                          approved
                            ? "default"
                            : referral.status?.toLowerCase() === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {referral.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {referrals.length === 1000 && (
        <p className="text-sm text-muted-foreground">
          Showing the latest 1,000 referrals. Additional records may exist.
        </p>
      )}
    </div>
  );
}

export default function AdminReferralsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ReferralsContent />
      </Suspense>
    </DashboardShell>
  );
}

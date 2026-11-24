
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CopyButton } from "./copy-button";
import { Badge } from "@/components/ui/badge";
import { site } from "@/config/site";
import { Loader2 } from "lucide-react";

async function ReferralContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/creator/auth");

  const { data: existingCode, error: codeError } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .maybeSingle();

  if (codeError) {
    return (
      <div className="p-6 text-red-500">
        Could not load referral code: {codeError.message}
      </div>
    );
  }

  let finalCode = existingCode?.code;

  if (!finalCode) {
    const { data: generatedCode, error } = await supabase.rpc(
      "ensure_referral_code"
    );

    if (error || !generatedCode) {
      return (
        <div className="p-6 text-red-500">
          Error generating referral code:{" "}
          {error?.message ?? "No code returned."}
        </div>
      );
    }

    finalCode = generatedCode;
  }

  const referralLink = `${site.url}/creator/auth?ref=${finalCode}`;

  // Fetch referrals and rewards independently.
  const [referralsResult, rewardsResult] = await Promise.all([
    supabase
      .from("referrals")
      .select("id, referred_id, status, created_at")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("referral_rewards")
      .select("referred_id, amount")
      .eq("referrer_id", user.id),
  ]);

  if (referralsResult.error) {
    return (
      <div className="p-6 text-red-500">
        Could not load referrals: {referralsResult.error.message}
      </div>
    );
  }

  if (rewardsResult.error) {
    return (
      <div className="p-6 text-red-500">
        Could not load referral rewards: {rewardsResult.error.message}
      </div>
    );
  }

  const referrals = referralsResult.data ?? [];
  const rewards = rewardsResult.data ?? [];

  const rewardMap = new Map<string, number>();

  for (const reward of rewards) {
    rewardMap.set(
      reward.referred_id,
      (rewardMap.get(reward.referred_id) ?? 0) + (reward.amount ?? 0)
    );
  }

  const total = referrals.length;
  const pending = referrals.filter((r) => r.status === "pending").length;
  const qualified = referrals.filter((r) => r.status === "approved").length;

  const totalEarned = rewards.reduce(
    (sum, reward) => sum + (reward.amount ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Referral Program
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Invite friends to earn 20% of their rank purchase.
        </p>
      </div>

      <div className="glass rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">
            Your Referral Code
          </p>
          <p className="text-2xl font-mono font-bold tracking-widest">
            {finalCode}
          </p>
        </div>

        <div className="flex-1 w-full">
          <p className="text-sm text-muted-foreground mb-1">
            Your Invite Link
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
            />
            <CopyButton text={referralLink} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground uppercase mt-1">
            Total
          </p>
        </div>

        <div className="glass rounded-xl p-4 text-center border-orange-500/30">
          <p className="text-3xl font-bold text-orange-500">{pending}</p>
          <p className="text-xs text-muted-foreground uppercase mt-1">
            Pending
          </p>
        </div>

        <div className="glass rounded-xl p-4 text-center border-green-500/30">
          <p className="text-3xl font-bold text-green-500">{qualified}</p>
          <p className="text-xs text-muted-foreground uppercase mt-1">
            Qualified
          </p>
        </div>

        <div className="glass rounded-xl p-4 text-center border-primary/30">
          <p className="text-3xl font-bold text-primary">
            {totalEarned.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground uppercase mt-1">
            Credits Earned
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Referral History</h2>

        <div className="glass rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Referred User</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {referrals.map((ref) => {
                const earned = rewardMap.get(ref.referred_id) ?? 0;

                return (
                  <tr key={ref.id}>
                    <td className="px-4 py-3 font-mono text-xs">
                      {ref.referred_id.slice(0, 8)}...
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 font-semibold text-primary">
                      {earned > 0
                        ? `+${earned.toLocaleString()}`
                        : "â€”"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Badge
                        variant={
                          ref.status === "approved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {ref.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}

              {referrals.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No referrals yet. Share your link to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ReferralPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ReferralContent />
      </Suspense>
    </DashboardShell>
  );
}


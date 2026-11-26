
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Heart,
  Megaphone,
  Wallet,
  Loader2,
  UserPlus,
  TrendingUp,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";

async function CreatorDashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/creator/auth");

  const [
    profileResult,
    walletResult,
    videosResult,
    campaignsResult,
    creatorResult,
  ] = await Promise.all([
    supabase
      .from("creator_profiles")
      .select("tiktok_username")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("wallets")
      .select("topup_balance")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("creator_videos")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .is("deleted_at", null),

    supabase
      .from("campaigns")
      .select(
        "id, status, budget_credits, spent_credits, engagement_achieved"
      )
      .eq("creator_id", user.id),

    supabase
      .from("creators")
      .select("id, follower_count")
      .eq("profile_id", user.id)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  const wallet = walletResult.data;
  const campaigns = campaignsResult.data ?? [];
  const creator = creatorResult.data;

  const videoCount = videosResult.count ?? 0;

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "active"
  );

  const campaignCount = activeCampaigns.length;

  const totalSpent = campaigns.reduce(
    (sum, campaign) => sum + Number(campaign.spent_credits ?? 0),
    0
  );

  const remainingBudget = activeCampaigns.reduce(
    (sum, campaign) =>
      sum +
      Math.max(
        0,
        Number(campaign.budget_credits ?? 0) -
          Number(campaign.spent_credits ?? 0)
      ),
    0
  );

  const videoIdsResult = await supabase
    .from("creator_videos")
    .select("earner_video_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .not("earner_video_id", "is", null);

  const videoIds = (videoIdsResult.data ?? [])
    .map((video) => video.earner_video_id)
    .filter((id): id is string => Boolean(id));

  let totalLikes = 0;

  if (videoIds.length > 0) {
    const likesResult = await supabase
      .from("videos")
      .select("like_count")
      .in("id", videoIds)
      .is("deleted_at", null);

    totalLikes = (likesResult.data ?? []).reduce(
      (sum, video) => sum + Number(video.like_count ?? 0),
      0
    );
  }

  const totalFollows = Number(creator?.follower_count ?? 0);
  const topupCredits = Number(wallet?.topup_balance ?? 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Creator Studio
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your content, connect your profile, and grow your audience.
        </p>
      </div>

      {!profile?.tiktok_username && (
        <div className="glass rounded-xl p-4 border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold">
              Connect your TikTok Profile
            </p>
            <p className="text-sm text-muted-foreground">
              Link your account to start adding videos and launching campaigns.
            </p>
          </div>

          <Button asChild>
            <Link href="/creator/profile">Connect Now</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Wallet className="h-4 w-4 text-primary" />}
          label="Top-up Credits"
          value={topupCredits.toLocaleString()}
          sub="Available for campaigns"
        />

        <StatCard
          icon={<Video className="h-4 w-4 text-blue-400" />}
          label="My Videos"
          value={videoCount.toLocaleString()}
          sub="Uploaded to platform"
        />

        <StatCard
          icon={<Megaphone className="h-4 w-4 text-purple-400" />}
          label="Active Campaigns"
          value={campaignCount.toLocaleString()}
          sub="Running right now"
        />

        <StatCard
          icon={<Heart className="h-4 w-4 text-pink-400" />}
          label="Total Likes"
          value={totalLikes.toLocaleString()}
          sub="Simulated campaign likes"
        />

        <StatCard
          icon={<UserPlus className="h-4 w-4 text-green-400" />}
          label="Total Follows"
          value={totalFollows.toLocaleString()}
          sub="Simulated campaign follows"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Campaign Performance
            </h2>
          </div>

          <p className="text-xs text-muted-foreground mb-5">
            Campaign budget and simulated engagement activity.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">
                {totalSpent.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Credits</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Active Budget Remaining
              </p>
              <p className="text-2xl font-bold text-green-500">
                {remainingBudget.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Credits</p>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Engagement totals represent simulated Booster activity,
              not verified TikTok engagement.
            </p>
          </div>

          <Button className="mt-4" variant="outline" asChild>
            <Link href="/creator/videos">View Campaigns</Link>
          </Button>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Top-up Credits</h2>
          </div>

          <p className="text-3xl font-bold">
            {topupCredits.toLocaleString()}
          </p>

          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Purchased credits available for creator campaigns. These credits cannot be withdrawn.
          </p>

          <Button asChild>
            <Link href="/creator/topup">Top Up Credits</Link>
          </Button>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Profile</h2>

          <p className="text-sm text-muted-foreground mb-4">
            {profile?.tiktok_username
              ? `Connected as @${profile.tiktok_username}`
              : "No TikTok profile connected yet."}
          </p>

          <Button variant="outline" asChild>
            <Link href="/creator/profile">Manage Profile</Link>
          </Button>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">My Videos</h2>

          <p className="text-sm text-muted-foreground mb-4">
            Upload your videos and launch campaigns to get more likes.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/creator/videos">View Videos</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/creator/videos/new">Add Video</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorDashboardPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CreatorDashboardContent />
      </Suspense>
    </DashboardShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">
          {label}
        </p>
        {icon}
      </div>

      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}


import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, ExternalLink } from "lucide-react";
import { VideoList } from "./video-list";

function LoadingSkeleton({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-[46px] w-full min-w-[150px] items-center justify-center rounded-md bg-muted/70 px-2 py-1 animate-pulse"
      aria-label={message}
    >
      <span className="text-center text-[10px] leading-tight text-muted-foreground">
        {message}
      </span>
    </div>
  );
}

async function CreatorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/earn/auth");

  const { data: creator } = await supabase
    .from("creators")
    .select("*, niches(name)")
    .eq("id", id)
    .single();

  if (!creator) notFound();

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("creator_id", id)
    .is("deleted_at", null);

  const { data: todayData } = await supabase.rpc("get_local_date");

  const today =
    todayData ||
    new Date(
      new Date().getTime() + 3 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

  const { data: rankData } = await supabase
    .from("user_ranks")
    .select("rank_packages(name, daily_like_tasks)")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  const likeLimit =
    (rankData?.rank_packages as any)?.daily_like_tasks || 0;

  const rankName =
    (rankData?.rank_packages as any)?.name || "Unranked";

  const { count: likesDone } = await supabase
    .from("completed_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("task_type", "like")
    .eq("day_bucket", today);

  const likesRemaining = Math.max(
    0,
    likeLimit - (likesDone || 0)
  );

  const actualVideoCount = videos?.length || 0;

  const displayName = String(
    creator.display_name || creator.username || "Creator"
  );

  const username = String(creator.username || "");

  const avatarUrl = creator.avatar_url || undefined;

  const isDemo = creator.profile_id === null;

  const tiktokProfileUrl =
    creator.tiktok_profile_url ||
    creator.profile_url ||
    (username
      ? `https://www.tiktok.com/@${username.replace(/^@/, "")}`
      : null);

  const profileLinkUrl = isDemo
    ? "/earn/demo-feed"
    : tiktokProfileUrl;

  const followerCount = Number(creator.follower_count || 0);
  const engagementRate = Number(creator.engagement_rate || 0);

  const nicheName = Array.isArray(creator.niches)
    ? creator.niches[0]?.name || "Uncategorized"
    : (creator.niches as any)?.name || "Uncategorized";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Creator identity */}
      <div className="glass rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
        <Avatar className="h-32 w-32 border-4 border-background">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
          <AvatarFallback className="text-4xl">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-2">
            {displayName}
            {creator.verified && (
              <span className="text-primary text-xl">?</span>
            )}
          </h1>

          <p className="text-muted-foreground">
            @{username.replace(/^@/, "")}
          </p>

          {creator.bio && (
            <p className="mt-4 max-w-xl text-sm">
              {creator.bio}
            </p>
          )}

          {profileLinkUrl && (
            <a
              href={profileLinkUrl}
              target={isDemo ? undefined : "_blank"}
              rel={isDemo ? undefined : "noopener noreferrer"}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View TikTok Profile
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-6">
            <div className="min-w-[150px]">
              {isDemo ? (
                <p className="text-2xl font-bold">
                  {followerCount.toLocaleString()}
                </p>
              ) : (
                <LoadingSkeleton message="Retrieving actual followers from live TikTok…" />
              )}
              <p className="mt-1 text-xs text-muted-foreground uppercase">
                Followers
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold">
                {actualVideoCount}
              </p>
              <p className="text-xs text-muted-foreground uppercase">
                Videos
              </p>
            </div>

            <div className="min-w-[150px]">
              {isDemo ? (
                <p className="text-2xl font-bold">
                  {engagementRate}%
                </p>
              ) : (
                <LoadingSkeleton message="Getting live engagement figures…" />
              )}
              <p className="mt-1 text-xs text-muted-foreground uppercase">
                Engagement
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Badge variant="secondary">{nicheName}</Badge>
          </div>
        </div>
      </div>

      {/* Daily likes guide */}
      <div className="glass rounded-xl p-6 border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            Like Videos to Earn
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            You are on the <strong>{rankName}</strong> plan.
            You get {likeLimit} likes per day.
          </p>

          <p className="text-sm font-semibold mt-2">
            Likes remaining today:{" "}
            <span className="text-primary">{likesRemaining}</span>
            {" "}/ {likeLimit}
          </p>
        </div>
      </div>

      {/* Preserve existing earning task functionality */}
      <VideoList
        videos={videos || []}
        isOnDailyTaskPage={true}
        isDemo={isDemo}
      />
    </div>
  );
}

export default function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CreatorContent params={params} />
      </Suspense>
    </DashboardShell>
  );
}

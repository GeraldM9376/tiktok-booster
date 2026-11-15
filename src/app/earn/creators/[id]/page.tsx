// src/app/earn/creators/[id]/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart } from "lucide-react";
import { resolveAvatar, getRealName, getRealUsername } from "@/lib/utils";
import { TaskButton } from "./task-button";

function stripEmojis(str: string) {
  if (!str) return "";
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").trim();
}

async function CreatorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  const { data: creator } = await supabase
    .from("creators")
    .select("*, niches(name)")
    .eq("id", id)
    .single();
    
  if (!creator) notFound();

  // Fetch videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("creator_id", id);

  // Fetch like limits and today's usage
  const today = new Date().toISOString().split("T")[0];
  
  const { data: rankData } = await supabase
    .from("user_ranks")
    .select("rank_packages(name, daily_like_tasks)")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  const likeLimit = (rankData?.rank_packages as any)?.daily_like_tasks || 0;
  const rankName = (rankData?.rank_packages as any)?.name || "Unranked";

  const { count: likesDone } = await supabase
    .from("completed_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("task_type", "like")
    .eq("day_bucket", today);

  const likesRemaining = Math.max(0, likeLimit - (likesDone || 0));
  const actualVideoCount = videos ? videos.length : 0;
  const safeId = creator.id || id;
  const safeUsername = creator.username ? String(creator.username) : null;
  const name = getRealName(safeId);
  const username = getRealUsername(safeId, safeUsername);
  
  const nicheName = Array.isArray(creator.niches)
    ? creator.niches[0]?.name || "Uncategorized"
    : (creator.niches as any)?.name || "Uncategorized";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="glass rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
        <Avatar className="h-32 w-32 border-4 border-background">
          <AvatarImage src={resolveAvatar(creator.avatar_url, safeId)} />
          <AvatarFallback className="text-4xl">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-2">
            {name}
            {creator.verified && <span className="text-primary text-xl">✓</span>}
          </h1>
          <p className="text-muted-foreground">@{username}</p>
          <p className="mt-4 max-w-xl text-sm">{creator.bio}</p>
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-6">
            <div><p className="text-2xl font-bold">{creator.follower_count.toLocaleString()}</p><p className="text-xs text-muted-foreground uppercase">Followers</p></div>
            <div><p className="text-2xl font-bold">{creator.following_count.toLocaleString()}</p><p className="text-xs text-muted-foreground uppercase">Following</p></div>
            <div><p className="text-2xl font-bold">{actualVideoCount}</p><p className="text-xs text-muted-foreground uppercase">Videos</p></div>
            <div><p className="text-2xl font-bold">{creator.engagement_rate}%</p><p className="text-xs text-muted-foreground uppercase">Engagement</p></div>
          </div>
          <div className="mt-4">
            <Badge variant="secondary">{nicheName}</Badge>
          </div>
        </div>
      </div>

      {/* Likes Guide Banner */}
      <div className="glass rounded-xl p-6 border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            Like Videos to Earn
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            You are on the <strong>{rankName}</strong> plan. You get {likeLimit} likes per day.
          </p>
          <p className="text-sm font-semibold mt-2">
            Likes remaining today: <span className="text-primary">{likesRemaining}</span> / {likeLimit}
          </p>
        </div>
        {likesRemaining === 0 && (
          <div className="text-sm text-orange-500 font-medium bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/20">
            You've reached your daily like limit. Upgrade your rank for more!
          </div>
        )}
      </div>

      {/* Video List */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Videos <Badge variant="secondary">{actualVideoCount}</Badge>
        </h2>
        
        <div className="glass rounded-xl overflow-hidden">
          <div className="divide-y divide-border max-h-[800px] overflow-y-auto">
            {videos?.map((video) => {
              const cleanTitle = stripEmojis(video.title);
              const fakeUrl = `tiktok.com/@user/video/${video.id.slice(0, 8)}...`;
              
              return (
                <div key={video.id} className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{cleanTitle}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono mt-1">
                      {fakeUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground whitespace-nowrap">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{video.view_count.toLocaleString()}</p>
                      <p className="text-[10px] uppercase">Views</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{video.like_count.toLocaleString()}</p>
                      <p className="text-[10px] uppercase">Likes</p>
                    </div>
                    <div className="pl-4 border-l border-border">
                      <TaskButton targetId={video.id} type="like" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <CreatorContent params={params} />
      </Suspense>
    </DashboardShell>
  );
}
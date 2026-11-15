// src/app/earn/creators/[id]/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { resolveAvatar, getRealName, getRealUsername } from "@/lib/utils";
import { TaskButton } from "./task-button";

async function CreatorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: creator } = await supabase.from("creators").select("*, niches(name)").eq("id", id).single();
  if (!creator) notFound();

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("creator_id", id)
    .limit(30);

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
            <div><p className="text-2xl font-bold">{creator.video_count.toLocaleString()}</p><p className="text-xs text-muted-foreground uppercase">Videos</p></div>
            <div><p className="text-2xl font-bold">{creator.engagement_rate}%</p><p className="text-xs text-muted-foreground uppercase">Engagement</p></div>
          </div>
          <div className="mt-4">
            <Badge variant="secondary">{nicheName}</Badge>
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <TaskButton targetId={creator.id} type="follow" />
        </div>
      </div>

      {/* Videos List */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Videos <Badge variant="secondary">{videos?.length || 0}</Badge>
        </h2>
        
        <div className="glass rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {videos?.map((video, index) => (
              <div key={video.id} className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/50 transition-colors">
                
                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{video.title}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-1">
                    https://www.tiktok.com/@demo/video/{video.id.replace(/-/g, '')}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground whitespace-nowrap">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{video.view_count.toLocaleString()}</p>
                    <p className="text-[10px] uppercase">Views</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{video.like_count.toLocaleString()}</p>
                    <p className="text-[10px] uppercase">Likes</p>
                  </div>
                  
                  {/* Heart Button */}
                  <div className="pl-4 border-l border-border">
                    <TaskButton targetId={video.id} type="like" />
                  </div>
                </div>
              </div>
            ))}
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
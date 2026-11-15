// src/app/earn/creators/[id]/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskButton } from "./task-button";
import { Loader2 } from "lucide-react";

async function CreatorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: creator } = await supabase.from("creators").select("*, niches(name)").eq("id", id).single();
  if (!creator) notFound();

  const { data: videos } = await supabase.from("videos").select("*").eq("creator_id", id).limit(30);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="glass rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
        <Avatar className="h-32 w-32 border-4 border-background">
          <AvatarImage src={creator.avatar_url || undefined} />
          <AvatarFallback className="text-4xl">{creator.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-2">{creator.display_name}{creator.verified && <span className="text-primary text-xl">✓</span>}</h1>
          <p className="text-muted-foreground">@{creator.username}</p>
          <p className="mt-4 max-w-xl text-sm">{creator.bio}</p>
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-6">
            <div><p className="text-2xl font-bold">{creator.follower_count.toLocaleString()}</p><p className="text-xs text-muted-foreground uppercase tracking-wider">Followers</p></div>
            <div><p className="text-2xl font-bold">{creator.following_count.toLocaleString()}</p><p className="text-xs text-muted-foreground uppercase tracking-wider">Following</p></div>
            <div><p className="text-2xl font-bold">{creator.video_count.toLocaleString()}</p><p className="text-xs text-muted-foreground uppercase tracking-wider">Videos</p></div>
            <div><p className="text-2xl font-bold">{creator.engagement_rate}%</p><p className="text-xs text-muted-foreground uppercase tracking-wider">Engagement</p></div>
          </div>
        </div>
        <div className="mt-6 md:mt-0"><TaskButton targetId={creator.id} type="follow" /></div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Videos <Badge variant="secondary">{videos?.length || 0}</Badge></h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos?.map((video) => (
            <div key={video.id} className="glass rounded-xl overflow-hidden flex flex-col group">
              <div className="aspect-[9/16] bg-secondary relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={video.thumbnail_url || ""} alt={video.title} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-2 left-2 text-white font-medium text-sm line-clamp-2 pr-2">{video.title}</p>
              </div>
              <div className="p-3 flex items-center justify-between border-t border-border/50">
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{video.view_count.toLocaleString()} views</span>
                  <span>{video.like_count.toLocaleString()} likes</span>
                </div>
                <TaskButton targetId={video.id} type="like" />
              </div>
            </div>
          ))}
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
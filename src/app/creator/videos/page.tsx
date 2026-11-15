// src/app/creator/videos/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PromoteButton } from "./promote-button";
import { Loader2 } from "lucide-react";

async function VideosContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/creator/auth");

  const { data: videos } = await supabase
    .from("creator_videos")
    .select("*, niches(name), campaigns(status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Videos</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your uploaded content.</p>
        </div>
        <Button asChild>
          <Link href="/creator/videos/new">Add Video</Link>
        </Button>
      </div>

      {videos && videos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden glass">
              <div className="aspect-video bg-secondary relative">
                {video.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={video.thumbnail_url} alt={video.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No thumbnail</div>
                )}
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold truncate">{video.title}</h3>
                  <p className="text-xs text-muted-foreground">{(video.niches as any)?.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    Open in TikTok ↗
                  </a>
                  <PromoteButton videoId={video.id} hasCampaign={!!video.campaigns} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-xl border-dashed border-2 border-border">
          <p className="text-muted-foreground mb-4">You haven't added any videos yet.</p>
          <Button asChild><Link href="/creator/videos/new">Add Your First Video</Link></Button>
        </div>
      )}
    </div>
  );
}

export default function MyVideosPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense fallback={
        <div className="flex h-[50vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <VideosContent />
      </Suspense>
    </DashboardShell>
  );
}
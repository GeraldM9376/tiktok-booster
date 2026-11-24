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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/creator/auth");

  const { data: videos, error } = await supabase
    .from("creator_videos")
    .select(`
      *,
      niches(name),
      campaigns(
        id,
        status,
        budget_credits,
        spent_credits,
        allow_likes,
        allow_follows,
        engagement_achieved,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Creator videos error:", error);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Videos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your uploaded content.
          </p>
        </div>

        <Button asChild>
          <Link href="/creator/videos/new">Add Video</Link>
        </Button>
      </div>

      {videos && videos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const campaigns = video.campaigns ?? [];

            return (
              <Card key={video.id} className="overflow-hidden glass">
                <div className="relative aspect-video bg-secondary">
                  {video.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No thumbnail
                    </div>
                  )}
                </div>

                <CardContent className="space-y-4 p-4">
                  <div>
                    <h3 className="truncate font-semibold">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {video.niches?.name ?? "Uncategorized"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Open in TikTok â†—
                    </a>
                  </div>

                  <PromoteButton
                    videoId={video.id}
                    campaigns={campaigns}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border py-20 text-center glass">
          <p className="mb-4 text-muted-foreground">
            You haven't added any videos yet.
          </p>
          <Button asChild>
            <Link href="/creator/videos/new">Add Your First Video</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MyVideosPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <VideosContent />
      </Suspense>
    </DashboardShell>
  );
}

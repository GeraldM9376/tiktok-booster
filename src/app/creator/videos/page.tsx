import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PromoteButton } from "./promote-button";
import { DeleteVideoButton } from "./delete-video-button";
import { Loader2, Play, ExternalLink } from "lucide-react";

function getSafeUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isVideoLink(value: string | null): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();

    const isTikTok =
      (host === "tiktok.com" || host.endsWith(".tiktok.com")) &&
      (
        path.includes("/video/") ||
        path.startsWith("/t/") ||
        host.startsWith("vm.") ||
        host.startsWith("vt.")
      );

    const isVideoFile =
      /\.(mp4|webm|mov|m4v|m3u8)(?:$)/i.test(path);

    const isOtherVideoPlatform =
      host === "youtu.be" ||
      host.endsWith(".youtube.com") ||
      host.endsWith(".vimeo.com");

    return isTikTok || isVideoFile || isOtherVideoPlatform;
  } catch {
    return false;
  }
}

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
    .is("deleted_at", null)
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
            const thumbnailUrl = getSafeUrl(video.thumbnail_url);
            const videoUrl = getSafeUrl(video.video_url);
            const thumbnailIsVideo = isVideoLink(thumbnailUrl);

            const testUrl = thumbnailIsVideo
              ? thumbnailUrl
              : videoUrl;

            return (
              <Card key={video.id} className="overflow-hidden glass">
                <div className="relative aspect-video bg-secondary">
                  {thumbnailUrl && !thumbnailIsVideo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailUrl}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : thumbnailIsVideo ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                      <Play className="h-10 w-10 text-primary" />
                      <p className="font-semibold">TikTok Video Link</p>
                      <p className="text-xs text-muted-foreground">
                        A video URL was provided instead of an image.
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No thumbnail
                    </div>
                  )}
                </div>

                <CardContent className="space-y-4 p-4">
                  <div>
                    <h3 className="truncate font-semibold">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {video.niches?.name ?? "Uncategorized"}
                    </p>
                  </div>

                  {thumbnailIsVideo && thumbnailUrl && (
                    <p
                      className="truncate rounded-md bg-secondary p-2 text-xs text-muted-foreground"
                      title={thumbnailUrl}
                    >
                      {thumbnailUrl}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {videoUrl ? (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Open in TikTok
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Video link unavailable
                      </span>
                    )}

                    {testUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={testUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Test Video
                        </a>
                      </Button>
                    )}
                  </div>

                  <PromoteButton
                    videoId={video.id}
                    campaigns={campaigns}
                  />

                  <DeleteVideoButton
                    videoId={video.id}
                    videoTitle={video.title}
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

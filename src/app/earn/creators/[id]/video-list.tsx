
"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { TaskButton } from "./task-button";
import { Badge } from "@/components/ui/badge";

function stripEmojis(str: string) {
  if (!str) return "";

  return str
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ""
    )
    .trim();
}

function getValidVideoUrl(value: unknown): string | null {
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

export function VideoList({
  videos,
  isOnDailyTaskPage = false,
  isDemo = false,
}: {
  videos: any[];
  isOnDailyTaskPage?: boolean;
  isDemo?: boolean;
}) {
  const [localVideos, setLocalVideos] = useState(videos);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleLikeComplete = (videoId: string) => {
    setLocalVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? { ...v, like_count: (Number(v.like_count) || 0) + 1 }
          : v
      )
    );

    setLikedIds((prev) => new Set(prev).add(videoId));
  };

  const handleImageError = (videoId: string) => {
    setFailedImages((prev) => new Set(prev).add(videoId));
  };

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        Videos
        <Badge variant="secondary">{localVideos.length}</Badge>
      </h2>

      <div className="glass overflow-hidden rounded-xl">
        <div className="max-h-[800px] divide-y divide-border overflow-y-auto">
          {localVideos.map((video) => {
            const cleanTitle = stripEmojis(video.title || "");

            const videoUrl = getValidVideoUrl(video.video_url);
            const thumbnailUrl = getValidVideoUrl(video.thumbnail_url);

            const thumbnailIsVideo = isVideoLink(thumbnailUrl);

            const hasThumbnail =
              Boolean(thumbnailUrl) &&
              !thumbnailIsVideo &&
              !failedImages.has(video.id);

            const testUrl = thumbnailIsVideo
              ? thumbnailUrl
              : videoUrl;

            const isLiked = likedIds.has(video.id);

            return (
              <div
                key={video.id}
                className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-secondary sm:w-36">
                    {hasThumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailUrl!}
                        alt={cleanTitle || "Video thumbnail"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={() => handleImageError(video.id)}
                      />
                    ) : thumbnailIsVideo ? (
                      <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-muted-foreground">
                        <Play className="h-7 w-7 text-primary" />
                        <span className="text-[10px] font-semibold">
                          Video link provided
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
                        <Play className="h-7 w-7" />
                        <span className="text-[10px]">
                          No thumbnail
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {cleanTitle || "Untitled video"}
                    </p>

                    {thumbnailIsVideo && thumbnailUrl && (
                      <p
                        className="mt-1 truncate text-xs text-muted-foreground"
                        title={thumbnailUrl}
                      >
                        {thumbnailUrl}
                      </p>
                    )}

                    {videoUrl ? (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={videoUrl}
                        className="mt-1 inline-flex max-w-full items-center gap-1 truncate font-mono text-xs text-primary hover:underline"
                      >
                        <span className="truncate">{videoUrl}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Video link unavailable
                      </p>
                    )}

                    {testUrl && (
                      <a
                        href={testUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"
                      >
                        <Play className="h-3 w-3" />
                        Test Video
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-5 whitespace-nowrap text-sm text-muted-foreground">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {(Number(video.view_count) || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase">Views</p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-semibold transition-colors duration-300 ${
                        isLiked ? "text-red-500" : "text-foreground"
                      }`}
                    >
                      {(Number(video.like_count) || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase">Likes</p>
                  </div>

                  <div className="border-l border-border pl-4">
                    <TaskButton
                      targetId={video.id}
                      type="like"
                      isOnDailyTaskPage={isOnDailyTaskPage}
                      onLikeComplete={() => handleLikeComplete(video.id)}
                      liveUrl={
                        isDemo ? "/earn/demo-feed" : video.video_url
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

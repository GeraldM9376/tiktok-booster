// src/app/earn/creators/[id]/video-list.tsx
"use client";

import { TaskButton } from "./task-button";
import { Badge } from "@/components/ui/badge";

function stripEmojis(str: string) {
  if (!str) return "";
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").trim();
}

export function VideoList({ videos }: { videos: any[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        Videos <Badge variant="secondary">{videos.length}</Badge>
      </h2>
      
      <div className="glass rounded-xl overflow-hidden">
        <div className="divide-y divide-border max-h-[800px] overflow-y-auto">
          {videos.map((video) => {
            const cleanTitle = stripEmojis(video.title);
            const fakeUrl = `tiktok.com/@user/video/${video.id.slice(0, 8)}...`;
            
            return (
              <div key={video.id} className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{cleanTitle}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-1">{fakeUrl}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground whitespace-nowrap">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{video.view_count.toLocaleString()}</p>
                    <p className="text-[10px] uppercase">Views</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {video.like_count.toLocaleString()}
                    </p>
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
  );
}

"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { resolveAvatar } from "@/lib/utils";

function LoadingSkeleton() {
  return (
    <div
      className="h-5 w-16 animate-pulse rounded bg-muted"
      aria-label="Statistics unavailable"
    />
  );
}

export function MarketplaceGrid({
  creators,
  nicheMap,
}: {
  creators: any[];
  nicheMap: Map<number, string>;
}) {
  if (!creators.length) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

        <h3 className="font-semibold">
          No creators found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Try another creator name or TikTok username.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {creators.map((creator) => {
        const safeId = creator.id;
        const username = String(creator.username || "");
        const name = String(
          creator.display_name || username || "Creator"
        );

        const isDemo = creator.profile_id === null;

        const nicheName =
          nicheMap.get(creator.niche_id) || "Uncategorized";

        return (
          <Link
            key={safeId}
            href={`/earn/creators/${safeId}`}
            className="block"
          >
            <div className="glass flex h-full cursor-pointer flex-col rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-glow">
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage
                    src={resolveAvatar(creator.avatar_url, safeId)}
                    alt={name}
                  />

                  <AvatarFallback>
                    {name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 overflow-hidden">
                  <p className="flex items-center gap-1 truncate font-semibold">
                    {name}

                    {creator.verified && (
                      <span className="text-xs text-primary">
                        ✓
                      </span>
                    )}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    @{username}
                  </p>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-secondary/50 p-2">
                  <p className="text-muted-foreground">
                    Followers
                  </p>

                  {isDemo ? (
                    <p className="font-semibold">
                      {Number(
                        creator.follower_count || 0
                      ).toLocaleString()}
                    </p>
                  ) : (
                    <div className="mt-1">
                      <LoadingSkeleton />
                    </div>
                  )}
                </div>

                <div className="rounded bg-secondary/50 p-2">
                  <p className="text-muted-foreground">
                    Engagement
                  </p>

                  {isDemo ? (
                    <p className="font-semibold">
                      {Number(creator.engagement_rate || 0)}%
                    </p>
                  ) : (
                    <div className="mt-1">
                      <LoadingSkeleton />
                    </div>
                  )}
                </div>
              </div>

              <Badge
                variant="secondary"
                className="mt-3 w-max text-[10px]"
              >
                {nicheName}
              </Badge>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

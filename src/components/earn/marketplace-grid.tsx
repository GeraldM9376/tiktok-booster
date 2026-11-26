"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRealName, getRealUsername, resolveAvatar } from "@/lib/utils";

export function MarketplaceGrid({
  creators,
  nicheMap,
}: {
  creators: any[];
  nicheMap: Map<number, string>;
}) {
  const [search, setSearch] = useState("");

  const filteredCreators = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return creators;

    return creators.filter((creator) => {
      const safeId = creator.id || "unknown";
      const name = getRealName(safeId);
      const username = getRealUsername(safeId, creator.username);

      return (
        name.toLowerCase().includes(query) ||
        username.toLowerCase().includes(query)
      );
    });
  }, [creators, search]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search creators by name or username..."
          aria-label="Search creators"
          className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filteredCreators.length > 0 ? (
        <>
          {search && (
            <p className="text-sm text-muted-foreground">
              Found {filteredCreators.length} creator{filteredCreators.length === 1 ? "" : "s"}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredCreators.map((creator) => {
              const safeId = creator.id || "unknown";
              const name = getRealName(safeId);
              const username = getRealUsername(safeId, creator.username);
              const nicheName =
                nicheMap.get(creator.niche_id) || "Uncategorized";

              return (
                <Link key={safeId} href={`/earn/creators/${safeId}`}>
                  <div className="glass flex h-full cursor-pointer flex-col rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-glow">
                    <div className="mb-4 flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage
                          src={resolveAvatar(creator.avatar_url, safeId)}
                        />
                        <AvatarFallback>
                          {name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="overflow-hidden">
                        <p className="flex items-center gap-1 truncate font-semibold">
                          {name}
                          {creator.verified && (
                            <span className="text-xs text-primary">✓</span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{username}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded bg-secondary/50 p-2">
                        <p className="text-muted-foreground">Followers</p>
                        <p className="font-semibold">
                          {Number(creator.follower_count || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded bg-secondary/50 p-2">
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-semibold">
                          {creator.engagement_rate || 0}%
                        </p>
                      </div>
                    </div>

                    <Badge variant="secondary" className="mt-3 w-max text-[10px]">
                      {nicheName}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="font-semibold">No creators found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another name or username.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}

// src/components/earn/marketplace-grid.tsx
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRealName, getRealUsername, resolveAvatar } from "@/lib/utils";

export function MarketplaceGrid({ 
  creators, 
  nicheMap, 
  startIndex 
}: { 
  creators: any[], 
  nicheMap: Map<number, string>, 
  startIndex: number 
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {creators.map((creator, index) => {
        const safeId = creator.id || "unknown";
        const name = getRealName(safeId);
        const username = getRealUsername(safeId, creator.username);
        const nicheName = nicheMap.get(creator.niche_id) || "Uncategorized";
        
        // Calculate the global number (1 to 10,000)
        const globalNumber = startIndex + index;

        return (
          <Link key={safeId} href={`/earn/creators/${safeId}`}>
            <div className="glass rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-glow cursor-pointer flex flex-col h-full relative">
              
              {/* Rank Number Badge */}
              <div className="absolute top-3 right-3 bg-secondary/80 text-xs font-bold px-2 py-1 rounded-md text-muted-foreground">
                #{globalNumber}
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={resolveAvatar(creator.avatar_url, safeId)} />
                  <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="font-semibold truncate flex items-center gap-1">
                    {name}
                    {creator.verified && <span className="text-primary text-xs">✓</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">@{username}</p>
                </div>
              </div>
              
              <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
                <div className="bg-secondary/50 rounded p-2">
                  <p className="text-muted-foreground">Followers</p>
                  <p className="font-semibold">{Number(creator.follower_count || 0).toLocaleString()}</p>
                </div>
                <div className="bg-secondary/50 rounded p-2">
                  <p className="text-muted-foreground">Engagement</p>
                  <p className="font-semibold">{creator.engagement_rate || 0}%</p>
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
  );
}
// src/components/earn/marketplace-grid.tsx
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveAvatar, getRealName, getRealUsername } from "@/lib/utils";

function getNicheName(niches: any): string {
  if (!niches) return "Uncategorized";
  if (Array.isArray(niches)) return niches[0]?.name || "Uncategorized";
  return niches.name || "Uncategorized";
}

export function MarketplaceGrid({ creators, count, currentPage, totalPages, searchQuery, nicheId }: any) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {creators.map((creator: any) => {
          // Safely extract the seed and fallback strings
          const seed = creator.id ? String(creator.id) : "unknown";
          const fallback = creator.username ? String(creator.username) : "user";
          
          // Generate names safely
          const realName = getRealName(seed);
          const realUser = getRealUsername(seed, fallback);
          
          return (
            <Link key={seed} href={`/earn/creators/${seed}`}>
              <div className="glass rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-glow cursor-pointer h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={resolveAvatar(creator.avatar_url, seed)} />
                    <AvatarFallback>{realName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="font-semibold truncate flex items-center gap-1">
                      {realName}
                      {creator.verified && <span className="text-primary text-xs">✓</span>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">@{realUser}</p>
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
                  {getNicheName(creator.niches)}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({count?.toLocaleString()} creators)
          </p>
          <div className="flex gap-2">
            <Link href={`/earn/marketplace?page=${Math.max(1, currentPage - 1)}`}>
              <Button variant="outline" size="sm" disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            </Link>
            <Link href={`/earn/marketplace?page=${Math.min(totalPages, currentPage + 1)}`}>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
// src/components/earn/marketplace-grid.tsx
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveAvatar, getRealName, getRealUsername } from "@/lib/utils";

// Helper to safely extract niche name
function getNicheName(niches: any): string {
  if (!niches) return "Uncategorized";
  if (Array.isArray(niches)) return niches[0]?.name || "Uncategorized";
  return niches.name || "Uncategorized";
}

export function MarketplaceGrid({ 
  creators, 
  count, 
  currentPage, 
  totalPages,
  searchQuery,
  nicheId
}: { 
  creators: any[], 
  count: number | null, 
  currentPage: number, 
  totalPages: number,
  searchQuery: string,
  nicheId: string
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {creators.map((creator) => (
          <Link key={creator.id} href={`/earn/creators/${creator.id}`}>
            <div className="glass rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-glow cursor-pointer h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={resolveAvatar(creator.avatar_url, creator.username)} />
                  <AvatarFallback>{getRealName(creator.id).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="font-semibold truncate flex items-center gap-1">
                    {getRealName(creator.id)}
                    {creator.verified && <span className="text-primary text-xs">✓</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">@{getRealUsername(creator.id, creator.username)}</p>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
                <div className="bg-secondary/50 rounded p-2">
                  <p className="text-muted-foreground">Followers</p>
                  <p className="font-semibold">{creator.follower_count.toLocaleString()}</p>
                </div>
                <div className="bg-secondary/50 rounded p-2">
                  <p className="text-muted-foreground">Engagement</p>
                  <p className="font-semibold">{creator.engagement_rate}%</p>
                </div>
              </div>
              <Badge variant="secondary" className="mt-3 w-max text-[10px]">
                {getNicheName(creator.niches)}
              </Badge>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages.toLocaleString()} ({count?.toLocaleString()} creators)
          </p>
          <div className="flex gap-2">
            <Link 
              href={`/earn/marketplace?page=${Math.max(1, currentPage - 1)}${searchQuery ? `&q=${searchQuery}` : ""}${nicheId ? `&niche=${nicheId}` : ""}`} 
              className={currentPage <= 1 ? "pointer-events-none" : ""}
            >
              <Button variant="outline" size="sm" disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            </Link>
            <Link 
              href={`/earn/marketplace?page=${Math.min(totalPages, currentPage + 1)}${searchQuery ? `&q=${searchQuery}` : ""}${nicheId ? `&niche=${nicheId}` : ""}`} 
              className={currentPage >= totalPages ? "pointer-events-none" : ""}
            >
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
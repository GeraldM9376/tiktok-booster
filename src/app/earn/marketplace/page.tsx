// src/app/earn/marketplace/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { resolveAvatar, getRealName, getRealUsername } from "@/lib/utils";

const PAGE_SIZE = 24;

async function MarketplaceContent({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; niche?: string }> }) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const searchQuery = params.q || "";
  const nicheId = params.niche || "";

  const supabase = await createClient();

  let query = supabase.from("creators").select("*, niches(name)", { count: "exact" });
  if (searchQuery) query = query.ilike("username", `%${searchQuery}%`);
  if (nicheId) query = query.eq("niche_id", nicheId);

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: creators, count } = await query.order("follower_count", { ascending: false }).range(from, to);
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;
  const { data: niches } = await supabase.from("niches").select("*").order("name");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">Discover creators, follow them, and earn credits.</p>
        </div>
        <form className="flex w-full max-w-sm items-center space-x-2" action="/earn/marketplace">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" name="q" placeholder="Search creators..." defaultValue={searchQuery} className="pl-8 w-full" />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/earn/marketplace"><Badge variant={!nicheId ? "default" : "outline"} className="cursor-pointer">All Niches</Badge></Link>
        {niches?.map((niche) => (
          <Link key={niche.id} href={`/earn/marketplace?niche=${niche.id}`}>
            <Badge variant={nicheId === niche.id.toString() ? "default" : "outline"} className="cursor-pointer">{niche.name}</Badge>
          </Link>
        ))}
      </div>

      {creators && creators.length > 0 ? (
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
                  <div className="bg-secondary/50 rounded p-2"><p className="text-muted-foreground">Followers</p><p className="font-semibold">{creator.follower_count.toLocaleString()}</p></div>
                  <div className="bg-secondary/50 rounded p-2"><p className="text-muted-foreground">Engagement</p><p className="font-semibold">{creator.engagement_rate}%</p></div>
                </div>
                <Badge variant="secondary" className="mt-3 w-max text-[10px]">{(creator.niches as any)?.name || "Uncategorized"}</Badge>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-xl"><p className="text-muted-foreground">No creators found matching your search.</p></div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages.toLocaleString()} ({count?.toLocaleString()} creators)</p>
          <div className="flex gap-2">
            <Link href={`/earn/marketplace?page=${Math.max(1, currentPage - 1)}${searchQuery ? `&q=${searchQuery}` : ""}${nicheId ? `&niche=${nicheId}` : ""}`} className={currentPage <= 1 ? "pointer-events-none" : ""}>
              <Button variant="outline" size="sm" disabled={currentPage <= 1}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
            </Link>
            <Link href={`/earn/marketplace?page=${Math.min(totalPages, currentPage + 1)}${searchQuery ? `&q=${searchQuery}` : ""}${nicheId ? `&niche=${nicheId}` : ""}`} className={currentPage >= totalPages ? "pointer-events-none" : ""}>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; niche?: string }> }) {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <MarketplaceContent searchParams={searchParams} />
      </Suspense>
    </DashboardShell>
  );
}
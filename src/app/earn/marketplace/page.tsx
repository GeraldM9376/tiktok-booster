// src/app/earn/marketplace/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { Loader2 } from "lucide-react";
import { MarketplaceFilters } from "@/components/earn/marketplace-filters";
import { MarketplaceGrid } from "@/components/earn/marketplace-grid";

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

  const { data: creators, count, error } = await query.order("follower_count", { ascending: false }).range(from, to);
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading creators: {error.message}</div>;
  }

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;
  const { data: niches } = await supabase.from("niches").select("*").order("name");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <MarketplaceFilters niches={niches || []} searchQuery={searchQuery} nicheId={nicheId} />
      
      {creators && creators.length > 0 ? (
        <MarketplaceGrid 
          creators={creators} 
          count={count} 
          currentPage={currentPage} 
          totalPages={totalPages} 
          searchQuery={searchQuery} 
          nicheId={nicheId} 
        />
      ) : (
        <div className="text-center py-20 glass rounded-xl">
          <p className="text-muted-foreground">No creators found matching your search.</p>
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
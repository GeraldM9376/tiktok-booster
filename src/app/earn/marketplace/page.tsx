// src/app/earn/marketplace/page.tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceFilters } from "@/components/earn/marketplace-filters";
import { MarketplaceGrid } from "@/components/earn/marketplace-grid";

const PAGE_SIZE = 24;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; niche?: string }>;
}) {
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

  const { data: creators, count, error } = await query
    .order("follower_count", { ascending: false })
    .range(from, to);

  // If there's a database error, throw it so the error.tsx boundary catches it
  if (error) {
    throw new Error(`Database Error: ${error.message}`);
  }

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;
  const { data: niches } = await supabase.from("niches").select("*").order("name");

  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <div className="mx-auto max-w-6xl space-y-6">
        <MarketplaceFilters
          niches={niches || []}
          searchQuery={searchQuery}
          nicheId={nicheId}
        />

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
          <div className="glass rounded-xl py-20 text-center">
            <p className="text-muted-foreground">No creators found matching your search.</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
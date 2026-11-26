
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceGrid } from "@/components/earn/marketplace-grid";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 60;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;

  const requestedPage = Number(params.page) || 1;
  const currentPage = Math.max(1, requestedPage);

  const searchTerm = (params.q || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .slice(0, 60);

  const supabase = await createClient();

  let creatorsQuery = supabase
    .from("creators")
    .select(
      "id, username, display_name, avatar_url, follower_count, engagement_rate, verified, niche_id, profile_id",
      { count: "exact" }
    );

  if (searchTerm) {
    creatorsQuery = creatorsQuery.or(
      `display_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
    );
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: creators,
    count,
    error: creatorsError,
  } = await creatorsQuery
    .order("engagement_rate", { ascending: false })
    .range(from, to);

  if (creatorsError) {
    console.error("Marketplace creators error:", creatorsError);
  }

  const { data: niches } = await supabase
    .from("niches")
    .select("id, name");

  const nicheMap = new Map(
    niches?.map((niche) => [niche.id, niche.name]) || []
  );

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  const paginationQuery = searchTerm
    ? `&q=${encodeURIComponent(searchTerm)}`
    : "";

  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Marketplace
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Discover creators across all niches. Click to view their profile
            and earn credits.
          </p>
        </div>

        <form
          action="/earn/marketplace"
          method="GET"
          className="flex max-w-xl gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Search by creator name or TikTok username..."
              aria-label="Search creators"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            {searchTerm && (
              <Link
                href="/earn/marketplace"
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Link>
            )}
          </div>

          <Button type="submit" className="h-11">
            Search
          </Button>
        </form>

        {searchTerm && (
          <p className="text-sm text-muted-foreground">
            {count || 0} creator{count === 1 ? "" : "s"} found for
            {" "}
            <strong className="text-foreground">{searchTerm}</strong>
          </p>
        )}

        <MarketplaceGrid
          creators={creators || []}
          nicheMap={nicheMap}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 pt-6">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex gap-2">
              <Link
                href={`/earn/marketplace?page=${Math.max(
                  1,
                  currentPage - 1
                )}${paginationQuery}`}
              >
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
              </Link>

              <Link
                href={`/earn/marketplace?page=${Math.min(
                  totalPages,
                  currentPage + 1
                )}${paginationQuery}`}
              >
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

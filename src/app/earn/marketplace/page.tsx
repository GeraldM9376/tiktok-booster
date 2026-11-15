// src/app/earn/marketplace/page.tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceGrid } from "@/components/earn/marketplace-grid";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 60;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  
  const supabase = await createClient();
  
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Sort by engagement_rate to ensure a completely random mix of all niches
  const { data: creators, count } = await supabase
    .from("creators")
    .select("id, username, avatar_url, follower_count, engagement_rate, verified, niche_id", { count: "exact" })
    .order("engagement_rate", { ascending: false }) 
    .order("id", { ascending: true })
    .range(from, to);

  const { data: niches } = await supabase.from("niches").select("id, name");
  const nicheMap = new Map(niches?.map(n => [n.id, n.name]) || []);

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover creators across all niches. Click to view their profile and earn credits.
          </p>
        </div>

        <MarketplaceGrid creators={creators || []} nicheMap={nicheMap} />

        {totalPages > 1 && (
          <div className="flex items-center justify-end pt-6 border-t border-border/50">
            <div className="flex gap-2">
              <Link href={`/earn/marketplace?page=${Math.max(1, currentPage - 1)}`}>
                <Button variant="outline" disabled={currentPage <= 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
              </Link>
              <Link href={`/earn/marketplace?page=${Math.min(totalPages, currentPage + 1)}`}>
                <Button variant="outline" disabled={currentPage >= totalPages}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
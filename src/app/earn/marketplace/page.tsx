// src/app/earn/marketplace/page.tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceGrid } from "@/components/earn/marketplace-grid";

export default async function MarketplacePage() {
  const supabase = await createClient();
  
  // Fetch raw data only
  const { data: creators, error } = await supabase
    .from("creators")
    .select("id, username, avatar_url, follower_count, engagement_rate, verified, niche_id")
    .limit(24);

  const { data: niches } = await supabase.from("niches").select("id, name");

  if (error) {
    return (
      <DashboardShell type="earner" authPath="/earn/auth">
        <div className="p-10 text-red-500 font-bold">Database Error: {error.message}</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">Discover creators, follow them, and earn credits.</p>
        </div>

        <MarketplaceGrid creators={creators || []} niches={niches || []} />
      </div>
    </DashboardShell>
  );
}
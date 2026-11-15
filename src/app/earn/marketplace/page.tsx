// src/app/earn/marketplace/page.tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRealName, getRealUsername, resolveAvatar } from "@/lib/utils";

export default async function MarketplacePage() {
  const supabase = await createClient();
  
  // Fetch 24 creators
  const { data: creators, error } = await supabase
    .from("creators")
    .select("*, niches(name)")
    .limit(24);

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creators?.map((creator) => {
            // 1. Ensure we always have a string ID
            const safeId = creator.id || "unknown";
            
            // 2. Generate the names safely
            const name = getRealName(safeId);
            const username = getRealUsername(safeId, creator.username);
            
            // 3. Get the niche name safely
            const nicheName = Array.isArray(creator.niches) 
              ? creator.niches[0]?.name 
              : (creator.niches as any)?.name || "Uncategorized";

            return (
              <div key={safeId} className="glass rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-glow cursor-pointer flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
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
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
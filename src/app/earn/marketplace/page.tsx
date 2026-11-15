// src/app/earn/marketplace/page.tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function MarketplacePage() {
  const supabase = await createClient();
  
  // Fetch just 10 creators
  const { data: creators, error } = await supabase
    .from("creators")
    .select("*")
    .limit(10);

  if (error) {
    return (
      <DashboardShell type="earner" authPath="/earn/auth">
        <div className="p-10 text-red-500">Database Error: {error.message}</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Marketplace Test</h1>
        <p>Found {creators?.length || 0} creators.</p>
        
        <div className="grid grid-cols-2 gap-4">
          {creators?.map((creator) => (
            <div key={creator.id} className="p-4 border rounded-xl flex gap-3 items-center">
              <Avatar>
                <AvatarImage src={creator.avatar_url || ""} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{creator.username}</p>
                <p className="text-xs text-muted-foreground">{creator.display_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
// src/components/earn/marketplace-filters.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function MarketplaceFilters({ niches, searchQuery, nicheId }: any) {
  return (
    <>
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
        <Link href="/earn/marketplace">
          <Badge variant={!nicheId ? "default" : "outline"} className="cursor-pointer">All Niches</Badge>
        </Link>
        {niches?.map((niche: any) => (
          <Link key={niche.id} href={`/earn/marketplace?niche=${niche.id}`}>
            <Badge variant={nicheId === niche.id.toString() ? "default" : "outline"} className="cursor-pointer">
              {niche.name}
            </Badge>
          </Link>
        ))}
      </div>
    </>
  );
}
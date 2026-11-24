import { DashboardShell } from "@/components/layout/dashboard-shell";
import DemoFeedClient from "../demo-feed-client";

export default async function DemoSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { section } = await params;
  const query = await searchParams;
  const allowed = ["home", "search", "explore", "friends", "videos", "messages", "create", "profile", "wallet"];
  const safeSection = allowed.includes(section) ? section : "home";

  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <DemoFeedClient section={safeSection} category={query.category || "All"} />
    </DashboardShell>
  );
}

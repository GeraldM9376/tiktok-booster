import { DashboardShell } from "@/components/layout/dashboard-shell";
import DemoFeedClient from "../demo-feed-client";

export default async function DemoSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <DemoFeedClient initialSection={section} />
    </DashboardShell>
  );
}

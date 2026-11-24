import { DashboardShell } from "@/components/layout/dashboard-shell";
import DemoFeedClient from "./demo-feed-client";

export default function DemoFeedPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <DemoFeedClient section="home" />
    </DashboardShell>
  );
}

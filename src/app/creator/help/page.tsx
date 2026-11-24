
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CreatorHelpClient } from "./creator-help-client";

export default function CreatorHelpPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <CreatorHelpClient />
    </DashboardShell>
  );
}

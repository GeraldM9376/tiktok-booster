import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function CreatorSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      {children}
    </DashboardShell>
  );
}

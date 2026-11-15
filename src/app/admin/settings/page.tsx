import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AdminSettingsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Global platform configuration.</p>
        <div className="glass rounded-xl p-8 text-center text-muted-foreground">
          Platform settings panel.
        </div>
      </div>
    </DashboardShell>
  );
}
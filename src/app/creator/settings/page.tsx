import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function CreatorSettingsPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences.</p>
        <div className="glass rounded-xl p-8 text-center text-muted-foreground">
          Settings panel coming soon.
        </div>
      </div>
    </DashboardShell>
  );
}
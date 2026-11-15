import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function EarnHelpPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Help Centre</h1>
        <p className="text-muted-foreground">Frequently asked questions and support.</p>
        <div className="glass rounded-xl p-8 text-center text-muted-foreground">
          Need help? Contact support@tiktok-booster.example
        </div>
      </div>
    </DashboardShell>
  );
}
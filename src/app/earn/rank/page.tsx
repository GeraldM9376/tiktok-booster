import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Loader2 } from "lucide-react";

function RankContent() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Account Rank</h1>
      <p className="text-muted-foreground">Upgrade your rank to unlock more daily tasks and higher earnings.</p>
      <div className="glass rounded-xl p-8 text-center text-muted-foreground">
        Rank upgrade system coming soon.
      </div>
    </div>
  );
}

export default function RankPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={
        <div className="flex h-[50vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <RankContent />
      </Suspense>
    </DashboardShell>
  );
}
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AdminAuditPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">System events and administrator actions.</p>
        <div className="glass rounded-xl p-8 text-center text-muted-foreground">
          Audit logging is active. Recent events will appear here.
        </div>
      </div>
    </DashboardShell>
  );
}
// src/app/admin/dashboard/page.tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AdminDashboardPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage users, approvals, and platform settings.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Users", value: "1" },
            { label: "Total Creators", value: "0" },
            { label: "Pending Top-Ups", value: "0" },
            { label: "Pending Withdrawals", value: "0" },
          ].map((card) => (
            <div key={card.label} className="glass rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
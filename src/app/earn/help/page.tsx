// src/app/earn/help/page.tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Mail } from "lucide-react";

export default function EarnHelpPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Help Centre</h1>
        <div className="glass rounded-xl p-6 space-y-4">
          <p className="text-sm">Need help? Contact our support team.</p>
          <div className="flex items-center gap-2 text-primary">
            <Mail className="h-5 w-5" />
            <a href="mailto:support@tiktok-booster.example" className="underline">
              support@tiktok-booster.example
            </a>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
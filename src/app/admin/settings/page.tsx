// src/app/admin/settings/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SettingsForm } from "./settings-form";

async function SettingsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/auth");

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", ["payment_paybill", "payment_account"]);

  const paybill = settings?.find(s => s.key === "payment_paybill")?.value || "400200";
  const account = settings?.find(s => s.key === "payment_account")?.value || "TIKTOKBOOSTER";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage global platform configuration and payment details.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <SettingsForm initialPaybill={paybill} initialAccount={account} />
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <SettingsContent />
      </Suspense>
    </DashboardShell>
  );
}
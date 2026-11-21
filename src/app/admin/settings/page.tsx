
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

function settingToString(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

async function SettingsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data: settings, error } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", ["payment_paybill", "payment_account"]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          System Settings
        </h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
          Failed to load payment settings: {error.message}
        </div>
      </div>
    );
  }

  const paybillValue = settings?.find(
    (setting) => setting.key === "payment_paybill"
  )?.value;

  const accountValue = settings?.find(
    (setting) => setting.key === "payment_account"
  )?.value;

  const paybill = settingToString(paybillValue, "400200");
  const account = settingToString(accountValue, "TIKTOKBOOSTER");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          System Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage global platform configuration and payment details.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <SettingsForm
          initialPaybill={paybill}
          initialAccount={account}
        />
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </DashboardShell>
  );
}

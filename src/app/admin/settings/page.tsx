
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

function settingToString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value;

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
    .in("key", [
      "payment_paybill",
      "payment_account",
      "support_email",
      "support_whatsapp",
    ]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          System Settings
        </h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
          Failed to load settings: {error.message}
        </div>
      </div>
    );
  }

  const getValue = (key: string, fallback: string) =>
    settingToString(
      settings?.find((setting) => setting.key === key)?.value,
      fallback
    );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          System Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage payment instructions and Creator support contacts.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <SettingsForm
          initialPaybill={getValue("payment_paybill", "400200")}
          initialAccount={getValue("payment_account", "TIKTOKBOOSTER")}
          initialSupportEmail={getValue("support_email", "")}
          initialSupportWhatsApp={getValue("support_whatsapp", "")}
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

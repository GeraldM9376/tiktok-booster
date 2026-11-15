// src/app/earn/settings/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PaymentSettingsForm } from "./payment-settings-form";

async function SettingsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  const { data: profile } = await supabase
    .from("earner_profiles")
    .select("payment_details")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Set up your payment details to receive withdrawals.
        </p>
      </div>
      <div className="glass rounded-xl p-6">
        <PaymentSettingsForm initialDetails={profile?.payment_details} />
      </div>
    </div>
  );
}

export default function EarnSettingsPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <SettingsContent />
      </Suspense>
    </DashboardShell>
  );
}
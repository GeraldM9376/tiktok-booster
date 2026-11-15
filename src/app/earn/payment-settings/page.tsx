// src/app/earn/payment-settings/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PaymentSettingsForm } from "./payment-settings-form";

async function PaymentSettingsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  const { data: profile } = await supabase
    .from("earner_profiles")
    .select("payment_details")
    .eq("user_id", user.id)
    .maybeSingle();

  const paymentDetails = profile?.payment_details || null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/earn/earnings">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Withdrawals
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your payment details are sent to the admin with each withdrawal request.
        </p>
      </div>
      <div className="glass rounded-xl p-6">
        <PaymentSettingsForm initialDetails={paymentDetails} />
      </div>
    </div>
  );
}

export default function EarnPaymentSettingsPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <PaymentSettingsContent />
      </Suspense>
    </DashboardShell>
  );
}
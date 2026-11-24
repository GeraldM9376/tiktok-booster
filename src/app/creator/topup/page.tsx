
// src/app/creator/topup/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopupForm } from "./topup-form";
import { Loader2 } from "lucide-react";

async function TopupContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/creator/auth");

  const [packagesResult, settingsResult, historyResult] =
    await Promise.all([
      supabase
        .from("topup_packages")
        .select("*")
        .eq("active", true)
        .order("sort_order"),

      supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["payment_paybill", "payment_account"]),

      supabase
        .from("topup_requests")
        .select(`
          id,
          package_id,
          requested_credits,
          transaction_reference,
          status,
          admin_comment,
          created_at,
          topup_packages (
            name,
            price_label
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const settings = Object.fromEntries(
    (settingsResult.data || []).map((item) => [
      item.key,
      typeof item.value === "string"
        ? item.value
        : String(item.value ?? ""),
    ])
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Top Up Credits
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Purchase additional credits to run more campaigns and grow
          your audience.
        </p>
      </div>

      <TopupForm
        packages={packagesResult.data || []}
        paymentSettings={{
          paybill: settings.payment_paybill || "",
          account: settings.payment_account || "",
        }}
        history={historyResult.data || []}
      />
    </div>
  );
}

export default function CreatorTopupPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <TopupContent />
      </Suspense>
    </DashboardShell>
  );
}

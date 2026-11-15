// src/app/creator/topup/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopupForm } from "./topup-form";
import { Loader2 } from "lucide-react";

async function TopupContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/creator/auth");

  const { data: packages } = await supabase
    .from("topup_packages")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Up Credits</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Purchase additional credits to run more campaigns and grow your audience.
        </p>
      </div>
      <TopupForm packages={packages || []} />
    </div>
  );
}

export default function CreatorTopupPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <TopupContent />
      </Suspense>
    </DashboardShell>
  );
}
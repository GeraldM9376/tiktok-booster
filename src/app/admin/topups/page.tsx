
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import TopupsClient from "./topups-client";

export const dynamic = "force-dynamic";

async function TopupsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data: requests, error } = await supabase
    .from("topup_requests")
    .select(`
      id,
      user_id,
      requested_credits,
      transaction_reference,
      status,
      created_at,
      profiles:profiles!topup_requests_user_id_fkey (
        id,
        email
      ),
      topup_packages (
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-3xl font-bold">Top-Up Management</h1>

        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-500">
          Failed to load top-up requests: {error.message}
        </div>
      </div>
    );
  }

  return (
    <TopupsClient requests={(requests ?? []) as any[]} />
  );
}

export default function AdminTopupsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <TopupsContent />
      </Suspense>
    </DashboardShell>
  );
}

// src/app/admin/referrals/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

async function ReferralsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/auth");

  const { data: referrals } = await supabase
    .from("referrals")
    .select(`
      id, status, created_at,
      referrer:referrer_id (email, display_name),
      referred:referred_id (email, display_name)
    `);

  // Group by referrer
  const grouped = referrals?.reduce((acc: any, ref) => {
    const key = (ref.referrer as any)?.email || "Unknown";
    if (!acc[key]) acc[key] = { referrer: ref.referrer, total: 0, referred: [] };
    acc[key].total += 1;
    acc[key].referred.push(ref);
    return acc;
  }, {}) || {};

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-3xl font-bold">Referral Tracking</h1>
      <div className="grid gap-4">
        {Object.values(grouped).map((group: any) => (
          <div key={group.referrer.email} className="glass rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-bold">{group.referrer.display_name || "Anonymous"}</p>
                <p className="text-sm text-muted-foreground">{group.referrer.email}</p>
              </div>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold">
                {group.total} Referrals
              </span>
            </div>
            <div className="space-y-2">
              {group.referred.map((ref: any) => (
                <div key={ref.id} className="flex justify-between text-sm p-2 bg-secondary/50 rounded">
                  <span>{(ref.referred as any)?.email}</span>
                  <span className="text-muted-foreground">{ref.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminReferralsPage() {
  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <ReferralsContent />
      </Suspense>
    </DashboardShell>
  );
}
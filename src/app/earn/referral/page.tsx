// src/app/earn/referral/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CopyButton } from "./copy-button";
import { Badge } from "@/components/ui/badge";
import { site } from "@/config/site";
import { Loader2 } from "lucide-react";

async function ReferralContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/earn/auth");

  const { data: existingCode } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .maybeSingle();

  let finalCode = existingCode?.code;

  if (!finalCode) {
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: insertedCode, error } = await supabase
      .from("referral_codes")
      .insert({ user_id: user.id, code: generatedCode })
      .select("code")
      .single();
    if (error) {
      return <div className="p-8 text-red-500">Error generating code: {error.message}</div>;
    }
    finalCode = insertedCode.code;
  }

  const referralLink = `${site.url}/earn/auth?ref=${finalCode}`;

  const { data: referrals } = await supabase
    .from("referrals")
    .select("*, profiles:referred_id(email, display_name)")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  const qualified = referrals?.filter(r => r.status === "approved").length || 0;
  const pending = referrals?.filter(r => r.status === "pending").length || 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Invite friends to earn credits and unlock withdrawal limits.
        </p>
      </div>

      <div className="glass rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">Your Referral Code</p>
          <p className="text-2xl font-mono font-bold tracking-widest">{finalCode}</p>
        </div>
        <div className="flex-1 w-full">
          <p className="text-sm text-muted-foreground mb-1">Your Invite Link</p>
          <div className="flex gap-2">
            <input type="text" readOnly value={referralLink} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground" />
            <CopyButton text={referralLink} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{referrals?.length || 0}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Referred</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border-orange-500/30">
          <p className="text-3xl font-bold text-orange-500">{pending}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Pending</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border-green-500/30">
          <p className="text-3xl font-bold text-green-500">{qualified}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Qualified</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Referral History</h2>
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {referrals?.map((ref) => (
                <tr key={ref.id}>
                  <td className="px-4 py-3">{(ref.profiles as any)?.display_name || (ref.profiles as any)?.email || "Anonymous"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={ref.status === "approved" ? "default" : "secondary"}>{ref.status}</Badge>
                  </td>
                </tr>
              ))}
              {(!referrals || referrals.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No referrals yet. Share your link to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ReferralPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <ReferralContent />
      </Suspense>
    </DashboardShell>
  );
}
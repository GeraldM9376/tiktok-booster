// src/app/creator/dashboard/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Video, Eye, Heart, Megaphone, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

async function CreatorDashboardContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/creator/auth");

  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("*, niches(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("available_balance")
    .eq("user_id", user.id)
    .single();

  const { count: videoCount } = await supabase
    .from("creator_videos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: campaignCount } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", user.id)
    .eq("status", "active");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Creator Studio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your content, connect your profile, and grow your audience.
        </p>
      </div>

      {!profile?.tiktok_username && (
        <div className="glass rounded-xl p-4 border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Connect your TikTok Profile</p>
            <p className="text-sm text-muted-foreground">Link your account to start adding videos and launching campaigns.</p>
          </div>
          <Button asChild>
            <Link href="/creator/profile">Connect Now</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Wallet className="h-4 w-4 text-primary" />} label="Available Credits" value={(wallet?.available_balance || 0).toLocaleString()} sub="Ready to spend" />
        <StatCard icon={<Video className="h-4 w-4 text-blue-400" />} label="My Videos" value={(videoCount || 0).toString()} sub="Uploaded to platform" />
        <StatCard icon={<Megaphone className="h-4 w-4 text-purple-400" />} label="Active Campaigns" value={(campaignCount || 0).toString()} sub="Running right now" />
        <StatCard icon={<Heart className="h-4 w-4 text-pink-400" />} label="Total Likes" value="0" sub="From campaigns" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Profile</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {profile?.tiktok_username ? `Connected as @${profile.tiktok_username}` : "No TikTok profile connected yet."}
          </p>
          <Button variant="outline" asChild><Link href="/creator/profile">Manage Profile</Link></Button>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">My Videos</h2>
          <p className="text-sm text-muted-foreground mb-4">Upload your videos and launch campaigns to get more likes.</p>
          <div className="flex gap-2">
            <Button asChild><Link href="/creator/videos">View Videos</Link></Button>
            <Button variant="outline" asChild><Link href="/creator/videos/new">Add Video</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorDashboardPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <CreatorDashboardContent />
      </Suspense>
    </DashboardShell>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
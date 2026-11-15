// src/app/creator/profile/page.tsx
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { Loader2 } from "lucide-react";

async function ProfileContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/creator/auth");

  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: niches } = await supabase.from("niches").select("*").order("name");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Link your TikTok account and choose your primary niche.
        </p>
      </div>
      <div className="glass rounded-xl p-6">
        <ProfileForm initialData={profile} niches={niches || []} />
      </div>
    </div>
  );
}

export default function CreatorProfilePage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <ProfileContent />
      </Suspense>
    </DashboardShell>
  );
}
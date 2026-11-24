
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddVideoForm } from "./add-video-form";
import { Loader2 } from "lucide-react";

async function NewVideoContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/creator/auth");

  const [
    { data: niches },
    { data: creatorProfile },
  ] = await Promise.all([
    supabase.from("niches").select("*").order("name"),
    supabase
      .from("creators")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Add New Video
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a video to your creator profile and launch a campaign.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <AddVideoForm
          niches={niches || []}
          hasCreatorProfile={!!creatorProfile}
        />
      </div>
    </div>
  );
}

export default function AddVideoPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <NewVideoContent />
      </Suspense>
    </DashboardShell>
  );
}

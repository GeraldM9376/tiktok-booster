import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PromoteButton } from "../videos/promote-button";

export const dynamic = "force-dynamic";

async function CampaignsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/creator/auth");

  const { data: videos, error } = await supabase
    .from("creator_videos")
    .select(`
      id,
      title,
      thumbnail_url,
      campaigns(
        id,
        status,
        budget_credits,
        spent_credits,
        allow_likes,
        allow_follows,
        engagement_achieved,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Creator campaigns error:", error);
  }

  const campaignCount = (videos ?? []).reduce(
    (total, video) => total + (video.campaigns?.length ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Campaigns</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create and manage engagement campaigns for your videos.
        </p>
      </div>

      <div className="rounded-xl border p-5 glass">
        <p className="text-sm text-muted-foreground">Total campaigns</p>
        <p className="mt-1 text-3xl font-bold">{campaignCount}</p>
      </div>

      {!videos?.length ? (
        <div className="rounded-xl border border-dashed py-16 text-center glass">
          <p className="text-muted-foreground">
            Add a video before creating your first campaign.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {videos.map((video) => (
            <section
              key={video.id}
              className="rounded-xl border p-5 glass space-y-4"
            >
              <div className="flex items-center gap-4">
                {video.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-secondary text-xs text-muted-foreground">
                    No thumbnail
                  </div>
                )}

                <div>
                  <h2 className="font-semibold">{video.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {video.campaigns?.length ?? 0} campaigns
                  </p>
                </div>
              </div>

              <PromoteButton
                videoId={video.id}
                campaigns={video.campaigns ?? []}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatorCampaignsPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense
        fallback={
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CampaignsContent />
      </Suspense>
    </DashboardShell>
  );
}

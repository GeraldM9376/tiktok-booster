import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, Video, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CreatorAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/creator/auth");

  const [{ data: videos }, { data: campaigns }] = await Promise.all([
    supabase
      .from("creator_videos")
      .select("id, views, likes")
      .eq("user_id", user.id),
    supabase
      .from("campaigns")
      .select("id, engagement_achieved, spent_credits")
      .eq("creator_id", user.id),
  ]);

  const totalVideos = videos?.length ?? 0;
  const totalViews = (videos ?? []).reduce((sum, video) => sum + Number(video.views ?? 0), 0);
  const totalLikes = (videos ?? []).reduce((sum, video) => sum + Number(video.likes ?? 0), 0);
  const totalEngagement = (campaigns ?? []).reduce(
    (sum, campaign) => sum + Number(campaign.engagement_achieved ?? 0), 0
  );
  const totalSpent = (campaigns ?? []).reduce(
    (sum, campaign) => sum + Number(campaign.spent_credits ?? 0), 0
  );

  const stats = [
    { title: "Videos", value: totalVideos, icon: Video },
    { title: "Total Views", value: totalViews, icon: Eye },
    { title: "Total Likes", value: totalLikes, icon: Heart },
    { title: "Campaign Tasks", value: totalEngagement, icon: Target },
  ];

  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Analytics</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An overview of your video performance and campaign activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stat.value.toLocaleString("en-KE")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Total campaigns</p>
              <p className="text-2xl font-bold">{campaigns?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credits spent</p>
              <p className="text-2xl font-bold">{totalSpent.toLocaleString("en-KE")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

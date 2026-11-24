
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, Loader2, Pause, Play, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Campaign = {
  id: string;
  status: "active" | "paused" | "completed" | "cancelled";
  budget_credits: number;
  spent_credits: number;
  allow_likes: boolean;
  allow_follows: boolean;
  engagement_achieved: number;
  created_at: string;
};

interface PromoteButtonProps {
  videoId: string;
  campaigns: Campaign[];
}

export function PromoteButton({
  videoId,
  campaigns,
}: PromoteButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState("300");
  const [allowLikes, setAllowLikes] = useState(true);
  const [allowFollows, setAllowFollows] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingCampaign, setProcessingCampaign] =
    useState<string | null>(null);

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "active"
  );

  async function createCampaign() {
    if (isLoading) return;

    const amount = Number(budget);

    if (!Number.isSafeInteger(amount) || amount < 1) {
      toast.error("Enter a valid campaign budget.");
      return;
    }

    if (!allowLikes && !allowFollows) {
      toast.error("Select Likes, Follows, or both.");
      return;
    }

    if (!allowLikes && allowFollows && amount < 10) {
      toast.error("A Follow-only campaign needs at least 10 credits.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Please log in to create a campaign.");
        return;
      }

      const { error } = await supabase.rpc(
        "create_creator_campaign",
        {
          p_video_id: videoId,
          p_budget_credits: amount,
          p_allow_likes: allowLikes,
          p_allow_follows: allowFollows,
        }
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Campaign created successfully!");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Campaign creation error:", error);
      toast.error("Unable to create campaign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function manageCampaign(
    campaignId: string,
    action: "pause" | "resume" | "cancel"
  ) {
    if (processingCampaign) return;

    if (
      action === "cancel" &&
      !window.confirm(
        "Cancel this campaign? Any unspent credits will remain in your wallet."
      )
    ) {
      return;
    }

    setProcessingCampaign(campaignId);

    try {
      const supabase = createClient();

      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Please log in again.");
        return;
      }

      const { error } = await supabase.rpc(
        "manage_creator_campaign",
        {
          p_campaign_id: campaignId,
          p_action: action,
        }
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        action === "pause"
          ? "Campaign paused."
          : action === "resume"
            ? "Campaign resumed."
            : "Campaign cancelled."
      );

      router.refresh();
    } catch (error) {
      console.error("Campaign management error:", error);
      toast.error("Unable to update campaign.");
    } finally {
      setProcessingCampaign(null);
    }
  }

  function campaignLabel(status: Campaign["status"]) {
    switch (status) {
      case "active":
        return "Active";
      case "paused":
        return "Paused";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          Campaigns ({campaigns.length})
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Zap className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Video Campaign</DialogTitle>
              <DialogDescription>
                Set your maximum shared budget and choose which
                engagement tasks Earners can complete.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-3">
              <div className="space-y-2">
                <Label htmlFor={`budget-${videoId}`}>
                  Maximum Campaign Budget (credits)
                </Label>

                <Input
                  id={`budget-${videoId}`}
                  type="number"
                  min={allowFollows && !allowLikes ? 10 : 1}
                  step="1"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  disabled={isLoading}
                />

                <p className="text-xs text-muted-foreground">
                  This is a spending limit, not an upfront payment.
                  You are charged only when an eligible task is completed.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Allowed Engagement Tasks</Label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                  <input
                    type="checkbox"
                    checked={allowLikes}
                    onChange={(event) =>
                      setAllowLikes(event.target.checked)
                    }
                    disabled={isLoading}
                    className="h-4 w-4 accent-primary"
                  />

                  <div className="flex-1">
                    <p className="font-medium">Likes</p>
                    <p className="text-xs text-muted-foreground">
                      Creator pays 1 credit per completed Like.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                  <input
                    type="checkbox"
                    checked={allowFollows}
                    onChange={(event) =>
                      setAllowFollows(event.target.checked)
                    }
                    disabled={isLoading}
                    className="h-4 w-4 accent-primary"
                  />

                  <div className="flex-1">
                    <p className="font-medium">Follows</p>
                    <p className="text-xs text-muted-foreground">
                      Creator pays 10 credits per completed Follow.
                    </p>
                  </div>
                </label>
              </div>

              <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                <p className="font-semibold">Shared campaign budget</p>
                <p className="mt-1 text-muted-foreground">
                  Likes and Follows consume the same budget. No credits
                  are deducted when the campaign is created.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                onClick={createCampaign}
                disabled={
                  isLoading ||
                  (!allowLikes && !allowFollows) ||
                  !budget.trim()
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          No campaigns yet. Create one to make this video available
          for eligible engagement tasks.
        </p>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const spent = Number(campaign.spent_credits);
            const total = Number(campaign.budget_credits);
            const remaining = Math.max(0, total - spent);
            const progress =
              total > 0
                ? Math.min(100, (spent / total) * 100)
                : 0;

            const busy = processingCampaign === campaign.id;

            return (
              <Card key={campaign.id} className="space-y-3 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">
                    {campaignLabel(campaign.status)}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {campaign.engagement_achieved} tasks completed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-semibold">
                      {total.toLocaleString("en-KE")} credits
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Spent</p>
                    <p className="font-semibold">
                      {spent.toLocaleString("en-KE")} credits
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p className="font-semibold">
                      {remaining.toLocaleString("en-KE")} credits
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Tasks allowed</p>
                    <p className="font-semibold">
                      {[
                        campaign.allow_likes ? "Likes" : null,
                        campaign.allow_follows ? "Follows" : null,
                      ]
                        .filter(Boolean)
                        .join(" + ")}
                    </p>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {campaign.status === "active" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy || !!processingCampaign}
                      onClick={() =>
                        manageCampaign(campaign.id, "pause")
                      }
                    >
                      {busy ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Pause className="mr-1 h-3 w-3" />
                      )}
                      Pause
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy || !!processingCampaign}
                      onClick={() =>
                        manageCampaign(campaign.id, "cancel")
                      }
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                )}

                {campaign.status === "paused" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={busy || !!processingCampaign}
                      onClick={() =>
                        manageCampaign(campaign.id, "resume")
                      }
                    >
                      {busy ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="mr-1 h-3 w-3" />
                      )}
                      Resume
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy || !!processingCampaign}
                      onClick={() =>
                        manageCampaign(campaign.id, "cancel")
                      }
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {activeCampaigns.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {activeCampaigns.length} active campaign
          {activeCampaigns.length === 1 ? "" : "s"}.
          Creator credits are charged only for completed tasks.
        </p>
      )}
    </div>
  );
}

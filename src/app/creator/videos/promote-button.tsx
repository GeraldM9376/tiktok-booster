// src/app/creator/videos/promote-button.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function PromoteButton({ videoId, hasCampaign }: { videoId: string; hasCampaign: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handlePromote() {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get video's niche and creator's wallet
    const { data: video } = await supabase.from("creator_videos").select("niche_id").eq("id", videoId).single();
    const { data: wallet } = await supabase.from("wallets").select("available_balance").eq("user_id", user.id).single();

    const cost = hasCampaign ? 100 : 300; // 300 for first campaign, 100 for subsequent

    if (!wallet || wallet.available_balance < cost) {
      toast.error(`Insufficient credits. You need ${cost} credits to run a campaign.`);
      setIsLoading(false);
      setOpen(false);
      return;
    }

    // 2. Deduct credits (using the atomic DB function)
    const { error: deductError } = await supabase.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: cost,
      p_type: "campaign",
      p_description: `Campaign activation for video ${videoId}`,
      p_metadata: { video_id: videoId },
    });

    if (deductError) {
      toast.error(deductError.message);
      setIsLoading(false);
      return;
    }

    // 3. Create the campaign
    const { error: campaignError } = await supabase.from("campaigns").insert({
      creator_id: user.id,
      video_id: videoId,
      niche_id: video?.niche_id,
      status: "active",
      budget_credits: cost,
    });

    if (campaignError) {
      toast.error(campaignError.message);
      // Note: In a real app, we'd need to refund the credits if this fails (rollback).
      // The `deduct_credits` function handles the atomic wallet update, but we might want a bigger transaction.
    } else {
      toast.success("Campaign launched successfully! Your video is now in the marketplace.");
      window.location.reload();
    }

    setIsLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={hasCampaign ? "secondary" : "default"} className="w-full">
          <Zap className="mr-2 h-4 w-4" />
          {hasCampaign ? "Boost Again (100)" : "Promote (300)"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Launch Campaign</DialogTitle>
          <DialogDescription>
            {hasCampaign 
              ? "Spend 100 credits to boost this video to more creators in the marketplace."
              : "Spend 300 credits to launch your first campaign and make this video visible to earners."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handlePromote} disabled={isLoading}>
            {isLoading ? "Processing..." : `Confirm (${hasCampaign ? 100 : 300} credits)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
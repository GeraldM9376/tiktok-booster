
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";
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

interface PromoteButtonProps {
  videoId: string;
  hasCampaign: boolean;
}

export function PromoteButton({
  videoId,
  hasCampaign,
}: PromoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handlePromote() {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Please log in to promote your video.");
        return;
      }

      const { error } = await supabase.rpc("promote_video", {
        p_video_id: videoId,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Campaign launched successfully!");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Campaign promotion error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const cost = hasCampaign ? 100 : 300;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={hasCampaign ? "secondary" : "default"}
          className="w-full"
        >
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
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button onClick={handlePromote} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm (${cost} credits)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

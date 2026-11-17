
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function RankActions({
  requestId,
}: {
  requestId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAction(action: "approved" | "rejected") {
    if (isLoading) return;

    const confirmed = window.confirm(
      action === "approved"
        ? "Approve this rank purchase and process its referral commission?"
        : "Reject this rank purchase?"
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Not authenticated.");
        return;
      }

      const { error } = await supabase.rpc("process_rank_request", {
        p_user_id: requestId,
        p_action: action,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        action === "approved"
          ? "Rank approved and referral commission processed."
          : "Rank request rejected."
      );

      router.refresh();
    } catch (error) {
      console.error("Rank processing error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        className="text-red-500 hover:text-red-600"
        onClick={() => handleAction("rejected")}
        disabled={isLoading}
        title="Reject rank"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>

      <Button
        size="sm"
        className="text-green-500 hover:text-green-600"
        onClick={() => handleAction("approved")}
        disabled={isLoading}
        title="Approve rank"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

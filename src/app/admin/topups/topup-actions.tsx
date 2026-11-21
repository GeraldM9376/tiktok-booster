
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type TopupActionsProps = {
  requestId: string;
  credits: number;
};

export function TopupActions({
  requestId,
  credits,
}: TopupActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAction(action: "approve" | "reject") {
    const message =
      action === "approve"
        ? `Approve this top-up and add ${credits} credits to the user's wallet?`
        : "Reject this top-up request?";

    if (!window.confirm(message)) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc("process_topup_request", {
        p_request_id: requestId,
        p_action: action,
        p_admin_comment: null,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        action === "approve"
          ? `${credits} credits successfully added.`
          : "Top-up request rejected."
      );

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
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
        onClick={() => handleAction("reject")}
        disabled={isLoading}
        title="Reject top-up"
      >
        <X className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        className="text-green-500 hover:text-green-600"
        onClick={() => handleAction("approve")}
        disabled={isLoading}
        title="Approve top-up"
      >
        <Check className="h-4 w-4" />
      </Button>
    </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface WithdrawalActionsProps {
  requestId: string;
  amount: number;
}

export function WithdrawalActions({
  requestId,
  amount,
}: WithdrawalActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const router = useRouter();

  async function handleAction(action: "approved" | "rejected") {
    if (isLoading) return;

    const confirmed = window.confirm(
      action === "approved"
        ? `Approve withdrawal of ${amount.toLocaleString()} credits?`
        : "Reject this withdrawal request?"
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

      const { error } = await supabase.rpc(
        "process_withdrawal_request",
        {
          p_request_id: requestId,
          p_action: action,
          p_admin_comment: adminComment.trim() || null,
        }
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        action === "approved"
          ? "Withdrawal approved and credits deducted."
          : "Withdrawal request rejected."
      );

      router.refresh();
    } catch (error) {
      console.error("Withdrawal processing error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={adminComment}
        onChange={(e) => setAdminComment(e.target.value)}
        placeholder="Optional admin comment..."
        rows={2}
        disabled={isLoading}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleAction("approved")}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Approve
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleAction("rejected")}
          disabled={isLoading}
          className="flex-1"
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}

// src/app/admin/topups/topup-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function TopupActions({ requestId, userId, credits }: { requestId: string; userId: string; credits: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAction(action: "approved" | "rejected") {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Update the request status
    const { error: updateError } = await supabase
      .from("topup_requests")
      .update({ status: action, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq("id", requestId);

    if (updateError) {
      toast.error(updateError.message);
      setIsLoading(false);
      return;
    }

    // 2. If approved, credit the wallet using the atomic function
    if (action === "approved") {
      const { error: rpcError } = await supabase.rpc("award_points", {
        p_user_id: userId,
        p_amount: credits,
        p_type: "topup",
        p_description: `Top-up approved (${requestId})`,
        p_metadata: { request_id: requestId },
      });

      if (rpcError) {
        toast.error(rpcError.message);
      } else {
        toast.success(`Approved! ${credits} credits added.`);
        router.refresh();
      }
    } else {
      toast.success("Request rejected.");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleAction("rejected")} disabled={isLoading}>
        <X className="h-4 w-4" />
      </Button>
      <Button size="sm" className="text-green-500 hover:text-green-600" onClick={() => handleAction("approved")} disabled={isLoading}>
        <Check className="h-4 w-4" />
      </Button>
    </div>
  );
}
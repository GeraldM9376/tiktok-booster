// src/app/admin/ranks/rank-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function RankActions({ requestId, userId }: { requestId: string; userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAction(status: "approved" | "rejected") {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Update user_ranks status
    const { error: updateError } = await supabase
      .from("user_ranks")
      .update({ status, approved_by: user.id, approved_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (updateError) {
      toast.error(updateError.message);
      setIsLoading(false);
      return;
    }

    // 2. If approved, award referral commission
    if (status === "approved") {
      // Get the price of the rank
      const { data: rankData } = await supabase
        .from("user_ranks")
        .select("rank_packages(tier_value)")
        .eq("user_id", userId)
        .single();

      const price = (rankData?.rank_packages as any)?.tier_value || 0;

      if (price > 0) {
        // Call our secure function
        await supabase.rpc("award_referral_commission", {
          referred_user_id: userId,
          rank_price: price,
        });
      }
    }

    toast.success(`Rank ${status}!`);
    router.refresh();
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
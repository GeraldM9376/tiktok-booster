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

    const { error } = await supabase
      .from("user_ranks")
      .update({ status, approved_by: user.id, approved_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Rank ${status}!`);
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
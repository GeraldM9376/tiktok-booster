// src/app/earn/creators/[id]/task-button.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { completeTask } from "@/lib/services/tasks";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function TaskButton({ targetId, type }: { targetId: string; type: "follow" | "like" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  // Check if task is already completed on mount
  useEffect(() => {
    async function checkStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("completed_tasks")
        .select("id")
        .eq("user_id", user.id)
        .eq("task_type", type)
        .eq("target_id", targetId)
        .eq("day_bucket", today)
        .maybeSingle();

      if (data) setCompleted(true);
    }
    checkStatus();
  }, [targetId, type]);

  async function handleTask() {
    if (completed || isLoading) return;
    setIsLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in.");
      setIsLoading(false);
      return;
    }

    // Reward amounts: 10 for follow, 1 for like
    const reward = type === "follow" ? 10 : 1;
    const result = await completeTask(user.id, type, targetId, reward);

    if (result.error) {
      toast.error(result.error);
      // If the error is about rank, redirect them
      if (result.error.includes("active rank")) {
        router.push("/earn/rank");
      }
    } else {
      setCompleted(true);
      toast.success(`Thank you! +${reward} credits added to your wallet.`);
      router.refresh();
    }
    setIsLoading(false);
  }

  if (type === "follow") {
    return (
      <Button
        size="lg"
        onClick={handleTask}
        disabled={isLoading || completed}
        className={`min-w-[160px] transition-all ${completed ? "bg-secondary text-foreground" : "shadow-glow"}`}
      >
        {completed ? (
          <><Check className="mr-2 h-5 w-5" /> Followed</>
        ) : (
          <><UserPlus className="mr-2 h-5 w-5" /> Follow (+10)</>
        )}
      </Button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={handleTask}
      disabled={isLoading || completed}
      className={`p-2 rounded-full transition-colors ${
        completed 
          ? "text-red-500 bg-red-500/10" 
          : "text-green-500 hover:bg-green-500/10"
      }`}
      title={completed ? "Liked" : "Like (+1)"}
    >
      <Heart className={`h-5 w-5 ${completed ? "fill-red-500" : ""}`} />
    </motion.button>
  );
}
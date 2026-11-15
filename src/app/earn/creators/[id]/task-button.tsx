// src/app/earn/creators/[id]/task-button.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, UserPlus, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { completeTask } from "@/lib/services/tasks";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function TaskButton({ 
  targetId, 
  type, 
  isOnDailyTaskPage = false 
}: { 
  targetId: string; 
  type: "follow" | "like"; 
  isOnDailyTaskPage?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  // Check if task is already completed today
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
    // If NOT on the daily tasks page, redirect them there instead of earning
    if (!isOnDailyTaskPage) {
      router.push("/earn/tasks/daily");
      return;
    }

    // If they are on the daily tasks page, run the earning logic
    if (completed || isLoading) return;
    setIsLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in.");
      setIsLoading(false);
      return;
    }

    const reward = type === "follow" ? 10 : 1;
    const result = await completeTask(user.id, type, targetId, reward);

    if (result.error) {
      toast.error(result.error);
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
    if (completed) {
      return (
        <div className="flex items-center gap-2 w-full">
          <Button
            disabled
            className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/20"
          >
            <Check className="mr-2 h-4 w-4" /> Followed
          </Button>
          <Button asChild variant="default" className="shadow-glow">
            <a href={`/earn/creators/${targetId}`}>
              Earn More <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={handleTask}
        disabled={isLoading}
        className="w-full shadow-glow"
      >
        {isLoading ? "Processing..." : <><UserPlus className="mr-2 h-4 w-4" /> Follow (+10)</>}
      </Button>
    );
  }

  // Like Button (Heart)
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={handleTask}
      disabled={completed || isLoading}
      className={`p-2 rounded-full transition-colors ${
        completed 
          ? "text-red-500 bg-red-500/10" 
          : "text-green-500 hover:bg-green-500/10"
      }`}
    >
      <Heart className={`h-5 w-5 ${completed ? "fill-red-500" : ""}`} />
    </motion.button>
  );
}
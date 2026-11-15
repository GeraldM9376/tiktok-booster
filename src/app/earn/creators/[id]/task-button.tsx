// src/app/earn/creators/[id]/task-button.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, UserPlus, Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { completeTask } from "@/lib/services/tasks";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function TaskButton({ 
  targetId, 
  type, 
  isOnDailyTaskPage = false,
  onComplete
}: { 
  targetId: string; 
  type: "follow" | "like"; 
  isOnDailyTaskPage?: boolean;
  onComplete?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

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
    if (type === "follow" && !isOnDailyTaskPage) {
      router.push("/earn/tasks/daily");
      return;
    }
    
    if (completed || isLoading) return;
    
    // 1. Instantly update UI (Optimistic)
    setCompleted(true);
    setIsLoading(true);
    if (onComplete) onComplete(); // Update parent counter instantly

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in.");
      setCompleted(false);
      setIsLoading(false);
      return;
    }

    const reward = type === "follow" ? 10 : 1;
    const result = await completeTask(user.id, type, targetId, reward);

    if (result.error) {
      toast.error(result.error);
      setCompleted(false); // Revert UI on failure
      if (result.error.includes("active rank")) {
        router.push("/earn/rank");
      }
    } else {
      toast.success(`+${reward} credits earned!`, {
        icon: type === "like" ? "❤️" : "👤",
      });
      router.refresh(); // Refresh background data without reloading
    }
    setIsLoading(false);
  }

  if (type === "follow") {
    return (
      <div className="w-full">
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div 
              key="followed"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 w-full"
            >
              <Button disabled className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50">
                <Check className="mr-2 h-4 w-4" /> Followed
              </Button>
              <Button asChild variant="default" className="shadow-glow">
                <a href={`/earn/creators/${targetId}`}>
                  Earn More <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          ) : (
            <motion.div key="follow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button onClick={handleTask} disabled={isLoading} className="w-full shadow-glow">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="mr-2 h-4 w-4" /> Follow (+10)</>}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Like Button (Heart)
  return (
    <motion.button
      whileTap={{ scale: 0.7 }}
      onClick={handleTask}
      disabled={completed || isLoading}
      className={`p-2 rounded-full transition-colors ${
        completed 
          ? "text-red-500 bg-red-500/10" 
          : "text-green-500 hover:bg-green-500/10"
      }`}
    >
      <motion.div
        animate={completed ? { scale: [1, 1.5, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart className={`h-5 w-5 ${completed ? "fill-red-500" : ""}`} />
      </motion.div>
    </motion.button>
  );
}
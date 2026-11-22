
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, UserPlus, Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { completeTask } from "@/lib/services/tasks";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function TaskButton({
  targetId,
  type,
  isOnDailyTaskPage = false,
  onLikeComplete,
}: {
  targetId: string;
  type: "follow" | "like";
  isOnDailyTaskPage?: boolean;
  onLikeComplete?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: todayData } = await supabase.rpc("get_local_date");

      const today =
        todayData ||
        new Date(Date.now() + 3 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

      const { data } = await supabase
        .from("completed_tasks")
        .select("id")
        .eq("user_id", user.id)
        .eq("task_type", type)
        .eq("target_id", targetId)
        .eq("day_bucket", today)
        .maybeSingle();

      if (isMounted && data) {
        setCompleted(true);
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [targetId, type]);

  async function handleTask() {
    if (!isOnDailyTaskPage) {
      router.push("/earn/tasks/daily");
      return;
    }

    if (completed || isLoading) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Please log in again.");
        return;
      }

      // Require an approved rank before allowing follow tasks.
      if (type === "follow") {
        const { data: activeRank, error: rankError } = await supabase
          .from("user_ranks")
          .select("rank_id")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .maybeSingle();

        if (rankError) {
          console.error("Rank verification error:", rankError);
          toast.error("Could not verify your account rank. Please try again.");
          return;
        }

        if (!activeRank) {
          toast.error("Choose an account rank before completing follow tasks.");
          router.push("/earn/rank");
          return;
        }
      }

      const result = await completeTask(type, targetId);

      if (result.error || !result.success) {
        const errorMessage =
          result.error || "Could not complete task. Please try again.";

        if (
          type === "follow" &&
          errorMessage.toLowerCase().includes("active rank")
        ) {
          toast.error("Choose an account rank before completing follow tasks.");
          router.push("/earn/rank");
          return;
        }

        toast.error(errorMessage);
        router.refresh();
        return;
      }

      setCompleted(true);

      if (type === "like" && onLikeComplete) {
        onLikeComplete();
      }

      toast.success(`Task completed! +${result.reward} credits`);
      router.refresh();
    } catch (error) {
      console.error("Task completion error:", error);
      toast.error("Something went wrong. Please try again.");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  if (type === "follow") {
    if (completed) {
      return (
        <div className="flex items-center gap-2 w-full">
          <Button
            disabled
            className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/20"
          >
            <Check className="mr-2 h-4 w-4" />
            Followed
          </Button>

          <Button asChild variant="default" className="shadow-glow">
            <a href={`/earn/creators/${targetId}`}>
              Earn More
              <ArrowRight className="ml-2 h-4 w-4" />
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
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Follow (+10)
          </>
        )}
      </Button>
    );
  }

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

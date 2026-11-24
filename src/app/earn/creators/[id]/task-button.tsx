
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  UserPlus,
  Check,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { completeTask } from "@/lib/services/tasks";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function TaskButton({
  targetId,
  type,
  isOnDailyTaskPage = false,
  onLikeComplete,
  liveUrl,
}: {
  targetId: string;
  type: "follow" | "like";
  isOnDailyTaskPage?: boolean;
  onLikeComplete?: () => void;
  liveUrl?: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showLiveLink, setShowLiveLink] = useState(false);
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
      setShowLiveLink(false);

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

  const postTaskContent = (
    <div className="w-full space-y-3">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
        <p className="text-sm font-semibold text-primary">
          Thank You!! rendered live.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          disabled={!liveUrl}
          onClick={() => setShowLiveLink((value) => !value)}
        >
          View on TikTok
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>

        {showLiveLink && liveUrl && (
          <div className="mt-3">
            <Button asChild size="sm">
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live TikTok
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (type === "follow") {
    if (completed) {
      return (
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2">
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
          {postTaskContent}
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

  if (completed) {
    return (
      <div className="w-64 max-w-full">
        <div className="flex items-center justify-center gap-2 text-red-500 font-semibold mb-3">
          <Check className="h-4 w-4" />
          Liked
        </div>
        {postTaskContent}
      </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.7 }}
      onClick={handleTask}
      disabled={isLoading}
      className="p-2 rounded-full transition-colors text-green-500 hover:bg-green-500/10"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className="h-5 w-5" />
      )}
    </motion.button>
  );
}

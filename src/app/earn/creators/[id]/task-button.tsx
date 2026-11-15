// src/app/earn/creators/[id]/task-button.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, UserPlus, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function TaskButton({ targetId, type }: { targetId: string; type: "follow" | "like" }) {
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

  function handleRedirect() {
    // Redirect to the daily tasks page to actually earn the points
    router.push("/earn/tasks/daily");
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
            <a href={`/earn/tasks/daily`}>
              Earn More <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={handleRedirect}
        className="w-full shadow-glow"
      >
        <UserPlus className="mr-2 h-4 w-4" /> Follow (+10)
      </Button>
    );
  }

  // Render Like Button (Heart)
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={handleRedirect}
      disabled={completed}
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
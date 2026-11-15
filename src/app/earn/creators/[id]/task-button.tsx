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
  const [hasRank, setHasRank] = useState<boolean | null>(null);
  const router = useRouter();

  // Check if the user has an approved rank on mount
  useEffect(() => {
    async function checkRank() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_ranks")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .maybeSingle();
        
      setHasRank(!!data);
    }
    checkRank();
  }, []);

  async function handleTask() {
    if (hasRank === false) {
      toast.error("You need an active rank to earn credits. Please purchase one.");
      router.push("/earn/rank");
      return;
    }

    if (completed || isLoading) return;
    setIsLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reward = type === "follow" ? 10 : 2;
    const result = await completeTask(user.id, type, targetId, reward);

    if (result.error) {
      toast.error(result.error);
    } else {
      setCompleted(true);
      toast.success(`+${reward} credits earned!`);
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
          <><Check className="mr-2 h-5 w-5" /> Following</>
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
    >
      <Heart className={`h-5 w-5 ${completed ? "fill-red-500" : ""}`} />
    </motion.button>
  );
}
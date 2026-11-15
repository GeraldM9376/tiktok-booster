// src/app/earn/creators/[id]/task-button.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { completeTask } from "@/lib/services/tasks";
import { Button } from "@/components/ui/button";

export function TaskButton({ targetId, type }: { targetId: string; type: "follow" | "like" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handleTask() {
    if (completed || isLoading) return;
    setIsLoading(true);

    // For this demo, we need the user ID. We can get it from the client-side supabase
    // but to keep it simple, we will let the server action fetch the user from cookies.
    // Note: Our completeTask function requires userId. We will modify it to be safer.
    
    // We'll use a simpler approach: get user ID from cookie via server action.
    // But wait, the completeTask already takes userId. Let's just fetch it via the client.
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in.");
      setIsLoading(false);
      return;
    }

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
          <>
            <Check className="mr-2 h-5 w-5" /> Following
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-5 w-5" /> Follow (+10)
          </>
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
        completed ? "text-red-500 bg-red-500/10" : "text-green-500 hover:bg-green-500/10"
      }`}
    >
      <Heart className={`h-5 w-5 ${completed ? "fill-current" : ""}`} />
    </motion.button>
  );
}
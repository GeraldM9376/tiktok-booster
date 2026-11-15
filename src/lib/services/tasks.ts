// src/lib/services/tasks.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeTask(
  userId: string,
  taskType: "follow" | "like",
  targetId: string,
  rewardAmount: number
) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // 1. Check if already completed today
  const { data: existing } = await supabase
    .from("completed_tasks")
    .select("id")
    .eq("user_id", userId)
    .eq("task_type", taskType)
    .eq("target_id", targetId)
    .eq("day_bucket", today)
    .maybeSingle();

  if (existing) {
    return { error: "You have already completed this task today." };
  }

  // 2. Record the completed task
  const { error: taskError } = await supabase.from("completed_tasks").insert({
    user_id: userId,
    task_type: taskType,
    target_id: targetId,
    reward: rewardAmount,
    day_bucket: today,
  });

  if (taskError) {
    return { error: taskError.message };
  }

  // 3. Award the points using the atomic RPC function
  const { error: rpcError } = await supabase.rpc("award_points", {
    p_user_id: userId,
    p_amount: rewardAmount,
    p_type: "earning",
    p_description: `Completed ${taskType} task`,
    p_metadata: { target_id: targetId },
  });

  if (rpcError) {
    return { error: rpcError.message };
  }

  // 4. Update daily statistics
  // Using upsert to increment the counters
  const { data: stats } = await supabase
    .from("user_daily_statistics")
    .select("*")
    .eq("user_id", userId)
    .eq("day", today)
    .maybeSingle();

  if (stats) {
    await supabase
      .from("user_daily_statistics")
      .update({
        earnings: stats.earnings + rewardAmount,
        tasks_completed: stats.tasks_completed + 1,
        follows_completed: taskType === "follow" ? stats.follows_completed + 1 : stats.follows_completed,
        likes_completed: taskType === "like" ? stats.likes_completed + 1 : stats.likes_completed,
      })
      .eq("user_id", userId)
      .eq("day", today);
  } else {
    await supabase.from("user_daily_statistics").insert({
      user_id: userId,
      day: today,
      earnings: rewardAmount,
      tasks_completed: 1,
      follows_completed: taskType === "follow" ? 1 : 0,
      likes_completed: taskType === "like" ? 1 : 0,
    });
  }

  // Refresh the page data
  revalidatePath("/earn/marketplace");
  revalidatePath(`/earn/creators/${targetId}`);
  revalidatePath("/earn/dashboard");

  return { success: true };
}
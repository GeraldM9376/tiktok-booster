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
  const { data: { local_date } } = await supabase.rpc("get_local_date");
  const today = local_date || new Date().toISOString().split("T")[0];

  // 1. Check if user has an active rank
  const { data: rankData } = await supabase
    .from("user_ranks")
    .select("rank_packages(daily_follow_tasks, daily_like_tasks)")
    .eq("user_id", userId)
    .eq("status", "approved")
    .maybeSingle();

  if (!rankData || !rankData.rank_packages) {
    return { error: "You need an active rank to earn credits." };
  }

  const limit = taskType === "follow" 
    ? (rankData.rank_packages as any).daily_follow_tasks 
    : (rankData.rank_packages as any).daily_like_tasks;

  // 2. Count how many tasks of this type they've done today
  const { count: completedToday } = await supabase
    .from("completed_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("task_type", taskType)
    .eq("day_bucket", today);

  if (completedToday && completedToday >= limit) {
    return { error: `You have reached your daily limit of ${limit} ${taskType}s. Upgrade your rank for more.` };
  }

  // 3. Prevent duplicate tasks
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

  // 4. Record the task
  const { error: taskError } = await supabase.from("completed_tasks").insert({
    user_id: userId,
    task_type: taskType,
    target_id: targetId,
    reward: rewardAmount,
    day_bucket: today,
  });

  if (taskError) return { error: taskError.message };

  // 5. Award the points
  const { error: rpcError } = await supabase.rpc("award_points", {
    p_user_id: userId,
    p_amount: rewardAmount,
    p_type: "earning",
    p_description: `Completed ${taskType} task`,
    p_metadata: { target_id: targetId },
  });

  if (rpcError) return { error: rpcError.message };

  // 6. Increment Creator/Video Stats using the new RPCs
  if (taskType === "follow") {
    await supabase.rpc("increment_follower_count", { creator_id: targetId });
  } else if (taskType === "like") {
    await supabase.rpc("increment_like_count", { video_id: targetId });
  }

  // 7. Update daily statistics
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

  // 8. Clear the cache for the specific pages
  revalidatePath("/earn/marketplace");
  revalidatePath(`/earn/creators/${targetId}`);
  revalidatePath("/earn/dashboard");
  revalidatePath("/earn/tasks/daily");

  return { success: true };
}
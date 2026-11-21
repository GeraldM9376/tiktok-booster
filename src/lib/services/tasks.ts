
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeTask(
  taskType: "follow" | "like",
  targetId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const { data, error } = await (supabase as any).rpc(
    "complete_earning_task",
    {
      p_task_type: taskType,
      p_target_id: targetId,
    }
  );

  if (error) {
    return { error: error.message };
  }

  if (!data?.success) {
    return { error: "Task completion could not be confirmed." };
  }

  revalidatePath("/earn/marketplace");
  revalidatePath(`/earn/creators/${targetId}`);
  revalidatePath("/earn/dashboard");
  revalidatePath("/earn/tasks/daily");

  return {
    success: true,
    reward: Number(data.reward),
  };
}

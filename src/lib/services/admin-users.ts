// src/lib/services/admin-users.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(userId: string, confirmText: string) {
  if (confirmText !== "DELETE") {
    return { error: "You must type DELETE exactly to confirm." };
  }

  const supabase = await createClient();

  // Call the secure database function to delete the user
  const { error } = await supabase.rpc("admin_delete_user", {
    target_user_id: userId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
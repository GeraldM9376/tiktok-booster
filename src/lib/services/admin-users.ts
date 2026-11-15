// src/lib/services/admin-users.ts
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteUserAction(userId: string, confirmText: string) {
  if (confirmText !== "DELETE") {
    return { error: "You must type DELETE exactly to confirm." };
  }

  // 1. Verify the current user is an admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated." };

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .single();

  if ((roleData?.roles as any)?.name !== "admin") {
    return { error: "Unauthorized. Only admins can delete users." };
  }

  // 2. Delete the user using the Admin Client (Service Role)
  const adminClient = createAdminClient();
  
  // Deleting from auth.users cascades to profiles, wallets, etc. due to foreign keys
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return { error: error.message };
  }

  // 3. Log the action in audit logs
  await adminClient.from("audit_logs").insert({
    actor_id: user.id,
    action: "user_deleted",
    target_kind: "user",
    target_id: userId,
    metadata: { deleted_at: new Date().toISOString() },
  });

  revalidatePath("/admin/users");
  return { success: true };
}
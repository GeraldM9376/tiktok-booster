
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedStatuses = ["open", "in_progress", "resolved"] as const;

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Please sign in again.");
  }

  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id);

  const isAdmin =
    !roleError &&
    (roleData ?? []).some((item) => {
      const relation = item.roles;
      const roles = Array.isArray(relation) ? relation : [relation];

      return roles.some(
        (role) =>
          role !== null &&
          typeof role === "object" &&
          "name" in role &&
          role.name === "admin"
      );
    });

  if (!isAdmin) {
    throw new Error("Administrator access required.");
  }

  return user;
}

export async function updateSupportTicket(
  ticketId: string,
  response: string,
  status: string
) {
  try {
    await verifyAdmin();

    const validUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!validUUID.test(ticketId)) {
      return { error: "Invalid ticket ID." };
    }

    if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
      return { error: "Invalid ticket status." };
    }

    const cleanResponse = response.trim();

    if (!cleanResponse) {
      return { error: "Please enter a response to the Creator." };
    }

    if (cleanResponse.length > 5000) {
      return { error: "Response cannot exceed 5,000 characters." };
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("support_tickets")
      .update({
        response: cleanResponse,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Support ticket update failed:", error);
      return { error: "Failed to update the support ticket." };
    }

    if (!data) {
      return { error: "Ticket not found." };
    }

    revalidatePath("/admin/support");
    revalidatePath("/creator/help");

    return { success: true };
  } catch (error) {
    console.error("Support ticket action failed:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}

// src/lib/services/settings.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function savePaymentDetails(details: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("earner_profiles")
    .update({ payment_details: details })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/earn/earnings");
  revalidatePath("/earn/settings");
  return { success: true };
}
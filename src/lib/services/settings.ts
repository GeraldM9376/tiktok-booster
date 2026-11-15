// src/lib/services/settings.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function savePaymentDetails(details: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Use admin client to guarantee bypass of RLS
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Check if the profile exists
  const { data: existingProfile } = await admin
    .from("earner_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let error;

  if (existingProfile) {
    // 2. Update if it exists
    const { error: updateError } = await admin
      .from("earner_profiles")
      .update({ payment_details: details })
      .eq("user_id", user.id);
    error = updateError;
  } else {
    // 3. Insert if it doesn't (fallback)
    const { error: insertError } = await admin
      .from("earner_profiles")
      .insert({ user_id: user.id, payment_details: details });
    error = insertError;
  }

  if (error) {
    console.error("Save error:", error);
    return { error: error.message };
  }

  revalidatePath("/earn/earnings");
  revalidatePath("/earn/settings");
  return { success: true };
}
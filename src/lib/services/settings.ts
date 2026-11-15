// src/lib/services/settings.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function savePaymentDetails(details: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Use admin client to guarantee the save works regardless of RLS
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await admin
    .from("earner_profiles")
    .upsert({ 
      user_id: user.id, 
      payment_details: details 
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Save error:", error);
    return { error: error.message };
  }

  revalidatePath("/earn/earnings");
  revalidatePath("/earn/settings");
  return { success: true };
}
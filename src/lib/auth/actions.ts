// src/lib/auth/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function login(formData: FormData, targetDashboard: string) {
  const supabase = await createClient();
  const data = { email: formData.get("email") as string, password: formData.get("password") as string };

  const result = authSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);
  if (error) return { error: error.message };

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", authData.user.id)
    .single();

  revalidatePath("/", "layout");

  if (roleData && (roleData.roles as unknown as { name: string })?.name === "admin") {
    redirect("/admin/dashboard");
  }
  redirect(targetDashboard);
}

export async function signup(
  formData: FormData,
  targetDashboard: string,
  profileType: "earner" | "creator"
) {
  const supabase = await createClient();

  const refRaw = (formData.get("ref") as string | null) || "";
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    display_name: formData.get("display_name") as string,
    phone_number: formData.get("phone_number") as string,
    ref: refRaw.trim().toUpperCase() || null,
  };

  const result = authSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  // The referral code is sent with the signup.
  // The database trigger (on_signup_referral) creates the referral row.
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        display_name: data.display_name,
        ref: data.ref,
      },
    },
  });

  if (error) return { error: error.message };

  if (authData.user) {
    const userId = authData.user.id;

    // 1. Create profile
    if (profileType === "earner") {
      const { error: pErr } = await supabase.from("earner_profiles").insert({
        user_id: userId,
        phone_number: data.phone_number,
      });
      if (pErr) console.error("earner_profiles insert:", pErr.message);
    } else {
      const { error: pErr } = await supabase.from("creator_profiles").insert({ user_id: userId });
      if (pErr) console.error("creator_profiles insert:", pErr.message);
    }

    // 2. Assign role
    const { data: roleData } = await supabase
      .from("roles").select("id").eq("name", profileType).single();
    if (roleData) {
      const { error: rErr } = await supabase
        .from("user_roles").insert({ user_id: userId, role_id: roleData.id });
      if (rErr) console.error("user_roles insert:", rErr.message);
    }

    // 3. Generate own referral code
    const newRefCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error: cErr } = await supabase
      .from("referral_codes").insert({ user_id: userId, code: newRefCode });
    if (cErr) console.error("referral_codes insert:", cErr.message);

    // 4. Save referred_by on the profile (the referral row is made by the trigger)
    if (data.ref) {
      const { data: refRow } = await supabase
        .from("referrals")
        .select("referrer_id")
        .eq("referred_id", userId)
        .maybeSingle();

      if (refRow?.referrer_id) {
        const table = profileType === "earner" ? "earner_profiles" : "creator_profiles";
        await supabase.from(table).update({ referred_by: refRow.referrer_id }).eq("user_id", userId);
      }
    }
  }

  revalidatePath("/", "layout");
  redirect(targetDashboard);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

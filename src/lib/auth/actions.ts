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

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = authSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  // Check if the user is an admin
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", authData.user.id)
    .single();

  revalidatePath("/", "layout");

  // If admin, force redirect to admin dashboard
  if (roleData && (roleData.roles as unknown as { name: string })?.name === "admin") {
    redirect("/admin/dashboard");
  }

  // Otherwise go to the requested dashboard
  redirect(targetDashboard);
}

export async function signup(
  formData: FormData,
  targetDashboard: string,
  profileType: "earner" | "creator"
) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    display_name: formData.get("display_name") as string,
    ref: formData.get("ref") as string | null,
  };

  const result = authSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { display_name: data.display_name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (authData.user) {
    // 1. Create the specific profile
    if (profileType === "earner") {
      await supabase.from("earner_profiles").insert({
        user_id: authData.user.id,
      });
    } else {
      await supabase.from("creator_profiles").insert({
        user_id: authData.user.id,
      });
    }

    // 2. Assign the role in user_roles (NEW)
    const { data: roleData } = await supabase
      .from("roles")
      .select("id")
      .eq("name", profileType)
      .single();

    if (roleData) {
      await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role_id: roleData.id,
      });
    }

    // 3. Generate a referral code for this new user
    const newRefCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase.from("referral_codes").insert({
      user_id: authData.user.id,
      code: newRefCode,
    });

    // 4. If they signed up with a referral code, record the referral
    if (data.ref) {
      const { data: referrerData } = await supabase
        .from("referral_codes")
        .select("user_id")
        .eq("code", data.ref.toUpperCase())
        .maybeSingle();

      if (referrerData && referrerData.user_id !== authData.user.id) {
        await supabase.from("referrals").insert({
          referrer_id: referrerData.user_id,
          referred_id: authData.user.id,
          status: "pending",
        });
        
        if (profileType === "earner") {
          await supabase.from("earner_profiles").update({ referred_by: referrerData.user_id }).eq("user_id", authData.user.id);
        } else {
          await supabase.from("creator_profiles").update({ referred_by: referrerData.user_id }).eq("user_id", authData.user.id);
        }
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
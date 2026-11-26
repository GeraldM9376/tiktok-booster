
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function login(
  formData: FormData,
  targetDashboard: string
) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = authSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { data: authData, error } =
    await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  const roleName = (
    roleData?.roles as unknown as { name: string } | null
  )?.name;

  // Prevent non-admin users from entering the admin dashboard.
  if (
    targetDashboard.startsWith("/admin") &&
    (roleError || roleName !== "admin")
  ) {
    await supabase.auth.signOut();

    return {
      error: "This account does not have administrator access.",
    };
  }

  revalidatePath("/", "layout");

  if (roleName === "admin") {
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

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

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

  if (error) {
    return { error: error.message };
  }

  if (authData.user) {
    const userId = authData.user.id;

    // Create the appropriate profile.
    if (profileType === "earner") {
      const { error: profileError } = await supabase
        .from("earner_profiles")
        .insert({
          user_id: userId,
          phone_number: data.phone_number,
        });

      if (profileError) {
        console.error("earner_profiles insert:", profileError.message);
      }
    } else {
      const { error: profileError } = await supabase
        .from("creator_profiles")
        .insert({ user_id: userId });

      if (profileError) {
        console.error("creator_profiles insert:", profileError.message);
      }
    }

    // Assign the account role.
    const { data: roleData } = await supabase
      .from("roles")
      .select("id")
      .eq("name", profileType)
      .single();

    if (roleData) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role_id: roleData.id,
        });

      if (roleError) {
        console.error("user_roles insert:", roleError.message);
      }
    }

    // Referral code is generated automatically by handle_new_user().
    // Save the referring user when a referral exists.
    if (data.ref) {
      const { data: refRow } = await supabase
        .from("referrals")
        .select("referrer_id")
        .eq("referred_id", userId)
        .maybeSingle();

      if (refRow?.referrer_id) {
        const table =
          profileType === "earner"
            ? "earner_profiles"
            : "creator_profiles";

        await supabase
          .from(table)
          .update({ referred_by: refRow.referrer_id })
          .eq("user_id", userId);
      }
    }
  }

  revalidatePath("/", "layout");
  redirect(targetDashboard);
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out failed:", error.message);
    throw new Error("Unable to sign out. Please try again.");
  }

  revalidatePath("/", "layout");
  redirect("/");
}


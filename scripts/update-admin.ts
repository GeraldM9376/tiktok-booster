import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function updateAdmin() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const oldAdmin = users.find((u) => u.email === "admin@tiktok-booster.local");
  
  if (oldAdmin) {
    const { error } = await supabase.auth.admin.updateUserById(oldAdmin.id, {
      email: "signin@gmail.com",
      password: "Gm08202118269",
      email_confirm: true,
    });
    if (error) console.error("❌ Error:", error.message);
    else console.log("✅ Admin credentials updated successfully to signin@gmail.com!");
  } else {
    console.log("✅ Admin already updated or not found.");
  }
}
updateAdmin();
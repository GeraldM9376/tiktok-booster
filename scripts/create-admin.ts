// scripts/create-admin.ts
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL!;
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD!;

if (!supabaseUrl || !supabaseServiceKey || !adminEmail || !adminPassword) {
  console.error("❌ Missing environment variables. Check your .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function bootstrapAdmin() {
  console.log(`⏳ Creating admin account for ${adminEmail}...`);

  // 1. Create the user in Supabase Auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true, 
  });

  if (userError) {
    if (userError.message.includes("already registered")) {
      console.log("ℹ️ Admin user already exists in Auth.");
    } else {
      console.error("❌ Error creating user:", userError.message);
      process.exit(1);
    }
  } else {
    console.log(`✅ Auth user created (ID: ${userData.user?.id})`);
  }

  // 2. Get the user's ID
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("❌ Error listing users:", listError.message);
    process.exit(1);
  }

  const adminUser = users.find((u) => u.email === adminEmail);
  if (!adminUser) {
    console.error("❌ Could not find the admin user after creation.");
    process.exit(1);
  }

  // 3. Assign the 'admin' role
  console.log("⏳ Assigning admin role...");
  
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "admin")
    .single();

  if (roleError || !roleData) {
    console.error("❌ Could not find 'admin' role in the database.", roleError);
    process.exit(1);
  }

  const { error: insertError } = await supabase
    .from("user_roles")
    .upsert({ user_id: adminUser.id, role_id: roleData.id });

  if (insertError) {
    console.error("❌ Error assigning role:", insertError.message);
    process.exit(1);
  }

  console.log("🎉 Admin bootstrap complete! You can now log in.");
}

bootstrapAdmin();
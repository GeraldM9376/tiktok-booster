
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteFilteredTransactions(ids: string[]) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { error: "No transactions selected." };
    }

    if (ids.length > 500) {
      return { error: "You can delete a maximum of 500 transactions at once." };
    }

    const validUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!ids.every((id) => typeof id === "string" && validUUID.test(id))) {
      return { error: "Invalid transaction IDs supplied." };
    }

    const uniqueIds = [...new Set(ids)];

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Please sign in again." };
    }

    const { data, error } = await supabase.rpc(
      "delete_wallet_transactions",
      {
        p_transaction_ids: uniqueIds,
      }
    );

    if (error) {
      console.error("Transaction deletion failed:", error);
      return { error: error.message };
    }

    const deletedCount = Number(data ?? 0);

    revalidatePath("/admin/transactions");
    revalidatePath("/admin");

    return { deletedCount };
  } catch (error) {
    console.error("Transaction deletion error:", error);
    return { error: "An unexpected error occurred while deleting transactions." };
  }
}

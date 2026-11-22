
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function AuditActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function clearLogs() {
    if (loading) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all audit logs? This cannot be undone."
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc("clear_audit_logs");

      if (error) {
        console.error("Supabase RPC error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        throw new Error(
          `${error.message} ${error.details ?? ""} ${error.hint ?? ""}`
        );
      }

      toast.success(`${data ?? 0} audit records cleared successfully.`);
      router.refresh();
    } catch (error) {
      console.error("Clear audit logs failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to clear audit logs."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={clearLogs}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Clearing..." : "Clear Audit Logs"}
    </button>
  );
}


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
      "Clear all existing audit logs? This action cannot be undone. A record of this clearing operation will remain."
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await (supabase as any).rpc(
        "clear_audit_logs"
      );

      if (error) throw error;

      toast.success(
        `Audit logs cleared successfully. ${Number(data ?? 0)} records deleted.`
      );

      router.refresh();
    } catch (error) {
      console.error("Clear audit logs error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to clear audit logs."
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

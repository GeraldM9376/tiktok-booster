
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  target_kind: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAction(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );
}

export default async function AdminAuditPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select(
      "id, actor_id, action, target_kind, target_id, metadata, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <DashboardShell type="admin" authPath="/admin/auth">
        <div className="mx-auto max-w-6xl space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-red-500">
            Failed to load audit logs: {error.message}
          </div>
        </div>
      </DashboardShell>
    );
  }

  const auditLogs = (logs ?? []) as AuditLog[];

  const actorIds = [
    ...new Set(
      auditLogs
        .map((log) => log.actor_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const { data: profiles, error: profilesError } =
    actorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, email")
          .in("id", actorIds)
      : { data: [], error: null };

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.email])
  );

  const actionCounts = auditLogs.reduce<Record<string, number>>(
    (counts, log) => {
      counts[log.action] = (counts[log.action] ?? 0) + 1;
      return counts;
    },
    {}
  );

  const uniqueActions = Object.keys(actionCounts).length;

  return (
    <DashboardShell type="admin" authPath="/admin/auth">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track administrator actions and system events.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Events Loaded</p>
            <p className="mt-2 text-3xl font-bold">{auditLogs.length}</p>
          </div>

          <div className="glass rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Action Types</p>
            <p className="mt-2 text-3xl font-bold">{uniqueActions}</p>
          </div>

          <div className="glass rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Latest Activity</p>
            <p className="mt-2 text-lg font-semibold">
              {auditLogs.length > 0
                ? formatDate(auditLogs[0].created_at)
                : "No activity"}
            </p>
          </div>
        </div>

        <div className="glass overflow-hidden rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div>
              <h2 className="text-lg font-semibold">Recent Events</h2>
              <p className="text-sm text-muted-foreground">
                Showing the latest {auditLogs.length} records
              </p>
            </div>
          </div>

          {profilesError && (
            <p className="border-b border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-600">
              Some administrator email addresses could not be loaded.
            </p>
          )}

          {auditLogs.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No audit events have been recorded yet.
            </div>
          ) : (
            <div className="divide-y">
              {auditLogs.map((log) => (
                <div key={log.id} className="space-y-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {formatAction(log.action)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {log.actor_id
                          ? profileMap.get(log.actor_id) ?? "Unknown user"
                          : "System / Unknown actor"}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </p>
                  </div>

                  {(log.target_kind || log.target_id) && (
                    <div className="text-sm text-muted-foreground">
                      Target: {log.target_kind ?? "Record"}
                      {log.target_id ? ` · ${log.target_id}` : ""}
                    </div>
                  )}

                  {log.metadata &&
                    Object.keys(log.metadata).length > 0 && (
                      <details className="rounded-lg bg-muted/40 p-3">
                        <summary className="cursor-pointer text-sm font-medium">
                          View event details
                        </summary>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

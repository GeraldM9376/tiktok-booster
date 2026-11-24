
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSupportTicket } from "./actions";

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  created_at: string;
  updated_at: string;
  email: string;
  display_name: string;
};

type Props = {
  tickets: Ticket[];
};

const statuses = ["open", "in_progress", "resolved"] as const;

export function AdminSupportClient({ tickets }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, string>>(
    {}
  );
  const [saving, setSaving] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "open").length,
      in_progress: tickets.filter((ticket) => ticket.status === "in_progress")
        .length,
      resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
    }),
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    const term = search.toLowerCase().trim();

    return tickets.filter((ticket) => {
      const matchesStatus =
        filter === "all" || ticket.status === filter;

      const matchesSearch =
        !term ||
        ticket.subject.toLowerCase().includes(term) ||
        ticket.message.toLowerCase().includes(term) ||
        ticket.email.toLowerCase().includes(term) ||
        ticket.display_name.toLowerCase().includes(term) ||
        ticket.id.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, filter]);

  async function saveTicket(ticket: Ticket) {
    const response = responses[ticket.id] ?? ticket.response ?? "";
    const status = ticketStatuses[ticket.id] ?? ticket.status;

    if (!response.trim()) {
      toast.error("Enter a response before saving.");
      return;
    }

    setSaving(ticket.id);

    try {
      const result = await updateSupportTicket(ticket.id, response, status);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Support ticket updated.");
      router.refresh();
    } catch {
      toast.error("Unable to update this ticket.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total tickets", counts.total],
          ["Open", counts.open],
          ["In progress", counts.in_progress],
          ["Resolved", counts.resolved],
        ].map(([label, count]) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tickets, users or messages..."
          className="min-w-0 flex-1 rounded-lg border bg-background px-4 py-2 text-sm"
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border bg-background px-4 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <h3 className="font-semibold">No support tickets found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tickets submitted by Creators will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const response =
              responses[ticket.id] ?? ticket.response ?? "";
            const status = ticketStatuses[ticket.id] ?? ticket.status;

            return (
              <div
                key={ticket.id}
                className="space-y-4 rounded-xl border bg-card p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-semibold">
                      {ticket.subject}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ticket.display_name || "Creator"} ·{" "}
                      {ticket.email || ticket.user_id}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>

                  <span className="h-fit rounded-full border px-3 py-1 text-xs font-medium">
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {ticket.message}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Your response
                  </label>

                  <textarea
                    value={response}
                    onChange={(event) =>
                      setResponses((current) => ({
                        ...current,
                        [ticket.id]: event.target.value,
                      }))
                    }
                    rows={4}
                    maxLength={5000}
                    placeholder="Write your response to the Creator..."
                    className="w-full rounded-lg border bg-background p-3 text-sm"
                  />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <select
                      value={status}
                      onChange={(event) =>
                        setTicketStatuses((current) => ({
                          ...current,
                          [ticket.id]: event.target.value,
                        }))
                      }
                      className="rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      {statuses.map((item) => (
                        <option key={item} value={item}>
                          {item.replace("_", " ")}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={saving === ticket.id}
                      onClick={() => saveTicket(ticket)}
                      className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                      {saving === ticket.id ? "Saving..." : "Save response"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

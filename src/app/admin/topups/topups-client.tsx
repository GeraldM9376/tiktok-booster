
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopupActions } from "./topup-actions";

type TopupRequest = {
  id: string;
  user_id: string;
  requested_credits: number;
  transaction_reference: string | null;
  status: string;
  created_at: string;
  profiles: any;
  topup_packages: any;
};

type Props = {
  requests: TopupRequest[];
};

function getRelation(value: any) {
  return Array.isArray(value) ? value[0] : value;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("en-KE");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusVariant(status: string) {
  if (status === "approved") return "default" as const;
  if (status === "rejected") return "destructive" as const;
  return "secondary" as const;
}

export default function TopupsClient({ requests }: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending");
    const approved = requests.filter((r) => r.status === "approved");
    const rejected = requests.filter((r) => r.status === "rejected");

    return {
      total: requests.length,
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      pendingCredits: pending.reduce(
        (sum, r) => sum + Number(r.requested_credits || 0),
        0
      ),
      approvedCredits: approved.reduce(
        (sum, r) => sum + Number(r.requested_credits || 0),
        0
      ),
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      const profile = getRelation(request.profiles);
      const packageInfo = getRelation(request.topup_packages);

      const matchesSearch =
        !term ||
        request.id.toLowerCase().includes(term) ||
        request.user_id.toLowerCase().includes(term) ||
        String(profile?.email || "").toLowerCase().includes(term) ||
        String(request.transaction_reference || "")
          .toLowerCase()
          .includes(term) ||
        String(packageInfo?.name || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  async function refreshRequests() {
    setRefreshing(true);
    router.refresh();

    setTimeout(() => setRefreshing(false), 800);
  }

  async function copyReference(reference: string) {
    try {
      await navigator.clipboard.writeText(reference);
      toast.success("Payment reference copied.");
    } catch {
      toast.error("Unable to copy reference.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Top-Up Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review payments, manage credit requests and monitor wallet deposits.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={refreshRequests}
          disabled={refreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={formatNumber(stats.total)}
          description="All loaded requests"
          icon={<Wallet className="h-5 w-5" />}
        />

        <StatCard
          title="Pending Requests"
          value={formatNumber(stats.pending)}
          description={`${formatNumber(stats.pendingCredits)} credits awaiting review`}
          icon={<Clock className="h-5 w-5" />}
        />

        <StatCard
          title="Approved Credits"
          value={formatNumber(stats.approvedCredits)}
          description={`${formatNumber(stats.approved)} approved requests`}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <StatCard
          title="Rejected Requests"
          value={formatNumber(stats.rejected)}
          description="Declined payment requests"
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <div className="glass space-y-4 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Payment Requests</h2>
            <p className="text-sm text-muted-foreground">
              Showing {filteredRequests.length} of {requests.length} requests
            </p>
          </div>

          <Badge variant="secondary">
            {stats.pending} Awaiting review
          </Badge>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, user ID, package or M-Pesa reference..."
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests table */}
      <div className="glass overflow-hidden rounded-xl">
        {!filteredRequests.length ? (
          <div className="p-12 text-center">
            <Wallet className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">No requests found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-4 font-medium">Request Date</th>
                  <th className="px-4 py-4 font-medium">User</th>
                  <th className="px-4 py-4 font-medium">Package</th>
                  <th className="px-4 py-4 font-medium">Credits</th>
                  <th className="px-4 py-4 font-medium">Payment Reference</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredRequests.map((request) => {
                  const profile = getRelation(request.profiles);
                  const packageInfo = getRelation(request.topup_packages);

                  const email =
                    typeof profile?.email === "string"
                      ? profile.email
                      : "Unknown user";

                  return (
                    <tr
                      key={request.id}
                      className="transition hover:bg-secondary/20"
                    >
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(request.created_at)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium">{email}</p>
                        <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-muted-foreground">
                          {request.user_id}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium">
                          {packageInfo?.name || "Custom top-up"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-primary">
                          +{formatNumber(request.requested_credits)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Credits
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {request.transaction_reference ? (
                          <div className="flex items-center gap-2">
                            <span className="max-w-[160px] truncate font-mono text-xs">
                              {request.transaction_reference}
                            </span>
                            <button
                              type="button"
                              title="Copy reference"
                              onClick={() =>
                                copyReference(request.transaction_reference!)
                              }
                              className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={getStatusVariant(request.status)}>
                          {request.status}
                        </Badge>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        {request.status === "pending" ? (
                          <TopupActions
                            requestId={request.id}
                            credits={request.requested_credits}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {requests.length === 500 && (
        <p className="text-sm text-muted-foreground">
          Showing the latest 500 requests. Older records may exist.
        </p>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

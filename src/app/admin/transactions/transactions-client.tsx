
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import { deleteFilteredTransactions } from "./actions";

type Transaction = {
  id: string;
  user_id: string;
  type: string;
  amount: number | string;
  balance_before: number | string | null;
  balance_after: number | string | null;
  status: string;
  created_at: string;
  description: string | null;
  profiles:
    | { email?: string | null }
    | { email?: string | null }[]
    | null;
};

function getProfile(value: Transaction["profiles"]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatType(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );
}

function formatAmount(value: number | string | null) {
  return Number(value ?? 0).toLocaleString("en-KE");
}

function getStatusVariant(status: string) {
  if (status === "completed") return "default" as const;

  if (
    status === "failed" ||
    status === "reversed" ||
    status === "rejected"
  ) {
    return "destructive" as const;
  }

  return "secondary" as const;
}

export default function TransactionsClient({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return transactions.filter((tx) => {
      const profile = getProfile(tx.profiles);

      const matchesSearch =
        !term ||
        [
          tx.id,
          tx.user_id,
          profile?.email ?? "",
          tx.description ?? "",
          tx.type,
          tx.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === "all" || tx.status === statusFilter;

      const matchesType =
        typeFilter === "all" || tx.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, search, statusFilter, typeFilter]);

  const completed = transactions.filter(
    (tx) => tx.status === "completed"
  );

  const pendingCount = transactions.filter(
    (tx) => tx.status === "pending"
  ).length;

  const failedCount = transactions.filter(
    (tx) =>
      tx.status === "failed" ||
      tx.status === "reversed" ||
      tx.status === "rejected"
  ).length;

  const completedAmount = completed.reduce(
    (total, tx) => total + Number(tx.amount),
    0
  );

  const transactionTypes = [
    ...new Set(transactions.map((tx) => tx.type)),
  ].sort();

  async function handleDeleteFiltered() {
    const ids = filteredTransactions.map((tx) => tx.id);

    if (ids.length === 0 || isDeleting) return;

    const confirmed = window.confirm(
      `PERMANENT DELETION\n\nYou are about to permanently delete ${ids.length} transaction records matching your current filters.\n\nThis action CANNOT be undone.\n\nWallet balances will NOT be changed.\n\nDo you want to continue?`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteFilteredTransactions(ids);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `${result.deletedCount} transaction records permanently deleted.`
      );

      router.refresh();
    } catch (error) {
      console.error("Transaction deletion error:", error);
      toast.error("Failed to delete transactions.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transaction Ledger
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor wallet activity, credits, deductions and balances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-secondary"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Transactions Loaded
          </p>
          <p className="mt-2 text-3xl font-bold">
            {transactions.length}
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Pending Transactions
          </p>
          <p className="mt-2 text-3xl font-bold">{pendingCount}</p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Failed / Reversed
          </p>
          <p className="mt-2 text-3xl font-bold">{failedCount}</p>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground">
            Completed Amount (Recorded)
          </p>
          <p className="mt-2 text-2xl font-bold">
            KSh {formatAmount(completedAmount)}
          </p>
        </div>
      </div>

      <div className="glass space-y-4 rounded-xl p-5">
        <div>
          <h2 className="font-semibold">Find Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Search by email, user ID, transaction ID or description.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
              className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border bg-background px-3 py-2.5 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-lg border bg-background px-3 py-2.5 text-sm"
          >
            <option value="all">All transaction types</option>
            {transactionTypes.map((type) => (
              <option key={type} value={type}>
                {formatType(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Showing {filteredTransactions.length} of{" "}
            {transactions.length} loaded transactions.
          </p>

          <button
            type="button"
            onClick={handleDeleteFiltered}
            disabled={filteredTransactions.length === 0 || isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            {isDeleting
              ? "Deleting..."
              : `Delete filtered (${filteredTransactions.length})`}
          </button>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Wallet Transaction Records
          </h2>
          <p className="text-sm text-muted-foreground">
            Includes transaction amounts and wallet balance changes.
          </p>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No transactions match your search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Balance Before</th>
                  <th className="px-4 py-3 font-medium">Balance After</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => {
                  const profile = getProfile(tx.profiles);
                  const amount = Number(tx.amount);

                  return (
                    <tr
                      key={tx.id}
                      className="transition hover:bg-secondary/20"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString("en-KE")}
                      </td>

                      <td className="px-4 py-3">
                        <p className="max-w-[190px] truncate">
                          {profile?.email || "Unknown user"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.user_id.slice(0, 8)}...
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-medium">
                        {formatType(tx.type)}
                      </td>

                      <td
                        className={`whitespace-nowrap px-4 py-3 font-semibold ${
                          amount > 0
                            ? "text-green-500"
                            : amount < 0
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {amount > 0 ? "+" : ""}
                        {formatAmount(amount)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                        {tx.balance_before == null
                          ? "—"
                          : formatAmount(tx.balance_before)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums">
                        {tx.balance_after == null
                          ? "—"
                          : formatAmount(tx.balance_after)}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(tx.status)}>
                          {formatType(tx.status)}
                        </Badge>
                      </td>

                      <td className="max-w-[220px] px-4 py-3 text-muted-foreground">
                        <span className="line-clamp-2">
                          {tx.description || "No description"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {transactions.length === 500 && (
        <p className="text-sm text-muted-foreground">
          Showing the latest 500 transactions. Older records may exist.
          Deletion applies only to matching records among these loaded
          transactions.
        </p>
      )}
    </div>
  );
}

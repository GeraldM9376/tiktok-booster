
"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  UserPlus,
} from "lucide-react";

export type OverviewData = {
  stats: {
    totalUsers: number;
    creators: number;
    earners: number;
    admins: number;
    walletBalance: number;
    pendingTopups: number;
    pendingWithdrawals: number;
    totalReferrals: number;
  };
  roleDistribution: { name: string; value: number }[];
  rankDistribution: { name: string; value: number }[];
  topupStatus: { name: string; value: number }[];
  withdrawalStatus: { name: string; value: number }[];
  transactionTypes: { name: string; value: number }[];
  activity: {
    date: string;
    registrations: number;
    transactions: number;
    referrals: number;
  }[];
  paymentActivity: {
    date: string;
    topups: number;
    withdrawals: number;
  }[];
  recentTransactions: {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    description: string | null;
  }[];
};

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#64748b",
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-KE").format(value || 0);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
  });

function EmptyChart({ message = "No activity recorded yet" }: { message?: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h2 className="font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export function OverviewCharts({ data }: { data: OverviewData }) {
  const [range, setRange] = useState<7 | 30 | 90>(30);

  const activity = useMemo(
    () => data.activity.slice(-range),
    [data.activity, range]
  );

  const paymentActivity = useMemo(
    () => data.paymentActivity.slice(-range),
    [data.paymentActivity, range]
  );

  const cards = [
    {
      title: "Total Users",
      value: data.stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      note: "Registered accounts",
    },
    {
      title: "Creators",
      value: data.stats.creators,
      icon: UserPlus,
      color: "text-purple-500",
      note: "Creator accounts",
    },
    {
      title: "Wallet Credits",
      value: data.stats.walletBalance,
      icon: Wallet,
      color: "text-emerald-500",
      note: "Available balances",
    },
    {
      title: "Pending Top-Ups",
      value: data.stats.pendingTopups,
      icon: ArrowDownToLine,
      color: "text-amber-500",
      note: "Awaiting review",
    },
    {
      title: "Pending Withdrawals",
      value: data.stats.pendingWithdrawals,
      icon: ArrowUpFromLine,
      color: "text-red-500",
      note: "Awaiting review",
    },
    {
      title: "Total Referrals",
      value: data.stats.totalReferrals,
      icon: TrendingUp,
      color: "text-cyan-500",
      note: "Recorded referrals",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Platform Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor users, payments, referrals and platform activity.
          </p>
        </div>

        <div className="flex rounded-lg border border-border bg-card p-1">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days)}
              className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                range === days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight">
                {formatNumber(card.value)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {card.note}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="User Activity Trends"
          subtitle={`Registrations, transactions and referrals over ${range} days`}
        >
          {activity.some(
            (item) =>
              item.registrations + item.transactions + item.referrals > 0
          ) ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  minTickGap={25}
                  fontSize={11}
                />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip labelFormatter={(label) => formatDate(String(label ?? ""))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  name="Registrations"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="referrals"
                  name="Referrals"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard
          title="Payment Activity"
          subtitle="Top-up credits versus withdrawal amounts"
        >
          {paymentActivity.some(
            (item) => item.topups + item.withdrawals > 0
          ) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={paymentActivity}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  minTickGap={25}
                  fontSize={11}
                />
                <YAxis fontSize={11} />
                <Tooltip labelFormatter={(label) => formatDate(String(label ?? ""))} />
                <Legend />
                <Bar
                  dataKey="topups"
                  name="Top-Ups"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="withdrawals"
                  name="Withdrawals"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard
          title="User Role Distribution"
          subtitle="Breakdown of registered account roles"
        >
          {data.roleDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.roleDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {data.roleDistribution.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No user roles found" />
          )}
        </ChartCard>

        <ChartCard
          title="Rank Distribution"
          subtitle="Users grouped by their assigned rank"
        >
          {data.rankDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.rankDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" allowDecimals={false} fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  fontSize={11}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  name="Users"
                  fill="#8b5cf6"
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No rank records found" />
          )}
        </ChartCard>

        <ChartCard
          title="Top-Up Status"
          subtitle="Distribution of top-up requests in the selected period"
        >
          {data.topupStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.topupStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.topupStatus.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard
          title="Withdrawal Status"
          subtitle="Distribution of withdrawal requests in the selected period"
        >
          {data.withdrawalStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.withdrawalStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.withdrawalStatus.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard
          title="Transaction Types"
          subtitle="Completed and other recorded wallet transaction types"
        >
          {data.transactionTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.transactionTypes}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  name="Transactions"
                  fill="#06b6d4"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard
          title="Platform Accounts"
          subtitle="Additional account statistics"
        >
          <div className="space-y-5 py-3">
            {[
              { label: "Creators", value: data.stats.creators },
              { label: "Earners", value: data.stats.earners },
              { label: "Administrators", value: data.stats.admins },
            ].map((item) => {
              const percentage =
                data.stats.totalUsers > 0
                  ? Math.min(
                      100,
                      (item.value / data.stats.totalUsers) * 100
                    )
                  : 0;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="font-semibold">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Recent Wallet Transactions"
        subtitle="Latest recorded wallet activity"
      >
        {data.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-3 py-3 font-medium">Transaction</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Amount</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="max-w-[220px] truncate px-3 py-3">
                      {transaction.description || transaction.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-3 capitalize">
                      {transaction.type.replaceAll("_", " ")}
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {formatNumber(transaction.amount)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs capitalize">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleString("en-KE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyChart message="No wallet transactions found" />
        )}
      </ChartCard>
    </div>
  );
}

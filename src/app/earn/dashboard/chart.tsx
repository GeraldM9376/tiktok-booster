// src/app/earn/dashboard/chart.tsx
"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DashboardChart({ data }: { data: { name: string; earnings: number }[] }) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.88 0.22 130)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="oklch(0.88 0.22 130)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="oklch(0.68 0.02 270)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="oklch(0.68 0.02 270)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.18 0.012 270)",
              border: "1px solid oklch(0.28 0.015 270)",
              borderRadius: "8px",
              color: "oklch(0.97 0.005 270)",
            }}
            labelStyle={{ color: "oklch(0.68 0.02 270)" }}
            formatter={(value: any) => [`${value ?? 0} credits`, "Earnings"]}
          />
          <Area
            type="monotone"
            dataKey="earnings"
            stroke="oklch(0.88 0.22 130)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorEarnings)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
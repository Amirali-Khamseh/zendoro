import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Habit } from "@/zustand/habbitStore";
import { getCompletionRate } from "@/lib/getCompletionRate";

interface HabitProgressChartProps {
  habits: Habit[];
}

const tooltipStyle = {
  background: "#0b1020",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
} as const;

const truncate = (value: string) =>
  value.length > 14 ? `${value.slice(0, 13)}…` : value;

export function HabitProgressChart({ habits }: HabitProgressChartProps) {
  if (habits.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-white/50">
        No habits yet, start tracking on the Habit Tracker page.
      </div>
    );
  }

  const data = habits.map((h) => ({
    name: h.name,
    rate: getCompletionRate(h),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
      >
        <CartesianGrid
          horizontal={false}
          stroke="rgba(255,255,255,0.08)"
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tickFormatter={truncate}
          tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: "#fff" }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
          formatter={(value) => [`${value}%`, "Completion"]}
        />
        <Bar dataKey="rate" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { TodoStatus } from "@/lib/dashboardStats";

interface TodoStatusChartProps {
  byStatus: Record<TodoStatus, number>;
  total: number;
}

// Colors mirror the status palette used across the app (see getStatusConfig).
const STATUS_COLORS: Record<TodoStatus, string> = {
  TODO: "#94a3b8", // slate
  "In Progress": "#f59e0b", // amber
  Done: "#10b981", // emerald
  Kill: "#ef4444", // red
};

const ORDER: TodoStatus[] = ["TODO", "In Progress", "Done", "Kill"];

const tooltipStyle = {
  background: "#0b1020",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
} as const;

export function TodoStatusChart({ byStatus, total }: TodoStatusChartProps) {
  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-white/50">
        No tasks yet, add some on the TODOs page.
      </div>
    );
  }

  const data = ORDER.map((status) => ({
    name: status,
    value: byStatus[status],
    color: STATUS_COLORS[status],
  })).filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#fff" }} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-white/70">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

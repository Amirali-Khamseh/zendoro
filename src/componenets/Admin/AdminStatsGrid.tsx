import { Users, ShieldCheck, Ban, UserPlus2, CheckSquare, Bell, Target, Trophy } from "lucide-react";
import { StatCard } from "@/componenets/Dashboard/StatCard";
import type { AdminStats } from "@/zustand/adminStore";

export function AdminStatsGrid({ stats }: { stats: AdminStats }) {
  const todosDone = stats.todos.byStatus["Done"] ?? 0;
  const goalsActive = stats.goals.byStatus["active"] ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      <StatCard
        icon={Users}
        label="Total Users"
        value={stats.users.total}
        sub={`${stats.users.newLast7Days} new in last 7 days`}
        accent="text-sky-400"
      />
      <StatCard
        icon={ShieldCheck}
        label="Admins"
        value={stats.users.admins}
        sub="with admin access"
        accent="text-fuchsia-400"
      />
      <StatCard
        icon={Ban}
        label="Blocked Users"
        value={stats.users.blocked}
        sub="cannot sign in"
        accent="text-red-400"
      />
      <StatCard
        icon={UserPlus2}
        label="New This Week"
        value={stats.users.newLast7Days}
        sub="signups in last 7 days"
        accent="text-emerald-400"
      />
      <StatCard
        icon={CheckSquare}
        label="Todos"
        value={stats.todos.total}
        sub={`${todosDone} marked done`}
        accent="text-amber-400"
      />
      <StatCard
        icon={Bell}
        label="Reminders"
        value={stats.reminders.total}
        sub={`${stats.reminders.completed} completed`}
        accent="text-cyan-400"
      />
      <StatCard
        icon={Target}
        label="Habits"
        value={stats.habits.total}
        sub="tracked across all users"
        accent="text-violet-400"
      />
      <StatCard
        icon={Trophy}
        label="Goals"
        value={stats.goals.total}
        sub={`${goalsActive} active`}
        accent="text-rose-400"
      />
    </div>
  );
}

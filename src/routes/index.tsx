import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Timer, CheckSquare, Bell, Target } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isAuthenticated } from "@/lib/authVerification";
import { useTodoStore } from "@/zustand/todoStore";
import { useReminderStore } from "@/zustand/reminderStore";
import { useHabitStore } from "@/zustand/habbitStore";
import { useModeStore } from "@/zustand/modeStore";
import {
  getTodoStats,
  getHabitStats,
  getUpcomingItems,
} from "@/lib/dashboardStats";
import { StatCard } from "@/componenets/Dashboard/StatCard";
import { TodoStatusChart } from "@/componenets/Dashboard/TodoStatusChart";
import { HabitProgressChart } from "@/componenets/Dashboard/HabitProgressChart";
import { UpcomingAgenda } from "@/componenets/Dashboard/UpcomingAgenda";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 md:p-5">
      <h2 className="mb-3 text-base font-semibold text-white md:mb-4 md:text-lg">
        {title}
      </h2>
      {children}
    </div>
  );
}

const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

function RouteComponent() {
  useDocumentTitle("Dashboard");

  const { todos, fetchTodos } = useTodoStore();
  const {
    reminders,
    fetchReminders,
    getTodayReminders,
    getOverdueReminders,
  } = useReminderStore();
  const { habits, fetchHabits } = useHabitStore();
  const { currentFocusSessionCount, fetchFocusSessionCount } =
    useModeStore() as {
      currentFocusSessionCount: number;
      fetchFocusSessionCount: () => void;
    };

  useEffect(() => {
    fetchTodos();
    fetchReminders();
    fetchHabits();
    fetchFocusSessionCount();
  }, [fetchTodos, fetchReminders, fetchHabits, fetchFocusSessionCount]);

  const todoStats = useMemo(() => getTodoStats(todos), [todos]);
  const habitStats = useMemo(() => getHabitStats(habits), [habits]);
  const upcoming = useMemo(
    () => getUpcomingItems(todos, reminders),
    [todos, reminders],
  );

  const todayReminders = getTodayReminders();
  const overdueReminders = getOverdueReminders();

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 overflow-x-hidden">
      <header className="mb-6 md:mb-8">
        <h1 className="mb-1 text-2xl font-bold text-white md:text-4xl">
          Dashboard
        </h1>
        <p className="text-sm text-white/70 md:text-base">
          {greeting()}, here's your overview for{" "}
          {format(new Date(), "EEEE, MMMM d")}
        </p>
      </header>

      {/* KPI summary */}
      <section className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Timer}
          label="Focus Sessions"
          value={currentFocusSessionCount}
          sub="completed today"
          accent="text-sky-400"
        />
        <StatCard
          icon={CheckSquare}
          label="Tasks Done"
          value={`${todoStats.done}/${todoStats.total}`}
          sub={`${todoStats.completionRate}% complete${
            todoStats.overdue > 0 ? ` · ${todoStats.overdue} overdue` : ""
          }`}
          accent="text-emerald-400"
        />
        <StatCard
          icon={Bell}
          label="Reminders Today"
          value={todayReminders}
          sub={
            overdueReminders > 0 ? `${overdueReminders} overdue` : "none overdue"
          }
          accent="text-amber-400"
        />
        <StatCard
          icon={Target}
          label="Habits Avg"
          value={`${habitStats.averageCompletion}%`}
          sub={`${habitStats.todayCompleted}/${habitStats.count} done today`}
          accent="text-fuchsia-400"
        />
      </section>

      {/* Charts */}
      <section className="mb-6 grid grid-cols-1 gap-4 md:mb-8 md:gap-6 lg:grid-cols-2">
        <Panel title="Task Status">
          <TodoStatusChart byStatus={todoStats.byStatus} total={todoStats.total} />
        </Panel>
        <Panel title="Weekly Habit Completion">
          <HabitProgressChart habits={habits} />
        </Panel>
      </section>

      {/* Upcoming & overdue */}
      <section>
        <Panel title="Upcoming & Overdue">
          <UpcomingAgenda items={upcoming} />
        </Panel>
      </section>
    </div>
  );
}

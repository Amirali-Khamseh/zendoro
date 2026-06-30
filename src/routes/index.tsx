import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Timer, CheckSquare, Bell, Target } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isAuthenticated } from "@/lib/authVerification";
import { useTodoStore } from "@/zustand/todoStore";
import { useReminderStore } from "@/zustand/reminderStore";
import { useHabitStore } from "@/zustand/habbitStore";
import { useGoalStore } from "@/zustand/goalStore";
import { useModeStore } from "@/zustand/modeStore";
import { getTodoStats, getHabitStats } from "@/lib/dashboardStats";
import { StatCard } from "@/componenets/Dashboard/StatCard";
import { TodoStatusChart } from "@/componenets/Dashboard/TodoStatusChart";
import { HabitProgressChart } from "@/componenets/Dashboard/HabitProgressChart";
import { UpcomingAgenda } from "@/componenets/Dashboard/UpcomingAgenda";
import { MiniReminderCalendar } from "@/componenets/Dashboard/MiniReminderCalendar";
import { GoalHero } from "@/componenets/Goals/GoalHero";
import { Skeleton } from "@/components/ui/skeleton";

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

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 overflow-x-hidden">
      {/* Header */}
      <header className="mb-6 md:mb-8 space-y-2">
        <Skeleton className="h-8 w-40 md:h-10" />
        <Skeleton className="h-4 w-64" />
      </header>

      {/* KPI cards */}
      <section className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </section>

      {/* Chart panels */}
      <section className="mb-6 grid grid-cols-1 gap-4 md:mb-8 md:gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5 space-y-4"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ))}
      </section>

      {/* Bottom panels */}
      <section className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5 space-y-4"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ))}
      </section>
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

  const { todos, fetchTodos, isLoading: todosLoading, hasInitialized: todosReady } = useTodoStore();
  const {
    reminders,
    fetchReminders,
    getTodayReminders,
    getOverdueReminders,
    isLoading: remindersLoading,
    hasInitialized: remindersReady,
  } = useReminderStore();
  const { habits, fetchHabits, isLoading: habitsLoading, hasInitialized: habitsReady } = useHabitStore();
  const { goals, fetchGoals, isLoading: goalsLoading, hasInitialized: goalsReady } = useGoalStore();
  const { currentFocusSessionCount, fetchFocusSessionCount } =
    useModeStore() as {
      currentFocusSessionCount: number;
      fetchFocusSessionCount: () => void;
    };

  useEffect(() => {
    fetchTodos();
    fetchReminders();
    fetchHabits();
    fetchGoals();
    fetchFocusSessionCount();
  }, [fetchTodos, fetchReminders, fetchHabits, fetchGoals, fetchFocusSessionCount]);

  const isLoading =
    (!todosReady && todosLoading) ||
    (!remindersReady && remindersLoading) ||
    (!habitsReady && habitsLoading) ||
    (!goalsReady && goalsLoading);

  const todoStats = useMemo(() => getTodoStats(todos), [todos]);
  const habitStats = useMemo(() => getHabitStats(habits), [habits]);

  const todayReminders = getTodayReminders();
  const overdueReminders = getOverdueReminders();

  if (isLoading) return <DashboardSkeleton />;

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

      {/* Goal in focus */}
      <section className="mb-6 md:mb-8">
        <GoalHero
          goals={goals}
          todos={todos}
          habits={habits}
          reminders={reminders}
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

      {/* Reminders calendar + upcoming todos, side by side */}
      <section className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <Panel title="Reminders Calendar">
          <MiniReminderCalendar reminders={reminders} />
        </Panel>
        <Panel title="Upcoming & Overdue">
          <UpcomingAgenda todos={todos} />
        </Panel>
      </section>
    </div>
  );
}

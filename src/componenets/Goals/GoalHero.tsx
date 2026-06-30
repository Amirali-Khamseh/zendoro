import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, Trophy } from "lucide-react";
import { GoalRing } from "./GoalRing";
import { progressForGoal } from "@/lib/goalProgress";
import type { Goal } from "@/zustand/goalStore";
import type { Todo } from "@/zustand/todoStore";
import type { Habit } from "@/zustand/habbitStore";
import type { Reminder } from "@/zustand/reminderStore";

interface GoalHeroProps {
  goals: Goal[];
  todos: Todo[];
  habits: Habit[];
  reminders: Reminder[];
}

// Pick the goal to spotlight: prefer active goals with the nearest target
// date; fall back to any active goal, then to whatever exists.
function pickSpotlight(goals: Goal[]): Goal | null {
  if (goals.length === 0) return null;
  const active = goals.filter((g) => g.status === "active");
  const pool = active.length ? active : goals;
  return [...pool].sort((a, b) => {
    const at = a.targetDate ? a.targetDate.getTime() : Infinity;
    const bt = b.targetDate ? b.targetDate.getTime() : Infinity;
    return at - bt;
  })[0];
}

export function GoalHero({ goals, todos, habits, reminders }: GoalHeroProps) {
  const goal = useMemo(() => pickSpotlight(goals), [goals]);
  const progress = useMemo(
    () => (goal ? progressForGoal(goal, todos, habits, reminders) : null),
    [goal, todos, habits, reminders],
  );

  // Empty state — nudge toward creating a goal.
  if (!goal || !progress) {
    return (
      <Link
        to="/goals"
        className="relative flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
          <Trophy className="h-5 w-5 text-white/40" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">No goals yet</p>
          <p className="text-xs text-white/50">
            Set a goal to track habits, tasks & reminders together
          </p>
        </div>
        <span className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-sky-300">
          Create goal <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    );
  }

  const segments = [
    {
      label: "tasks",
      value: progress.todos.total
        ? `${progress.todos.done}/${progress.todos.total}`
        : null,
      color: "bg-emerald-400",
    },
    {
      label: "habits",
      value: progress.habits.count
        ? `${Math.round(progress.habits.ratio * 100)}%`
        : null,
      color: "bg-fuchsia-400",
    },
    {
      label: "reminders",
      value: progress.reminders.total
        ? `${progress.reminders.done}/${progress.reminders.total}`
        : null,
      color: "bg-amber-400",
    },
  ].filter((s) => s.value !== null);

  return (
    <div className="relative flex items-center justify-center gap-5 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
      <GoalRing percent={progress.percent} size={76} />

      <div className="min-w-0 text-center">
        <div className="mb-1 flex items-center justify-center gap-2">
          <Trophy className="h-3.5 w-3.5 shrink-0 text-sky-300" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Goal in focus
          </span>
        </div>
        <h3 className="truncate text-lg font-bold text-white">{goal.title}</h3>

        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/55">
          {goal.targetDate && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              due {format(goal.targetDate, "MMM d")}
            </span>
          )}
          {segments.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${s.color}`} />
              {s.value} {s.label}
            </span>
          ))}
          {progress.isEmpty && (
            <span className="text-white/30">No items linked yet</span>
          )}
        </div>
      </div>

      <Link
        to="/goals"
        className="absolute right-5 top-4 flex items-center gap-1 text-xs font-medium text-sky-300 transition-colors hover:text-sky-200"
      >
        View all <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

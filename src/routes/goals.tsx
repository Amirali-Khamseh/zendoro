import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  Trophy,
  CalendarDays,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  CheckSquare,
  Repeat,
  Bell,
} from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isAuthenticated } from "@/lib/authVerification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoalStore, type Goal } from "@/zustand/goalStore";
import { useTodoStore } from "@/zustand/todoStore";
import { useHabitStore } from "@/zustand/habbitStore";
import { useReminderStore } from "@/zustand/reminderStore";
import { progressForGoal } from "@/lib/goalProgress";
import { GoalFormDialog } from "@/componenets/Goals/GoalFormDialog";

export const Route = createFileRoute("/goals")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

const STATUS_STYLES: Record<Goal["status"], string> = {
  active: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  archived: "bg-white/10 text-white/50 border-white/15",
};
const STATUS_DOT: Record<Goal["status"], string> = {
  active: "bg-sky-400",
  completed: "bg-emerald-400",
  archived: "bg-white/30",
};

function GoalRow({
  goal,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}) {
  const { updateGoal } = useGoalStore();
  const todos = useTodoStore((s) => s.todos);
  const habits = useHabitStore((s) => s.habits);
  const reminders = useReminderStore((s) => s.reminders);

  const progress = useMemo(
    () => progressForGoal(goal, todos, habits, reminders),
    [goal, todos, habits, reminders],
  );

  // Send the full current goal so a status-only change can't drop other
  // fields (the prod backend overwrites any field present in the payload).
  const toggleArchive = () =>
    updateGoal(goal.id, {
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate,
      status: goal.status === "archived" ? "active" : "archived",
      todoIds: goal.todoIds,
      habitIds: goal.habitIds,
      reminderIds: goal.reminderIds,
    });

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[goal.status]}`} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {goal.title}
            </p>
            {goal.description && (
              <p className="truncate text-xs text-white/50">
                {goal.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge
            variant="outline"
            className={`h-5 px-2 text-[10px] capitalize ${STATUS_STYLES[goal.status]}`}
          >
            {goal.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-white"
            title="Edit"
            onClick={() => onEdit(goal)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-white"
            title={goal.status === "archived" ? "Unarchive" : "Archive"}
            onClick={toggleArchive}
          >
            {goal.status === "archived" ? (
              <ArchiveRestore className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-red-400"
            title="Delete"
            onClick={() => onDelete(goal)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress.percent >= 100 ? "bg-emerald-400" : "bg-sky-400"
            }`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <span className="w-10 text-right text-sm font-semibold text-white">
          {progress.percent}%
        </span>
      </div>

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/50">
        {goal.targetDate && (
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            due {format(goal.targetDate, "MMM d, yyyy")}
          </span>
        )}
        {progress.todos.total > 0 && (
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3 w-3 text-emerald-400" />
            {progress.todos.done}/{progress.todos.total} tasks
          </span>
        )}
        {progress.habits.count > 0 && (
          <span className="flex items-center gap-1">
            <Repeat className="h-3 w-3 text-fuchsia-400" />
            {Math.round(progress.habits.ratio * 100)}% habits
          </span>
        )}
        {progress.reminders.total > 0 && (
          <span className="flex items-center gap-1">
            <Bell className="h-3 w-3 text-amber-400" />
            {progress.reminders.done}/{progress.reminders.total} reminders
          </span>
        )}
        {progress.isEmpty && (
          <span className="text-white/30">No items linked yet</span>
        )}
      </div>
    </div>
  );
}

function RouteComponent() {
  useDocumentTitle("Goals");

  const {
    goals,
    fetchGoals,
    deleteGoal,
    isLoading: goalsLoading,
    hasInitialized: goalsReady,
  } = useGoalStore();
  const { fetchTodos } = useTodoStore();
  const { fetchHabits } = useHabitStore();
  const { fetchReminders } = useReminderStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
    fetchTodos();
    fetchHabits();
    fetchReminders();
  }, [fetchGoals, fetchTodos, fetchHabits, fetchReminders]);

  const sorted = useMemo(
    () =>
      [...goals].sort((a, b) => {
        if (a.status !== b.status) {
          const order = { active: 0, completed: 1, archived: 2 } as const;
          return order[a.status] - order[b.status];
        }
        const at = a.targetDate ? a.targetDate.getTime() : Infinity;
        const bt = b.targetDate ? b.targetDate.getTime() : Infinity;
        return at - bt;
      }),
    [goals],
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (goal: Goal) => {
    setEditing(goal);
    setDialogOpen(true);
  };

  const isLoading = !goalsReady && goalsLoading;

  return (
    <div className="mx-auto max-w-4xl p-2 md:p-4">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
            <Trophy className="h-6 w-6 text-sky-300" />
            Goals
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Track your habits, tasks & reminders toward what matters.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" />
          New Goal
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-16 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm font-medium text-white">No goals yet</p>
          <p className="mt-1 text-xs text-white/50">
            Create a goal and link the habits, tasks, and reminders that drive
            it.
          </p>
          <Button onClick={openCreate} className="mt-4">
            <Plus className="mr-1.5 h-4 w-4" />
            New Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <GoalFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={editing}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title}" will be removed. Your linked tasks, habits,
              and reminders are kept — only the goal and its links are deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteGoal(deleting.id);
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

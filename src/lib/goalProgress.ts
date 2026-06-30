import type { Todo } from "@/zustand/todoStore";
import type { Habit } from "@/zustand/habbitStore";
import type { Reminder } from "@/zustand/reminderStore";
import type { Goal } from "@/zustand/goalStore";

export type GoalProgress = {
  percent: number; // 0–100, the headline number
  todos: { done: number; total: number };
  reminders: { done: number; total: number };
  habits: { ratio: number; count: number }; // avg weekly ratio across habits
  isEmpty: boolean; // no trackable items linked yet
};

/**
 * Derives a goal's progress from its linked items. Each unit (one todo, one
 * reminder, one habit) is weighted equally:
 *  - a todo counts as done when its status is "Done" ("Kill" is excluded
 *    from the denominator entirely — abandoned, not pending),
 *  - a reminder counts when completed,
 *  - a habit contributes its current-week ratio (0–1), since a habit is never
 *    truly "done" — it's recurring.
 *
 * Pass the items already filtered to this goal.
 */
export function computeGoalProgress(
  todos: Todo[],
  habits: Habit[],
  reminders: Reminder[],
): GoalProgress {
  const liveTodos = todos.filter((t) => t.status !== "Kill");
  const todosDone = liveTodos.filter((t) => t.status === "Done").length;
  const remindersDone = reminders.filter((r) => r.completed).length;

  const habitRatios = habits.map(
    (h) => h.completions.filter(Boolean).length / 7,
  );
  const habitScore = habitRatios.reduce((sum, r) => sum + r, 0);

  const completed = todosDone + remindersDone + habitScore;
  const total = liveTodos.length + reminders.length + habits.length;

  return {
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    todos: { done: todosDone, total: liveTodos.length },
    reminders: { done: remindersDone, total: reminders.length },
    habits: {
      ratio: habits.length ? habitScore / habits.length : 0,
      count: habits.length,
    },
    isEmpty: total === 0,
  };
}

/**
 * Resolves a goal's linked item ids against the full store collections and
 * returns its computed progress. Habit ids may be integers (prod) or UUID
 * strings (mock), so they're matched by string.
 */
export function progressForGoal(
  goal: Goal,
  todos: Todo[],
  habits: Habit[],
  reminders: Reminder[],
): GoalProgress {
  const habitIdSet = new Set(goal.habitIds.map(String));
  return computeGoalProgress(
    todos.filter((t) => goal.todoIds.includes(t.id)),
    habits.filter((h) => habitIdSet.has(String(h.id))),
    reminders.filter((r) => goal.reminderIds.includes(r.id)),
  );
}

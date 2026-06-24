import type { Todo } from "@/zustand/todoStore";
import type { Reminder } from "@/zustand/reminderStore";
import type { Habit } from "@/zustand/habbitStore";
import { getCompletionRate } from "@/lib/getCompletionRate";

export type TodoStatus = Todo["status"];

export interface TodoStats {
  total: number;
  byStatus: Record<TodoStatus, number>;
  done: number;
  completionRate: number; // 0-100
  overdue: number;
  dueToday: number;
}

export interface HabitStats {
  count: number;
  averageCompletion: number; // 0-100
  todayCompleted: number; // habits checked off for today
}

export interface UpcomingItem {
  id: string;
  type: "todo" | "reminder";
  title: string;
  date: Date; // date (+ time for reminders), used for sorting/display
  overdue: boolean;
  meta?: string; // e.g. reminder time, todo status
}

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const combineDateTime = (date: Date, time?: string): Date => {
  const d = new Date(date);
  if (time) {
    const [h, m] = time.split(":").map(Number);
    d.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  }
  return d;
};

// A todo is "active" (still actionable) when it isn't Done or Killed.
const isActiveTodo = (todo: Todo): boolean =>
  todo.status !== "Done" && todo.status !== "Kill";

export const getTodoStats = (todos: Todo[]): TodoStats => {
  const byStatus: Record<TodoStatus, number> = {
    TODO: 0,
    "In Progress": 0,
    Done: 0,
    Kill: 0,
  };

  const today = startOfToday();
  let overdue = 0;
  let dueToday = 0;

  for (const todo of todos) {
    byStatus[todo.status] += 1;
    if (todo.dueDate && isActiveTodo(todo)) {
      if (todo.dueDate < today) overdue += 1;
      else if (isSameDay(todo.dueDate, today)) dueToday += 1;
    }
  }

  const total = todos.length;
  const done = byStatus.Done;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, byStatus, done, completionRate, overdue, dueToday };
};

export const getHabitStats = (habits: Habit[]): HabitStats => {
  const count = habits.length;
  if (count === 0) {
    return { count: 0, averageCompletion: 0, todayCompleted: 0 };
  }

  // completions array is Mon-Sun; JS getDay() has Sun=0, so shift to Mon=0.
  const todayIndex = (new Date().getDay() + 6) % 7;
  const totalRate = habits.reduce((sum, h) => sum + getCompletionRate(h), 0);
  const todayCompleted = habits.filter((h) => h.completions[todayIndex]).length;

  return {
    count,
    averageCompletion: Math.round(totalRate / count),
    todayCompleted,
  };
};

export const getUpcomingItems = (
  todos: Todo[],
  reminders: Reminder[],
): UpcomingItem[] => {
  const today = startOfToday();
  const items: UpcomingItem[] = [];

  for (const todo of todos) {
    if (!todo.dueDate || !isActiveTodo(todo)) continue;
    const day = new Date(todo.dueDate);
    day.setHours(0, 0, 0, 0);
    items.push({
      id: `todo-${todo.id}`,
      type: "todo",
      title: todo.title,
      date: todo.dueDate,
      overdue: day < today,
      meta: todo.status,
    });
  }

  for (const reminder of reminders) {
    if (reminder.completed) continue;
    const day = new Date(reminder.date);
    day.setHours(0, 0, 0, 0);
    items.push({
      id: `reminder-${reminder.id}`,
      type: "reminder",
      title: reminder.title,
      date: combineDateTime(reminder.date, reminder.time),
      overdue: day < today,
      meta: reminder.time,
    });
  }

  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
};

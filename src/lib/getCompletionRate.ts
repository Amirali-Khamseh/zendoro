import type { Habit } from "@/zustand/habbitStore";

export const getCompletionRate = (habit: Habit) => {
  const completed = habit.completions.filter(Boolean).length;
  return Math.round((completed / 7) * 100);
};

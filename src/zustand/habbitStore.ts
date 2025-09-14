import { create } from "zustand";

export type Habit = {
  id: string;
  name: string;
  completions: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
};

type HabitStore = {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updated: Habit) => void;
  deleteHabit: (id: string) => void;
  clearHabit: () => void;
};

export const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  addHabit: (habit) =>
    set((state) => ({
      habits: [...state.habits, habit],
    })),
  updateHabit: (id, updated) =>
    set((state) => ({
      habits: state.habits.map((habit) => (habit.id === id ? updated : habit)),
    })),
  deleteHabit: (id) =>
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== id),
    })),
  clearHabit: () => set({ habits: [] }),
}));

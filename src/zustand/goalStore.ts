import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { create } from "zustand";

export type GoalStatus = "active" | "completed" | "archived";

export type Goal = {
  id: number;
  title: string;
  description?: string | null;
  targetDate: Date | null;
  status: GoalStatus;
  // Ids of the items linked to this goal (many-to-many). Habit ids may be
  // integers (prod backend) or UUID strings (local mock), so allow both.
  todoIds: number[];
  habitIds: Array<number | string>;
  reminderIds: number[];
  userId?: number;
};

type ApiGoal = {
  id: number;
  title: string;
  description?: string | null;
  targetDate: string | null;
  status: GoalStatus;
  todoIds: number[];
  habitIds: Array<number | string>;
  reminderIds: number[];
  userId?: number;
};

export type GoalInput = {
  title: string;
  description?: string | null;
  targetDate?: Date | null;
  status?: GoalStatus;
  todoIds?: number[];
  habitIds?: Array<number | string>;
  reminderIds?: number[];
};

const serializeDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const fromApi = (g: ApiGoal): Goal => ({
  id: Number(g.id),
  title: g.title,
  description: g.description ?? null,
  targetDate: g.targetDate ? new Date(g.targetDate) : null,
  status: g.status,
  todoIds: g.todoIds ?? [],
  habitIds: g.habitIds ?? [],
  reminderIds: g.reminderIds ?? [],
  userId: g.userId,
});

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

const toBody = (input: GoalInput) => ({
  ...input,
  targetDate: input.targetDate ? serializeDate(input.targetDate) : null,
});

type GoalStore = {
  goals: Goal[];
  isLoading: boolean;
  hasInitialized: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: GoalInput) => Promise<void>;
  updateGoal: (id: number, updates: GoalInput) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  clearGoals: () => void;
  getGoalById: (id: number) => Goal | undefined;
};

export const useGoalStore = create<GoalStore>()((set, get) => ({
  goals: [],
  isLoading: false,
  hasInitialized: false,

  fetchGoals: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/goal`, {
        method: "GET",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch goals");
      const data: ApiGoal[] = await res.json();
      set({
        goals: data.map(fromApi),
        isLoading: false,
        hasInitialized: true,
      });
    } catch (e) {
      console.error("Error fetching goals:", e);
      set({ goals: [], isLoading: false, hasInitialized: true });
    }
  },

  addGoal: async (goal) => {
    try {
      const res = await fetch(`${API_BASE_URL}/goal`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(toBody(goal)),
      });
      if (!res.ok) throw new Error("Failed to create goal");
      const created = fromApi(await res.json());
      set((state) => ({ goals: [...state.goals, created] }));
    } catch (e) {
      console.error("Error creating goal:", e);
      throw e;
    }
  },

  updateGoal: async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/goal/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(toBody(updates)),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      const updated = fromApi(await res.json());
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? updated : g)),
      }));
    } catch (e) {
      console.error("Error updating goal:", e);
      throw e;
    }
  },

  deleteGoal: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/goal/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete goal");
      set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
    } catch (e) {
      console.error("Error deleting goal:", e);
      throw e;
    }
  },

  clearGoals: () => set({ goals: [], hasInitialized: false }),
  getGoalById: (id) => get().goals.find((g) => g.id === id),
}));

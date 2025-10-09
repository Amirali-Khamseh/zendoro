import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Habit = {
  id: string;
  name: string;
  completions: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
};

type HabitStore = {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  addHabit: (habit: Omit<Habit, "id">) => Promise<void>;
  updateHabit: (id: string, updated: Omit<Habit, "id">) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  clearHabit: () => void;
  fetchHabits: () => Promise<void>;
  initialize: () => Promise<void>;
};

const getHabits = async (): Promise<Habit[]> => {
  try {
    const authToken = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const result = await fetch(`${API_BASE_URL}/hobby`, {
      method: "GET",
      headers,
    });
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }
    return (await result.json()) as Habit[];
  } catch (error) {
    console.error("Failed to fetch habits:", error);
    throw error;
  }
};

const createHabitAPI = async (habit: Omit<Habit, "id">): Promise<Habit> => {
  try {
    const authToken = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const result = await fetch(`${API_BASE_URL}/hobby`, {
      method: "POST",
      headers,
      body: JSON.stringify(habit),
    });
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }
    return (await result.json()) as Habit;
  } catch (error) {
    console.error("Failed to create habit:", error);
    throw error;
  }
};

const updateHabitAPI = async (
  id: string,
  habit: Omit<Habit, "id">,
): Promise<Habit> => {
  try {
    const authToken = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const result = await fetch(`${API_BASE_URL}/hobby/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(habit),
    });
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }
    return (await result.json()) as Habit;
  } catch (error) {
    console.error("Failed to update habit:", error);
    throw error;
  }
};

const deleteHabitAPI = async (id: string): Promise<void> => {
  try {
    const authToken = getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const result = await fetch(`${API_BASE_URL}/hobby/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }
  } catch (error) {
    console.error("Failed to delete habit:", error);
    throw error;
  }
};
export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      isLoading: false,
      error: null,
      addHabit: async (habit) => {
        set({ isLoading: true, error: null });
        try {
          const newHabit = await createHabitAPI(habit);
          set((state) => ({
            habits: [...state.habits, newHabit],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to create habit",
            isLoading: false,
          });
        }
      },
      updateHabit: async (id, updated) => {
        set({ isLoading: true, error: null });
        try {
          const updatedHabit = await updateHabitAPI(id, updated);
          set((state) => ({
            habits: state.habits.map((habit) =>
              habit.id === id ? updatedHabit : habit,
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update habit",
            isLoading: false,
          });
        }
      },
      deleteHabit: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await deleteHabitAPI(id);
          set((state) => ({
            habits: state.habits.filter((habit) => habit.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete habit",
            isLoading: false,
          });
        }
      },
      clearHabit: () => set({ habits: [] }),
      fetchHabits: async () => {
        set({ isLoading: true, error: null });
        try {
          const habits = await getHabits();
          set({ habits, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch habits",
            isLoading: false,
          });
        }
      },
      initialize: async () => {
        try {
          const habits = await getHabits();
          set({ habits, isLoading: false, error: null });
        } catch (error) {
          console.error("Failed to initialize habits:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize habits",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "habit-storage",
    },
  ),
);

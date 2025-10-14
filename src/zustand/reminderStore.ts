import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { create } from "zustand";

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  date: Date;
  time: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  userId?: number;
}

type ApiReminder = {
  id: number;
  title: string;
  description?: string | null;
  date: string | null;
  time: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  userId?: number;
};

// Helpers to avoid timezone-related off-by-one date issues
const serializeDateForApi = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDateFromApi = (value: string | null): Date => {
  if (!value) return new Date();
  if (value.includes("T")) return new Date(value);
  const [y, m, d] = value.split("-").map((v) => Number(v));
  if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

interface ReminderStore {
  reminders: Reminder[];
  selectedDate: Date;
  showForm: boolean;
  editingReminder: Reminder | null;
  deletingReminder: Reminder | null;

  // Actions
  fetchReminders: () => Promise<void>;
  addReminder: (reminder: Omit<Reminder, "id" | "userId">) => Promise<void>;
  updateReminder: (
    id: number,
    updates: Partial<Omit<Reminder, "id" | "userId">>,
  ) => Promise<void>;
  deleteReminder: (id: number) => Promise<void>;
  confirmDelete: () => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setShowForm: (show: boolean) => void;
  setEditingReminder: (reminder: Reminder | null) => void;
  setDeletingReminder: (reminder: Reminder | null) => void;

  // Computed values
  getTotalReminders: () => number;
  getCompletedReminders: () => number;
  getTodayReminders: () => number;
  getOverdueReminders: () => number;
  getRemindersByDate: (date: Date) => Reminder[];
}

export const useReminderStore = create<ReminderStore>()((set, get) => ({
  reminders: [],
  selectedDate: new Date(),
  showForm: false,
  editingReminder: null,
  deletingReminder: null,

  fetchReminders: async () => {
    try {
      const authToken = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };
      const res = await fetch(`${API_BASE_URL}/reminder`, {
        method: "GET",
        headers,
      });
      if (!res.ok) throw new Error("Failed to fetch reminders");
      const data: ApiReminder[] = await res.json();
      const reminders: Reminder[] = data.map((r) => ({
        id: Number(r.id),
        title: r.title,
        description: r.description ?? undefined,
        date: parseDateFromApi(r.date),
        time: r.time,
        priority: r.priority,
        completed: r.completed,
        userId: r.userId,
      }));
      set({ reminders });
    } catch (e) {
      console.error("Error fetching reminders", e);
      set({ reminders: [] });
    }
  },

  addReminder: async (reminder) => {
    try {
      const authToken = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };
      const res = await fetch(`${API_BASE_URL}/reminder`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...reminder,
          date: reminder.date ? serializeDateForApi(reminder.date) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to add reminder");
      const data: ApiReminder = await res.json();
      const created: Reminder = {
        id: Number(data.id),
        title: data.title,
        description: data.description ?? undefined,
        date: parseDateFromApi(data.date),
        time: data.time,
        priority: data.priority,
        completed: data.completed,
        userId: data.userId,
      };
      set((state) => ({
        reminders: [...state.reminders, created],
        showForm: false,
      }));
    } catch (e) {
      console.error("Error adding reminder", e);
      throw e;
    }
  },

  updateReminder: async (id, updates) => {
    try {
      const authToken = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };
      const res = await fetch(`${API_BASE_URL}/reminder/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          ...updates,
          date: updates.date ? serializeDateForApi(updates.date) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update reminder");
      const data: ApiReminder = await res.json();
      const updated: Reminder = {
        id: Number(data.id),
        title: data.title,
        description: data.description ?? undefined,
        date: parseDateFromApi(data.date),
        time: data.time,
        priority: data.priority,
        completed: data.completed,
        userId: data.userId,
      };
      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? updated : r)),
        editingReminder: null,
        showForm: false,
      }));
    } catch (e) {
      console.error("Error updating reminder", e);
      throw e;
    }
  },

  deleteReminder: async (id) => {
    const reminder = get().reminders.find((r) => r.id === id) || null;
    set({ deletingReminder: reminder });
  },

  confirmDelete: async () => {
    const { deletingReminder } = get();
    if (!deletingReminder) return;
    try {
      const authToken = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };
      const res = await fetch(
        `${API_BASE_URL}/reminder/${deletingReminder.id}`,
        {
          method: "DELETE",
          headers,
        },
      );
      if (!res.ok) throw new Error("Failed to delete reminder");
      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== deletingReminder.id),
        deletingReminder: null,
      }));
    } catch (e) {
      console.error("Error deleting reminder", e);
      throw e;
    }
  },

  toggleComplete: async (id) => {
    const reminder = get().reminders.find((r) => r.id === id);
    if (!reminder) return;
    await get().updateReminder(id, { completed: !reminder.completed });
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  setShowForm: (show) => set({ showForm: show }),
  setEditingReminder: (reminder) => set({ editingReminder: reminder }),
  setDeletingReminder: (reminder) => set({ deletingReminder: reminder }),

  // Computed values
  getTotalReminders: () => get().reminders.length,
  getCompletedReminders: () =>
    get().reminders.filter((r) => r.completed).length,
  getTodayReminders: () => {
    const today = new Date().toDateString();
    return get().reminders.filter((r) => r.date.toDateString() === today)
      .length;
  },
  getOverdueReminders: () => {
    const today = new Date();
    const todayString = today.toDateString();
    return get().reminders.filter(
      (r) =>
        !r.completed && r.date < today && r.date.toDateString() !== todayString,
    ).length;
  },
  getRemindersByDate: (date) => {
    return get().reminders.filter(
      (reminder) => reminder.date.toDateString() === date.toDateString(),
    );
  },
}));

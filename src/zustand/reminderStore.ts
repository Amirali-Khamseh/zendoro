import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
}

interface ReminderStore {
  reminders: Reminder[];
  selectedDate: Date;
  showForm: boolean;
  editingReminder: Reminder | null;
  deletingReminder: Reminder | null;

  // Actions
  addReminder: (reminder: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  confirmDelete: () => void;
  toggleComplete: (id: string) => void;
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

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      reminders: [],
      selectedDate: new Date(),
      showForm: false,
      editingReminder: null,
      deletingReminder: null,

      addReminder: (reminder) => {
        const newReminder: Reminder = {
          ...reminder,
          id: Date.now().toString(),
        };
        set((state) => ({
          reminders: [...state.reminders, newReminder],
          showForm: false,
        }));
      },

      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, ...updates } : reminder,
          ),
          editingReminder: null,
          showForm: false,
        }));
      },

      deleteReminder: (id) => {
        const reminder = get().reminders.find((r) => r.id === id);
        if (reminder) {
          set({ deletingReminder: reminder });
        }
      },

      confirmDelete: () => {
        const { deletingReminder } = get();
        if (deletingReminder) {
          set((state) => ({
            reminders: state.reminders.filter(
              (reminder) => reminder.id !== deletingReminder.id,
            ),
            deletingReminder: null,
          }));
        }
      },

      toggleComplete: (id) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id
              ? { ...reminder, completed: !reminder.completed }
              : reminder,
          ),
        }));
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
            !r.completed &&
            r.date < today &&
            r.date.toDateString() !== todayString,
        ).length;
      },
      getRemindersByDate: (date) => {
        return get().reminders.filter(
          (reminder) => reminder.date.toDateString() === date.toDateString(),
        );
      },
    }),
    {
      name: "reminder-storage",
      // Custom serialization to handle Date objects
      serialize: (state) =>
        JSON.stringify({
          ...state.state,
          reminders: state.state.reminders.map((r) => ({
            ...r,
            date: r.date.toISOString(),
          })),
          selectedDate: state.state.selectedDate.toISOString(),
        }),
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          reminders: parsed.reminders.map((r: any) => ({
            ...r,
            date: new Date(r.date),
          })),
          selectedDate: new Date(parsed.selectedDate),
        };
      },
    },
  ),
);

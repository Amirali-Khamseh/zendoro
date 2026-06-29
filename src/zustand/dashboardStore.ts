import { create } from "zustand";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import type { Todo } from "./todoStore";
import type { Reminder } from "./reminderStore";

// The dashboard keeps its own copy of date-scoped data so the date filter never
// pollutes the shared todo/reminder stores used by the Todo and Reminder pages.

export type DashboardPreset = "all" | "today" | "7d" | "month" | "custom";

export interface DateRange {
  from: Date | null; // null = unbounded
  to: Date | null;
}

type ApiTodo = Omit<Todo, "dueDate"> & { dueDate: string | null };

type ApiReminder = {
  id: number;
  title: string;
  description?: string | null;
  date: string | null;
  time: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  todoId?: number | null;
  userId?: number;
};

const toYmd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseReminderDate = (value: string | null): Date => {
  if (!value) return new Date();
  if (value.includes("T")) return new Date(value);
  const [y, m, d] = value.split("-").map((v) => Number(v));
  if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

export const rangeForPreset = (preset: DashboardPreset): DateRange => {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7d":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "all":
    case "custom":
    default:
      return { from: null, to: null };
  }
};

const buildRangeQuery = (range: DateRange): string => {
  const params = new URLSearchParams();
  if (range.from) params.set("from", toYmd(range.from));
  if (range.to) params.set("to", toYmd(range.to));
  const s = params.toString();
  return s ? `?${s}` : "";
};

interface DashboardStore {
  preset: DashboardPreset;
  range: DateRange;
  todos: Todo[];
  reminders: Reminder[];
  focusSessionCount: number;
  isLoading: boolean;
  hasInitialized: boolean;
  setRange: (preset: DashboardPreset, custom?: DateRange) => void;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>()((set, get) => ({
  preset: "all",
  range: rangeForPreset("all"),
  todos: [],
  reminders: [],
  focusSessionCount: 0,
  isLoading: false,
  hasInitialized: false,

  setRange: (preset, custom) => {
    const range =
      preset === "custom" && custom ? custom : rangeForPreset(preset);
    set({ preset, range });
    void get().fetchDashboard();
  },

  fetchDashboard: async () => {
    set({ isLoading: true });
    const { preset, range } = get();
    const q = buildRangeQuery(range);
    // Todos/reminders with no range return everything (incl. items without a
    // date). The session-count endpoint, however, defaults to *today* when
    // unbounded — so for "all time" we request an open-ended range to get the
    // all-time total instead.
    const sessionQ = preset === "all" ? "?from=1970-01-01" : q;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    };
    try {
      const [todosRes, remindersRes, sessionRes] = await Promise.all([
        fetch(`${API_BASE_URL}/todo${q}`, { headers }),
        fetch(`${API_BASE_URL}/reminder${q}`, { headers }),
        fetch(`${API_BASE_URL}/timer/session-count${sessionQ}`, { headers }),
      ]);

      const todosData: ApiTodo[] = todosRes.ok ? await todosRes.json() : [];
      const remindersData: ApiReminder[] = remindersRes.ok
        ? await remindersRes.json()
        : [];
      const sessionData = sessionRes.ok
        ? await sessionRes.json()
        : { data: { sessionCount: 0 } };

      const todos: Todo[] = todosData.map((t) => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
      }));
      const reminders: Reminder[] = remindersData.map((r) => ({
        id: Number(r.id),
        title: r.title,
        description: r.description ?? undefined,
        date: parseReminderDate(r.date),
        time: r.time,
        priority: r.priority,
        completed: r.completed,
        todoId: r.todoId ?? null,
        userId: r.userId,
      }));

      set({
        todos,
        reminders,
        focusSessionCount: sessionData?.data?.sessionCount ?? 0,
        isLoading: false,
        hasInitialized: true,
      });
    } catch (e) {
      console.error("Error fetching dashboard data", e);
      set({ isLoading: false, hasInitialized: true });
    }
  },
}));

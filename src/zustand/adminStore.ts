import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { create } from "zustand";

export type AdminStats = {
  users: { total: number; admins: number; blocked: number; newLast7Days: number };
  todos: { total: number; byStatus: Record<string, number> };
  reminders: { total: number; completed: number };
  habits: { total: number };
  goals: { total: number; byStatus: Record<string, number> };
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
  todoCount: number;
};

const authHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${getAuthToken()}`,
  "Content-Type": "application/json",
});

type AdminStore = {
  stats: AdminStats | null;
  users: AdminUser[];
  isLoading: boolean;
  hasInitialized: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  addUser: (input: {
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  deleteUser: (id: number) => Promise<{ ok: boolean; error?: string }>;
  setUserBlocked: (
    id: number,
    blocked: boolean
  ) => Promise<{ ok: boolean; error?: string }>;
  sendPasswordReset: (
    id: number
  ) => Promise<{ ok: boolean; email?: string; code?: string; error?: string }>;
};

export const useAdminStore = create<AdminStore>()((set, get) => ({
  stats: null,
  users: [],
  isLoading: false,
  hasInitialized: false,
  error: null,

  fetchStats: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load stats");
      const stats: AdminStats = await res.json();
      set({ stats });
    } catch (e) {
      console.error("Error fetching admin stats:", e);
      set({ error: "Failed to load platform statistics." });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load users");
      const users: AdminUser[] = await res.json();
      set({ users, isLoading: false, hasInitialized: true });
    } catch (e) {
      console.error("Error fetching users:", e);
      set({
        isLoading: false,
        hasInitialized: true,
        error: "Failed to load users.",
      });
    }
  },

  addUser: async (input) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.message ?? "Failed to add user" };
      }
      const user: AdminUser = await res.json();
      set({ users: [{ ...user, todoCount: 0 }, ...get().users] });
      get().fetchStats();
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to add user" };
    }
  },

  deleteUser: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.message ?? "Failed to delete user" };
      }
      set({ users: get().users.filter((u) => u.id !== id) });
      get().fetchStats();
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to delete user" };
    }
  },

  setUserBlocked: async (id, blocked) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/block`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ blocked }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.message ?? "Failed to update user" };
      }
      const updated: AdminUser = await res.json();
      set({
        users: get().users.map((u) =>
          u.id === id ? { ...u, isBlocked: updated.isBlocked } : u
        ),
      });
      get().fetchStats();
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to update user" };
    }
  },

  sendPasswordReset: async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/users/${id}/reset-password`,
        { method: "POST", headers: authHeaders() }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.message ?? "Failed to send reset code" };
      }
      const data = await res.json();
      return { ok: true, email: data.email, code: data.code };
    } catch {
      return { ok: false, error: "Failed to send reset code" };
    }
  },
}));

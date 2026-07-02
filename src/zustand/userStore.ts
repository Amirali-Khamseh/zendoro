import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { create } from "zustand";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
};

const authHeader = (): HeadersInit => ({
  Authorization: `Bearer ${getAuthToken()}`,
});

type UserStore = {
  user: CurrentUser | null;
  isLoading: boolean;
  hasInitialized: boolean;
  fetchMe: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
  deleteAccount: (password: string) => Promise<{ ok: boolean; error?: string }>;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  isLoading: false,
  hasInitialized: false,

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/user/me`, {
        method: "GET",
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const user: CurrentUser = await res.json();
      set({ user, isLoading: false, hasInitialized: true });
    } catch (e) {
      console.error("Error fetching current user:", e);
      set({ isLoading: false, hasInitialized: true });
    }
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: "POST",
      headers: authHeader(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Failed to upload avatar");
    }
    const { avatarUrl } = await res.json();
    const current = get().user;
    if (current) set({ user: { ...current, avatarUrl } });
  },

  removeAvatar: async () => {
    const res = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to remove avatar");
    const current = get().user;
    if (current) set({ user: { ...current, avatarUrl: null } });
  },

  deleteAccount: async (password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/me`, {
        method: "DELETE",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.error ?? "Failed to delete account" };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to delete account" };
    }
  },

  clearUser: () => set({ user: null, hasInitialized: false }),
}));

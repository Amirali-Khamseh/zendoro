import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { create } from "zustand";

export type DailyActivityMetrics = Record<string, number>;

export interface DailyActivityPayload {
  date: string;
  steps?: number;
  heartRateAvg?: number;
  workoutMinutes?: number;
  distanceKm?: number;
  caloriesBurned?: number;
  sleepMinutes?: number;
  metrics?: DailyActivityMetrics;
}

export interface DailyActivityRecord extends DailyActivityPayload {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

type UpsertDailyActivityResponse = {
  message: string;
  data: DailyActivityRecord;
};

type DailyActivityStore = {
  isSubmitting: boolean;
  submitError: string | null;
  lastSavedActivity: DailyActivityRecord | null;
  lastMessage: string | null;
  submitDailyActivity: (payload: DailyActivityPayload) => Promise<void>;
  clearSubmitState: () => void;
};

export const useDailyActivityStore = create<DailyActivityStore>()((set) => ({
  isSubmitting: false,
  submitError: null,
  lastSavedActivity: null,
  lastMessage: null,

  submitDailyActivity: async (payload) => {
    set({ isSubmitting: true, submitError: null, lastMessage: null });
    try {
      const authToken = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      const res = await fetch(`${API_BASE_URL}/activity/daily`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const body = (await res.json()) as Partial<UpsertDailyActivityResponse> & {
        error?: string;
      };

      if (!res.ok) {
        throw new Error(body.error ?? "Failed to save daily activity");
      }

      set({
        isSubmitting: false,
        submitError: null,
        lastSavedActivity: body.data ?? null,
        lastMessage: body.message ?? "Daily activity saved",
      });
    } catch (error) {
      set({
        isSubmitting: false,
        submitError:
          error instanceof Error ? error.message : "Failed to save daily activity",
      });
      throw error;
    }
  },

  clearSubmitState: () =>
    set({
      submitError: null,
      lastMessage: null,
    }),
}));

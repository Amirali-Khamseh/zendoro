import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { create } from "zustand";

export const modeName = {
  standard: "Standard",
  extended: "Extended",
  longRun: "Long run",
} as const;

export type ModeNameType = (typeof modeName)[keyof typeof modeName];

export type ZendoroModeType = {
  name?: ModeNameType;
  focusTime: number;
  shortBreak: number;
  longBreak: number;
};

const sendModeToAPI = async (mode: ZendoroModeType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/timer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(mode),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("API Response:", response);
    return await response.json();
  } catch (error) {
    console.error("Failed to send mode to API:", error);
    throw error;
  }
};

const getModes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/timer`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const modifiedResult = result.map((mode: ZendoroModeType) => {
      return {
        name: mode.name,
        focusTime: mode.focusTime,
        shortBreak: mode.shortBreak,
        longBreak: mode.longBreak,
      };
    });

    return modifiedResult as ZendoroModeType[];
  } catch (error) {
    console.error("Failed to fetch modes from API:", error);
    throw error;
  }
};
const getCurrentFocusSessionCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/timer/session-count`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data.sessionCount || 0;
  } catch (error) {
    console.error("Failed to fetch focus session count from API:", error);
    throw error;
  }
};

export const useModeStore = create((set) => {
  // fetch initial focus session count asynchronously and populate the store
  getCurrentFocusSessionCount()
    .then((count) => {
      set({ currentFocusSessionCount: count });
    })
    .catch((error) =>
      console.error("Failed to fetch initial focus session count:", error),
    );

  return {
    availableModes: [],
    currentMode: null,
    isLoading: false,
    // initialize with a sensible default (number) instead of a Promise
    currentFocusSessionCount: 0,

    // action to refresh the count on demand
    fetchFocusSessionCount: async () => {
      try {
        const count = await getCurrentFocusSessionCount();
        set({ currentFocusSessionCount: count });
      } catch (error) {
        console.error("Failed to fetch focus session count:", error);
      }
    },

    fetchAvailableModes: async () => {
      set({ isLoading: true });
      const modes = await getModes();
      set({ availableModes: modes, isLoading: false });
    },

    changeMode: async (mode: ZendoroModeType) => {
      set({ isLoading: true });
      await sendModeToAPI(mode);
      set({ currentMode: mode, isLoading: false });
    },
  };
});

// Export the store's return type for typed selectors in components
export type ModeStore = ReturnType<typeof useModeStore>;

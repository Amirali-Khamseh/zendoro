import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const modeName = {
  standard: "Standard",
  extended: "Extended",
  longRun: "Long run",
} as const;
export type ZendoroModeType = {
  //@ts-ignore
  name?: modeName;
  focusTime: number;
  shortBreak: number;
  longBreak: number;
};

type ZendoroModeTypeHelpers = ZendoroModeType & {
  availableModes: ZendoroModeType[];
  isLoading: boolean;
  changeMode: (mode: ZendoroModeType) => void;
  initialize: () => Promise<void>;
  fetchAvailableModes: () => Promise<void>;
};

const sendModeToAPI = async (mode: ZendoroModeType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/timer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(mode),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
    console.log("API Response:", response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch modes from API:", error);
    throw error;
  }
};

export const useModeStore = create<ZendoroModeTypeHelpers>()(
  persist(
    (set) => ({
      focusTime: 25,
      shortBreak: 5,
      longBreak: 15,
      availableModes: [],
      isLoading: false,
      changeMode: async (mode: ZendoroModeType) => {
        await sendModeToAPI(mode);
        set(() => ({
          ...mode,
        }));
      },
      // Fetch available modes from API
      fetchAvailableModes: async () => {
        set({ isLoading: true });
        try {
          const modes = await getModes();
          set({
            availableModes: modes || [],
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to fetch available modes from API:", error);
          set({ isLoading: false });
        }
      },
      // Initialize with values from API
      initialize: async () => {
        try {
          const modes = await getModes();
          if (modes && modes.length > 0) {
            const firstMode = modes[0];
            set(() => ({
              name: firstMode.name,
              focusTime: firstMode.focusTime,
              shortBreak: firstMode.shortBreak,
              longBreak: firstMode.longBreak,
              availableModes: modes,
            }));
          }
        } catch (error) {
          console.error("Failed to initialize modes from API:", error);
        }
      },
    }),
    {
      name: "mode-storage",
    },
  ),
);

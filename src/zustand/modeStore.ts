import { API_BASE_URL, modesValue } from "@/constants/data";
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
  name: modeName;
  focusTime: number;
  shortBreak: number;
  longBreak: number;
};

type ZendoroModeTypeHelpers = ZendoroModeType & {
  changeMode: (mode: ZendoroModeType) => void;
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

export const useModeStore = create<ZendoroModeTypeHelpers>()(
  persist(
    (set) => ({
      name: modesValue[0].time.name,
      focusTime: modesValue[0].time.focusTime,
      shortBreak: modesValue[0].time.shortBreak,
      longBreak: modesValue[0].time.longBreak,
      changeMode: async (mode: ZendoroModeType) => {
        await sendModeToAPI(mode);
        set(() => ({
          ...mode,
        }));
      },
    }),
    {
      name: "mode-storage",
    },
  ),
);

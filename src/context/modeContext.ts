import { modesValue } from "@/constants/data";
import { create } from "zustand";

export const modeName = {
  standard: "Standard",
  extended: "Extended",
  longRun: "Long run",
} as const;
export type ModeContextType = {
  //@ts-ignore
  name: modeName;
  focusTime: number;
  shortBreak: number;
  longBreak: number;
};
type ModeContextTypeExtended = ModeContextType & {
  changeMode: (mode: ModeContextType) => void;
};

export const useStore = create<ModeContextTypeExtended>((set) => ({
  name: modesValue[0].time.name,
  focusTime: modesValue[0].time.focusTime,
  shortBreak: modesValue[0].time.shortBreak,
  longBreak: modesValue[0].time.longBreak,
  changeMode: (mode: ModeContextType) =>
    set(() => ({
      ...mode,
    })),
}));

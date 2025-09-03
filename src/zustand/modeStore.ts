import { modesValue } from "@/constants/data";
import { create } from "zustand";

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

export const useModeStore = create<ZendoroModeTypeHelpers>((set) => ({
  name: modesValue[0].time.name,
  focusTime: modesValue[0].time.focusTime,
  shortBreak: modesValue[0].time.shortBreak,
  longBreak: modesValue[0].time.longBreak,
  changeMode: (mode: ZendoroModeType) =>
    set(() => ({
      ...mode,
    })),
}));

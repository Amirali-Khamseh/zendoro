import { createContext } from "react";

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
export const modeContext = createContext({} as ModeContextTypeExtended);

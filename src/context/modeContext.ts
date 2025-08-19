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
  setMode: React.Dispatch<React.SetStateAction<ModeContextType>>;
};
export const modeContext = createContext({} as ModeContextTypeExtended);

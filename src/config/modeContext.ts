import { createContext } from "react";

export type ModeContextType = {
  name: "Standard" | "Extended" | "Long run";
  focusTime: number;
  shortBreak: number;
  longBreak: number;
};
export const modeContext = createContext<ModeContextType>({
  name: "Standard",
  focusTime: 1500000,
  shortBreak: 300000,
  longBreak: 900000,
});

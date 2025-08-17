/* If the Context gets imported from this file it Does not Work Properly */

import { createContext } from "react";

export type ModeContextType = {
  name: "Standard" | "Extended" | "Long run";
  focusTime: number;
  shortBreak: number;
  longBreak: number;
};
type ModeContextTypeExtended = ModeContextType & {
  setMode: React.Dispatch<React.SetStateAction<ModeContextType>>;
};
export const modeContext = createContext({} as ModeContextTypeExtended);

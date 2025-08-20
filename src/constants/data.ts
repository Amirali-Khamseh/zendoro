import type { ModeContextType } from "@/context/modeContext";
import { minToMilli } from "@/lib/minToMilli";
type ModeType = {
  title: string;
  details: string;
  time: ModeContextType;
};
export const modesValue: ModeType[] = [
  {
    title: "Standard",
    details: "25min / 5 min /15 min",
    time: {
      name: "Standard",
      focusTime: minToMilli(25),
      shortBreak: minToMilli(5),
      longBreak: minToMilli(15),
    },
  },
  {
    title: "Extended",
    details: "45min / 10 min /25 min",
    time: {
      name: "Extended",
      focusTime: minToMilli(45),
      shortBreak: minToMilli(10),
      longBreak: minToMilli(25),
    },
  },
  {
    title: "Long run",
    details: "90min / 25 min /45 min",
    time: {
      name: "Long run",
      focusTime: minToMilli(90),
      shortBreak: minToMilli(25),
      longBreak: minToMilli(45),
    },
  },
];

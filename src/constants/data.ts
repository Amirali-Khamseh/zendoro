import type { ModeContextType } from "@/App";

export const ModesValue: {
  title: string;
  details: string;
  time: ModeContextType;
}[] = [
  {
    title: "Standard",
    details: "25min / 5 min /15 min",
    time: {
      name: "Standard",
      focusTime: 45 * 1000 * 60,
      shortBreak: 10 * 1000 * 60,
      longBreak: 25 * 1000 * 60,
    },
  },
  {
    title: "Extended",
    details: "45min / 10 min /25 min",
    time: {
      name: "Extended",
      focusTime: 25 * 1000 * 60,
      shortBreak: 5 * 1000 * 60,
      longBreak: 10 * 1000 * 60,
    },
  },
  {
    title: "Long run",
    details: "90min / 25 min /45 min",
    time: {
      name: "Long run",
      focusTime: 90 * 1000 * 60,
      shortBreak: 25 * 1000 * 60,
      longBreak: 45 * 1000 * 60,
    },
  },
];

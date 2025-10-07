import type { ZendoroModeType } from "@/zustand/modeStore";
import { minToMilli } from "@/lib/minToMilli";
type ModeType = {
  title: string;
  details: string;
  time: ZendoroModeType;
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
export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const REMINDER_PRIORITY_COLORS = {
  low: "bg-yellow-100",
  medium: "bg-green-300",
  high: "bg-red-400",
};

// export const API_BASE_URL = "https://zendoro-backend.onrender.com";
export const API_BASE_URL = "http://localhost:3000";
export const LS_ZENDORO_AUTH = "zendoro-auth-token";

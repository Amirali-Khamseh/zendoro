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

export const REMINDER_LEAD_TIME_OPTIONS: {
  value: number | null;
  label: string;
}[] = [
  { value: null, label: "No email reminder" },
  { value: 0, label: "At time of reminder" },
  { value: 5, label: "5 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 1440, label: "1 day before" },
  { value: 2880, label: "2 days before" },
];

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://zendoro-backend.onrender.com";
export const LS_ZENDORO_AUTH = "zendoro-auth-token";

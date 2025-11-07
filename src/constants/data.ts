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

export const API_BASE_URL = import.meta.env.PROD 
  ? "/backend" 
  : "http://localhost/backend";
export const LS_ZENDORO_AUTH = "zendoro-auth-token";

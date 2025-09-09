import { CheckCircle2, Circle, Zap } from "lucide-react";

export const getStatusConfig = (status: string) => {
  switch (status) {
    case "Done":
      return {
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        icon: CheckCircle2,
        dot: "bg-emerald-500",
      };
    case "In Progress":
      return {
        color: "text-amber-600 bg-amber-50 border-amber-200",
        icon: Zap,
        dot: "bg-amber-500",
      };
    case "Kill":
      return {
        color: "text-red-600 bg-red-50 border-red-200",
        icon: Circle,
        dot: "bg-red-500",
      };
    default:
      return {
        color: "text-slate-600 bg-slate-50 border-slate-200",
        icon: Circle,
        dot: "bg-slate-400",
      };
  }
};

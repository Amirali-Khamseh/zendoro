import { Brain, Coffee, Hourglass } from "lucide-react";

export const getCurrentSessionIcon = (currentSessionType: string) => {
  switch (currentSessionType) {
    case "focus":
      return <Brain className="text- w-4 h-4" />;
    case "shortBreak":
      return <Hourglass className="text-slate-950 w-4 h-4" />;
    case "longBreak":
      return <Coffee className="text-slate-950 w-4 h-4" />;
    default:
      return <Brain className="text-slate-950 w-4 h-4" />;
  }
};

import { Brain, Coffee, Hourglass } from "lucide-react";

export const getNextSessionInfo = (
  currentSessionType: string,
  focusSessionCount: number,
) => {
  if (currentSessionType === "focus") {
    const nextCount = focusSessionCount + 1;
    if (nextCount % 4 === 0) {
      return {
        icon: <Coffee className="text-white/70 w-4 h-4" />,
        label: "Long Break",
      };
    } else {
      return {
        icon: <Hourglass className="text-white/70 w-4 h-4" />,
        label: "Short Break",
      };
    }
  } else {
    return {
      icon: <Brain className="text-white/70 w-4 h-4" />,
      label: "Focus",
    };
  }
};

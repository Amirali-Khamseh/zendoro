import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DAYS_OF_WEEK } from "@/constants/data";
import { getCompletionRate } from "@/lib/getCompletionRate";
import { cn } from "@/lib/utils";
import { useHabitStore, type Habit } from "@/zustand/habbitStore";

import { Trash2 } from "lucide-react";

export default function HabitComponenet({ habit }: { habit: Habit }) {
  const { habits, updateHabit, deleteHabit } = useHabitStore();
  const toggleCompletion = (habitId: string, dayIndex: number) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      const newCompletions = [...habit.completions] as [
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
      ];
      newCompletions[dayIndex] = !newCompletions[dayIndex];
      updateHabit(habitId, { ...habit, completions: newCompletions });
    }
  };
  return (
    <Card key={habit.id}>
      <CardContent className="p-3 md:p-4">
        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
          <div>
            <h3 className="font-medium text-white text-balance">
              {habit.name}
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {habit.completions.map((completed, index) => (
              <button
                key={index}
                onClick={() => toggleCompletion(habit.id, index)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                  completed
                    ? "bg-white/5 border-white shadow-[0_0_5px_1px_rgba(255,255,255,0.25)]"
                    : "bg-white/10 border-white/20 hover:border-white/40 hover:bg-white/15",
                )}
                aria-label={`${DAYS_OF_WEEK[index]} - ${completed ? `Completed` : `Not completed`}`}
              >
                {completed && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#8A00C4] rounded-full shadow-[0_0_6px_3px_rgba(138,0,196,0.8),0_0_12px_4px_rgba(138,0,196,0.4)]"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="w-16 text-center">
            <span className="text-sm font-medium text-white/60">
              {getCompletionRate(habit)}%
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteHabit(habit.id)}
            className="w-10 h-10 p-0 text-white/60 hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-white text-balance flex-1 pr-2">
              {habit.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/60">
                {getCompletionRate(habit)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteHabit(habit.id)}
                className="w-8 h-8 p-0 text-white/60 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-xs text-white/60 text-center">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="font-medium">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {habit.completions.map((completed, index) => (
                <button
                  key={index}
                  onClick={() => toggleCompletion(habit.id, index)}
                  className={cn(
                    "w-full aspect-square rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                    completed
                      ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-900/50"
                      : "bg-white/10 border-white/20 hover:border-[#B44DFF]/60 hover:bg-[#8A00C4]/20",
                  )}
                  aria-label={`${DAYS_OF_WEEK[index]} - ${completed ? `Completed` : `Not completed`}`}
                >
                  {completed && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#8A00C4] rounded-full shadow-[0_0_6px_3px_rgba(138,0,196,0.8),0_0_12px_4px_rgba(138,0,196,0.4)]"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

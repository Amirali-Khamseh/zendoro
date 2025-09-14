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
      <CardContent className="p-4">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
          <div>
            <h3 className="font-medium text-foreground text-balance">
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
                    ? "bg-primary border-primary shadow-md"
                    : "bg-background border-border hover:border-muted-foreground",
                )}
                aria-label={`${DAYS_OF_WEEK[index]} - ${completed ? `Completed` : `Not completed`}`}
              >
                {completed && (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="w-16 text-center">
            <span className="text-sm font-medium text-muted-foreground">
              {getCompletionRate(habit)}%
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteHabit(habit.id)}
            className="w-10 h-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

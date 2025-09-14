import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHabitStore, type Habit } from "@/zustand/habbitStore";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Route = createFileRoute("/habit-tracker")({
  component: RouteComponent,
});

function RouteComponent() {
  const { habits, addHabit, deleteHabit, updateHabit } = useHabitStore();
  const [newHabitName, setNewHabitName] = useState("");

  const addHabitHandler = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        completions: [false, false, false, false, false, false, false],
      };
      addHabit(newHabit);
      setNewHabitName("");
    }
  };

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

  const getCompletionRate = (habit: Habit) => {
    const completed = habit.completions.filter(Boolean).length;
    return Math.round((completed / 7) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Habit Tracker</h1>
        <p className="text-muted-foreground text-lg">
          Build better habits, one day at a time
        </p>
      </div>

      {/* Add new habit */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Habit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a new habit..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addHabitHandler()}
              className="flex-1"
            />
            <Button onClick={addHabitHandler}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Days of week header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4">
        <div className="text-sm font-medium text-muted-foreground">Habit</div>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="w-8 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="w-16 text-center text-sm font-medium text-muted-foreground">
          Progress
        </div>
        <div className="w-10"></div>
      </div>

      {/* Habit list */}
      <div className="space-y-3">
        {habits.map((habit) => (
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
        ))}
      </div>

      {habits.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground text-lg">
              No habits yet. Add your first habit above to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

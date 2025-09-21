import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

import { useHabitStore, type Habit } from "@/zustand/habbitStore";

import { DAYS_OF_WEEK } from "@/constants/data";
import HabitComponenet from "@/componenets/HabitTracker/Habit";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";

export const Route = createFileRoute("/habit-tracker")({
  component: RouteComponent,
});

function RouteComponent() {
  const { habits, addHabit } = useHabitStore();
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
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Enter a new habit..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addHabitHandler()}
              className="flex-1"
            />
            <GradientButton
              onClick={addHabitHandler}
              size="icon"
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </GradientButton>
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
          <HabitComponenet habit={habit} />
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

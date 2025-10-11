import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

import { useHabitStore, type Habit } from "@/zustand/habbitStore";

import { DAYS_OF_WEEK } from "@/constants/data";
import HabitComponenet from "@/componenets/HabitTracker/Habit";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isAuthenticated } from "@/lib/authVerification";

export const Route = createFileRoute("/habit-tracker")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function RouteComponent() {
  useDocumentTitle("Habit Tracker");

  const { habits, addHabit, fetchHabits, isLoading, error, hasInitialized } =
    useHabitStore();
  const [newHabitName, setNewHabitName] = useState("");

  useEffect(() => {
    if (!hasInitialized && !isLoading) {
      fetchHabits();
    }
  }, [fetchHabits, hasInitialized, isLoading]);

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

  // Show error state if there's an error
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-2 md:p-4 overflow-x-hidden">
        <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">
              Habit Tracker
            </h1>
            <p className="text-red-500 text-base md:text-lg">Error: {error}</p>
            <GradientButton onClick={() => fetchHabits()}>
              Try Again
            </GradientButton>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching habits
  if (isLoading && habits.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-2 md:p-4 overflow-x-hidden">
        <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">
              Habit Tracker
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Loading your habits...
            </p>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-16 rounded-md"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">
            Habit Tracker
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Build better habits, one day at a time
          </p>
        </div>

        {/* Add new habit */}
        <div className="relative overflow-hidden rounded-xl p-4 md:p-6">
          <div className="relative z-10 space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-white">
              Add New Habit
            </h3>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Enter a new habit..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHabitHandler()}
                className="flex-1 text-sm md:text-base text-white"
              />
              <GradientButton
                onClick={addHabitHandler}
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </GradientButton>
            </div>
          </div>
        </div>

        {/* Days of week header - Desktop only */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4">
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
    </div>
  );
}

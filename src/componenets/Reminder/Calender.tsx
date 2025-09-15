"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/zustand/reminderStore";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  reminders: Reminder[];
}

export function Calendar({
  selectedDate,
  onDateSelect,
  reminders,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const monthNames = [
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getRemindersForDate = (date: Date) => {
    return reminders.filter(
      (reminder) => reminder.date.toDateString() === date.toDateString(),
    );
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-24 p-2 border border-border/50"
        ></div>,
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const dayReminders = getRemindersForDate(date);
      const hasReminders = dayReminders.length > 0;

      days.push(
        <div
          key={day}
          className={cn(
            "h-24 p-2 border border-border/50 cursor-pointer transition-colors hover:bg-muted/50",
            isSelected && "bg-accent/20 border-accent",
            isToday && "bg-primary/10 border-primary/30",
          )}
          onClick={() => onDateSelect(date)}
        >
          <div className="flex flex-col h-full">
            <span
              className={cn(
                "text-sm font-medium mb-1",
                isSelected && "text-accent-foreground",
                isToday && "text-primary font-bold",
              )}
            >
              {day}
            </span>
            {hasReminders && (
              <div className="flex-1 space-y-1">
                {dayReminders.slice(0, 2).map((reminder, index) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded truncate",
                      reminder.priority === "high" &&
                        "bg-foreground/20 text-foreground font-semibold",
                      reminder.priority === "medium" &&
                        "bg-foreground/10 text-foreground",
                      reminder.priority === "low" &&
                        "bg-muted text-muted-foreground",
                      reminder.completed && "opacity-60 line-through",
                    )}
                  >
                    {reminder.title}
                  </div>
                ))}
                {dayReminders.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayReminders.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
      );
    }

    return days;
  };

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("prev")}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h3 className="text-lg font-semibold text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("next")}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground border-b border-border"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
        {renderCalendarDays()}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-foreground/20 rounded border border-foreground/30"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-foreground/10 rounded border border-foreground/20"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-muted rounded border border-muted-foreground/30"></div>
          <span>Low Priority</span>
        </div>
      </div>
    </div>
  );
}

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
          className="h-16 p-1 border border-border/50"
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
            "h-16 p-1 border border-border/50 cursor-pointer transition-colors hover:bg-muted/50",
            isSelected && "bg-accent/20 border-accent",
            isToday && "bg-primary/10 border-primary/30",
          )}
          onClick={() => onDateSelect(date)}
        >
          <div className="flex flex-col h-full">
            <span
              className={cn(
                "text-xs font-medium mb-0.5 text-white",
                isSelected && "text-white font-bold",
                isToday && "text-white font-bold",
              )}
            >
              {day}
            </span>
            {hasReminders && (
              <div className="flex-1 space-y-0.5">
                {dayReminders.slice(0, 1).map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded truncate text-white font-medium",
                      reminder.priority === "high" && "bg-red-500/80",
                      reminder.priority === "medium" && "bg-yellow-500/80",
                      reminder.priority === "low" && "bg-green-500/80",
                      reminder.completed && "opacity-60 line-through",
                    )}
                  >
                    {reminder.title}
                  </div>
                ))}
                {dayReminders.length > 1 && (
                  <div className="text-xs text-white/60">
                    +{dayReminders.length - 1} more
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
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("prev")}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        <h3 className="text-base font-semibold text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("next")}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-6 flex items-center justify-center text-xs font-medium text-white/70 border-b border-border"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
        {renderCalendarDays()}
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-400 rounded"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-300 rounded"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-300 rounded"></div>
          <span>Low Priority</span>
        </div>
      </div>
    </div>
  );
}

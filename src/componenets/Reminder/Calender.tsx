"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/zustand/reminderStore";
import {
  DAY_NAMES,
  MONTH_NAMES,
  REMINDER_PRIORITY_COLORS,
} from "@/constants/data";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  reminders: Reminder[];
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
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

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      const monthChange = direction === "prev" ? -1 : 1;
      newDate.setMonth(newDate.getMonth() + monthChange);
      return newDate;
    });
  };

  const getRemindersForDate = useCallback(
    (date: Date) => {
      const dateStr = date.toDateString();
      return reminders.filter((reminder) => {
        try {
          return reminder.date.toDateString() === dateStr;
        } catch {
          return false;
        }
      });
    },
    [reminders],
  );

  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayStr = today.toDateString();
    const selectedStr = selectedDate.toDateString();

    // Get the first day of the current month
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );

    // Get the start of the calendar grid (might be in previous month)
    const startOfCalendar = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    startOfCalendar.setDate(firstDayOfMonth.getDate() - dayOfWeek);

    // Generate 42 days (6 weeks) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      const date = new Date(startOfCalendar);
      date.setDate(startOfCalendar.getDate() + i);

      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const dayReminders = getRemindersForDate(date);

      days.push({
        date: new Date(date),
        dayNumber: date.getDate(),
        isCurrentMonth,
        isToday: date.toDateString() === todayStr,
        isSelected: date.toDateString() === selectedStr,
        reminders: dayReminders,
      });
    }

    return days;
  }, [currentMonth, selectedDate, getRemindersForDate]);

  const renderCalendarGrid = () => {
    return calendarDays.map((day, index) => {
      const hasReminders = day.reminders.length > 0;

      return (
        <div
          key={`${day.date.toISOString()}-${index}`}
          className={cn(
            "h-12 md:h-16 p-1 border-r border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50",
            !day.isCurrentMonth && "opacity-40",
            day.isSelected && "bg-accent/20 border-accent",
            day.isToday && "bg-primary/10 border-primary/30",
          )}
          onClick={() => onDateSelect(day.date)}
        >
          <div className="flex flex-col h-full overflow-hidden">
            <span
              className={cn(
                "text-xs font-medium mb-0.5 text-white flex-shrink-0",
                day.isSelected && "text-white font-bold",
                day.isToday && "text-white font-bold",
                !day.isCurrentMonth && "text-white/40",
              )}
            >
              {day.dayNumber}
            </span>
            {hasReminders && day.isCurrentMonth && (
              <div className="flex-1 space-y-0.5 overflow-hidden text-white">
                {day.reminders.slice(0, 1).map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "text-[10px] md:text-xs px-1 py-0.5 rounded truncate text-white font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
                      reminder.priority === "high" &&
                        `${REMINDER_PRIORITY_COLORS.high}/80`,
                      reminder.priority === "medium" &&
                        `${REMINDER_PRIORITY_COLORS.medium}/80 `,
                      reminder.priority === "low" &&
                        `${REMINDER_PRIORITY_COLORS.low}/80 `,
                      reminder.completed && "opacity-60 line-through",
                    )}
                  >
                    {reminder.title}
                  </div>
                ))}
                {day.reminders.length > 1 && (
                  <div className="text-[10px] md:text-xs text-white/60 truncate">
                    +{day.reminders.length - 1} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
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
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
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
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="h-6 flex items-center justify-center text-xs font-medium text-white/70 border-b border-border"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border border-border/50 rounded-lg overflow-hidden">
        {renderCalendarGrid()}
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 ${REMINDER_PRIORITY_COLORS.high} rounded`}
          ></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 ${REMINDER_PRIORITY_COLORS.medium} rounded`}
          ></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 ${REMINDER_PRIORITY_COLORS.low} rounded`}
          ></div>
          <span>Low Priority</span>
        </div>
      </div>
    </div>
  );
}

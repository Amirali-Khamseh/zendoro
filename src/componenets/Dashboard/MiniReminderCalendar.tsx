import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DAY_NAMES,
  MONTH_NAMES,
  REMINDER_PRIORITY_COLORS,
} from "@/constants/data";
import type { Reminder } from "@/zustand/reminderStore";

interface MiniReminderCalendarProps {
  reminders: Reminder[];
}

// High first so the most urgent dot/sort wins.
const PRIORITY_ORDER: Reminder["priority"][] = ["high", "medium", "low"];
const PRIORITY_LABEL: Record<Reminder["priority"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function MiniReminderCalendar({ reminders }: MiniReminderCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const navigateMonth = (dir: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + (dir === "prev" ? -1 : 1));
      return d;
    });
  };

  // Group reminders by calendar day for O(1) lookups while rendering the grid.
  const remindersByDate = useMemo(() => {
    const map = new Map<string, Reminder[]>();
    for (const reminder of reminders) {
      try {
        const key = reminder.date.toDateString();
        const existing = map.get(key);
        if (existing) existing.push(reminder);
        else map.set(key, [reminder]);
      } catch {
        // skip reminders with an unparseable date
      }
    }
    return map;
  }, [reminders]);

  const days = useMemo(() => {
    const todayStr = today.toDateString();
    const firstOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        date,
        isCurrentMonth: date.getMonth() === currentMonth.getMonth(),
        isToday: date.toDateString() === todayStr,
        reminders: remindersByDate.get(date.toDateString()) ?? [],
      };
    });
  }, [currentMonth, remindersByDate, today]);

  const selectedReminders = useMemo(() => {
    const list = remindersByDate.get(selectedDate.toDateString()) ?? [];
    return [...list].sort(
      (a, b) =>
        PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority),
    );
  }, [remindersByDate, selectedDate]);

  // One dot per distinct priority present that day, ordered high -> low.
  const dotsForDay = (dayReminders: Reminder[]) =>
    PRIORITY_ORDER.filter((p) => dayReminders.some((r) => r.priority === p));

  return (
    <div className="flex flex-col gap-3">
      {/* Calendar */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="h-7 w-7 p-0 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-semibold text-white">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="h-7 w-7 p-0 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-white/40"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            const isSelected =
              day.date.toDateString() === selectedDate.toDateString();
            const dots = dotsForDay(day.reminders);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  "flex h-8 flex-col items-center justify-center rounded-md text-xs transition-colors hover:bg-white/10",
                  day.isCurrentMonth ? "text-white" : "text-white/30",
                  isSelected && "bg-white/15 ring-1 ring-white/30",
                  day.isToday && !isSelected && "ring-1 ring-white/20",
                )}
              >
                <span className={cn(day.isToday && "font-bold")}>
                  {day.date.getDate()}
                </span>
                <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                  {dots.map((priority) => (
                    <span
                      key={priority}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        REMINDER_PRIORITY_COLORS[priority],
                      )}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/60">
          {PRIORITY_ORDER.map((priority) => (
            <span key={priority} className="flex items-center gap-1">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  REMINDER_PRIORITY_COLORS[priority],
                )}
              />
              {PRIORITY_LABEL[priority]}
            </span>
          ))}
        </div>
      </div>

      {/* Selected day reminders */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <p className="mb-1.5 text-xs font-semibold text-white">
          {selectedDate.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </p>
        {selectedReminders.length === 0 ? (
          <p className="py-2 text-center text-xs text-white/40">No reminders</p>
        ) : (
          <ul className="space-y-1.5">
            {selectedReminders.map((reminder) => (
              <li key={reminder.id} className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    REMINDER_PRIORITY_COLORS[reminder.priority],
                  )}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-xs text-white",
                      reminder.completed && "line-through opacity-60",
                    )}
                  >
                    {reminder.title}
                  </p>
                  <p className="text-[10px] text-white/50">{reminder.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

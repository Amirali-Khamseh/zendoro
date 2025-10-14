import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/zustand/reminderStore";

interface ReminderListProps {
  reminders: Reminder[];
  onToggleComplete: (id: number) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: number) => void;
}

export function ReminderList({
  reminders,
  onToggleComplete,
  onEdit,
  onDelete,
}: ReminderListProps) {
  const sortedReminders = [...reminders].sort((a, b) => {
    // Sort by completion status first (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Then by priority (high to low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    // Finally by time
    return a.time.localeCompare(b.time);
  });

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-white/70" />
        </div>
        <p className="text-white/70">No reminders for this date</p>
        <p className="text-sm text-white/50 mt-1">
          Click "Add Reminder" to create one
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedReminders.map((reminder) => (
        <div
          key={reminder.id}
          className={cn(
            "bg-white/5 border border-white/10 rounded-lg p-4 transition-all duration-200",
            reminder.completed && "opacity-60",
          )}
        >
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <Checkbox
              checked={reminder.completed}
              onCheckedChange={() => onToggleComplete(reminder.id)}
              className="mt-1"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className={cn(
                    "font-medium text-white leading-tight",
                    reminder.completed && "line-through",
                  )}
                >
                  {reminder.title}
                </h3>

                {/* Priority Badge */}
                <Badge
                  variant={
                    reminder.priority === "high"
                      ? "destructive"
                      : reminder.priority === "medium"
                        ? "default"
                        : "secondary"
                  }
                  className={cn("text-xs capitalize shrink-0")}
                >
                  {reminder.priority}
                </Badge>
              </div>

              {/* Description */}
              {reminder.description && (
                <p
                  className={cn(
                    "text-sm text-white/70 mb-2 leading-relaxed",
                    reminder.completed && "line-through",
                  )}
                >
                  {reminder.description}
                </p>
              )}

              {/* Time and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <Clock className="w-3 h-3" />
                  <span>{reminder.time}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(reminder)}
                    className="h-6 w-6 p-0 hover:bg-accent/20 bg-blue-400 rounded-full "
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(reminder.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive bg-red-400 rounded-full"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            {reminders.filter((r) => !r.completed).length} of {reminders.length}{" "}
            remaining
          </span>
          {reminders.filter((r) => r.completed).length > 0 && (
            <span>{reminders.filter((r) => r.completed).length} completed</span>
          )}
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/zustand/reminderStore";

interface ReminderCardProps {
  reminder: Reminder;
  onToggleComplete: (id: number) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: number) => void;
  compact?: boolean;
}

export function ReminderCard({
  reminder,
  onToggleComplete,
  onEdit,
  onDelete,
  compact = false,
}: ReminderCardProps) {
  const getPriorityIcon = (priority: Reminder["priority"]) => {
    if (priority === "high") {
      return <AlertCircle className="w-3 h-3" />;
    }
    return null;
  };

  if (compact) {
    return (
      <div
        className={cn(
          "bg-card border rounded-md p-2 transition-all duration-200 hover:shadow-sm",
          reminder.completed && "opacity-60",
        )}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            checked={reminder.completed}
            onCheckedChange={() => onToggleComplete(reminder.id)}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium text-card-foreground truncate",
                reminder.completed && "line-through",
              )}
            >
              {reminder.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {reminder.time}
              </span>
              <Badge
                variant={
                  reminder.priority === "high"
                    ? "destructive"
                    : reminder.priority === "medium"
                      ? "default"
                      : "secondary"
                }
                className="text-xs capitalize text-white"
              >
                {reminder.priority}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-4 transition-all duration-200 hover:shadow-sm",
        reminder.completed && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={reminder.completed}
          onCheckedChange={() => onToggleComplete(reminder.id)}
          className="mt-1 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "font-medium text-card-foreground leading-tight",
                  reminder.completed && "line-through",
                )}
              >
                {reminder.title}
              </h3>
              {getPriorityIcon(reminder.priority)}
            </div>

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

          {reminder.description && (
            <p
              className={cn(
                "text-sm text-muted-foreground mb-3 leading-relaxed",
                reminder.completed && "line-through",
              )}
            >
              {reminder.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{reminder.time}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(reminder)}
                className="h-7 w-7 p-0 hover:bg-accent/20"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(reminder.id)}
                className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

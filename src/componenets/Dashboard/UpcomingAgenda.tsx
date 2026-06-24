import { format, isToday, isTomorrow } from "date-fns";
import { CheckSquare, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UpcomingItem } from "@/lib/dashboardStats";

interface UpcomingAgendaProps {
  items: UpcomingItem[];
  limit?: number;
}

const formatWhen = (date: Date): string => {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
};

export function UpcomingAgenda({ items, limit = 7 }: UpcomingAgendaProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-white/50">
        Nothing upcoming, you're all caught up. 🎉
      </div>
    );
  }

  const visible = items.slice(0, limit);

  return (
    <ul className="space-y-2">
      {visible.map((item) => {
        const Icon = item.type === "todo" ? CheckSquare : Bell;
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          >
            <Icon className="h-4 w-4 shrink-0 text-white/50" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{item.title}</p>
              <p className="text-xs text-white/50">
                {formatWhen(item.date)}
                {item.type === "reminder" && item.meta ? ` · ${item.meta}` : ""}
                {item.type === "todo" && item.meta ? ` · ${item.meta}` : ""}
              </p>
            </div>
            {item.overdue ? (
              <Badge variant="destructive" className="shrink-0 text-xs">
                Overdue
              </Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0 text-xs capitalize">
                {item.type}
              </Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}

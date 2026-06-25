import { useState } from "react";
import { format, isToday, isTomorrow, addDays, startOfDay } from "date-fns";
import { CheckSquare, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { UpcomingItem } from "@/lib/dashboardStats";
import { useTodoStore } from "@/zustand/todoStore";

interface UpcomingAgendaProps {
  items: UpcomingItem[];
}

// Maps a column key to the new due date when a todo is dropped there
function targetDate(columnKey: string): Date | null {
  const today = startOfDay(new Date());
  if (columnKey === "today") return today;
  if (columnKey === "tomorrow") return addDays(today, 1);
  if (columnKey === "later") return addDays(today, 7);
  return null; // "overdue" is not a valid drop target
}

const formatTime = (item: UpcomingItem): string => {
  if (item.meta) return item.meta;
  return format(item.date, "HH:mm");
};

// ── Card ─────────────────────────────────────────────────────────────────────

function KanbanCard({
  item,
  dragging = false,
}: {
  item: UpcomingItem;
  dragging?: boolean;
}) {
  const Icon = item.type === "todo" ? CheckSquare : Bell;
  return (
    <div
      className={`flex flex-col gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 ${
        item.type === "todo" ? "cursor-grab active:cursor-grabbing" : ""
      } ${dragging ? "shadow-2xl shadow-black/60 ring-1 ring-white/20" : ""}`}
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
        <p className="text-xs font-medium leading-snug text-white">
          {item.title}
        </p>
      </div>
      <div className="flex items-center justify-between pl-5">
        <span className="text-[11px] text-white/40">{formatTime(item)}</span>
        <Badge
          variant={item.overdue ? "destructive" : "secondary"}
          className="h-4 px-1.5 text-[10px] capitalize"
        >
          {item.type === "todo" ? "todo" : "reminder"}
        </Badge>
      </div>
    </div>
  );
}

// ── Draggable wrapper (todos only) ────────────────────────────────────────────

function DraggableTodoCard({ item }: { item: UpcomingItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1,
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
    >
      <KanbanCard item={item} />
    </div>
  );
}

// ── Droppable column ──────────────────────────────────────────────────────────

interface ColDef {
  key: string;
  label: string;
  accent: string;
  headerBg: string;
  borderColor: string;
  ringColor: string;
  items: UpcomingItem[];
}

function DroppableKanbanColumn({ col }: { col: ColDef }) {
  const droppable = col.key !== "overdue";
  const { setNodeRef, isOver } = useDroppable({
    id: col.key,
    disabled: !droppable,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[160px] flex-1 flex-col rounded-xl border ${col.borderColor} bg-white/3 overflow-hidden transition-shadow duration-150 ${
        isOver && droppable ? `ring-2 ring-inset ${col.ringColor}` : ""
      }`}
    >
      <div
        className={`flex items-center justify-between px-3 py-2.5 ${col.headerBg}`}
      >
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${col.accent}`}
        >
          {col.label}
        </span>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${col.accent} bg-white/10`}
        >
          {col.items.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-2 min-h-[60px]">
        {col.items.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-white/30">
            All clear
          </p>
        ) : (
          col.items.map((item) =>
            item.type === "todo" ? (
              <DraggableTodoCard key={item.id} item={item} />
            ) : (
              <KanbanCard key={item.id} item={item} />
            ),
          )
        )}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function UpcomingAgenda({ items }: UpcomingAgendaProps) {
  const { updateTodo } = useTodoStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;
    const item = items.find((i) => i.id === String(active.id));
    if (!item || item.type !== "todo") return;
    const newDate = targetDate(String(over.id));
    if (!newDate) return;
    const todoId = Number(String(active.id).replace("todo-", ""));
    updateTodo(todoId, { dueDate: newDate });
  }

  const columns: ColDef[] = [
    {
      key: "overdue",
      label: "Overdue",
      accent: "text-red-400",
      headerBg: "bg-red-500/10",
      borderColor: "border-red-500/20",
      ringColor: "ring-red-400/40",
      items: items.filter((i) => i.overdue),
    },
    {
      key: "today",
      label: "Today",
      accent: "text-amber-400",
      headerBg: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      ringColor: "ring-amber-400/40",
      items: items.filter((i) => !i.overdue && isToday(i.date)),
    },
    {
      key: "tomorrow",
      label: "Tomorrow",
      accent: "text-sky-400",
      headerBg: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
      ringColor: "ring-sky-400/40",
      items: items.filter((i) => !i.overdue && isTomorrow(i.date)),
    },
    {
      key: "later",
      label: "Upcoming",
      accent: "text-white/60",
      headerBg: "bg-white/5",
      borderColor: "border-white/10",
      ringColor: "ring-white/30",
      items: items.filter(
        (i) => !i.overdue && !isToday(i.date) && !isTomorrow(i.date),
      ),
    },
  ];

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/50">
        Nothing upcoming — you're all caught up. 🎉
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {columns.map((col) => (
          <DroppableKanbanColumn key={col.key} col={col} />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeItem && (
          <div className="rotate-1 scale-105 pointer-events-none w-48">
            <KanbanCard item={activeItem} dragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

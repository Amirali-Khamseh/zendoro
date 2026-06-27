import { useState } from "react";
import { format, startOfDay } from "date-fns";
import { CheckSquare, GripVertical } from "lucide-react";
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
import { useTodoStore, type Todo } from "@/zustand/todoStore";

type TodoStatus = Todo["status"];

interface UpcomingAgendaProps {
  todos: Todo[];
}

const COLUMNS: {
  status: TodoStatus;
  label: string;
  accent: string;
  headerBg: string;
  borderColor: string;
  ringColor: string;
}[] = [
  {
    status: "TODO",
    label: "TODO",
    accent: "text-slate-400",
    headerBg: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    ringColor: "ring-slate-400/40",
  },
  {
    status: "In Progress",
    label: "In Progress",
    accent: "text-amber-400",
    headerBg: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    ringColor: "ring-amber-400/40",
  },
  {
    status: "Done",
    label: "Done",
    accent: "text-emerald-400",
    headerBg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    ringColor: "ring-emerald-400/40",
  },
  {
    status: "Kill",
    label: "Kill",
    accent: "text-red-400",
    headerBg: "bg-red-500/10",
    borderColor: "border-red-500/20",
    ringColor: "ring-red-400/40",
  },
];

// ── Card ──────────────────────────────────────────────────────────────────────

function TodoCard({
  todo,
  dragging = false,
}: {
  todo: Todo;
  dragging?: boolean;
}) {
  const overdue =
    todo.dueDate &&
    todo.status !== "Done" &&
    todo.status !== "Kill" &&
    startOfDay(new Date(todo.dueDate)) < startOfDay(new Date());

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 cursor-grab active:cursor-grabbing ${
        dragging ? "shadow-2xl shadow-black/60 ring-1 ring-white/20" : ""
      }`}
    >
      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/20" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-snug text-white truncate">
          {todo.title}
        </p>
        {todo.dueDate && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <CheckSquare className="h-2.5 w-2.5 shrink-0 text-white/30" />
            <span
              className={`text-[10px] ${overdue ? "text-red-400" : "text-white/40"}`}
            >
              {overdue ? "Overdue · " : ""}
              {format(new Date(todo.dueDate), "MMM d")}
            </span>
          </div>
        )}
      </div>
      {overdue && (
        <Badge
          variant="destructive"
          className="h-4 px-1.5 text-[10px] shrink-0"
        >
          late
        </Badge>
      )}
    </div>
  );
}

// ── Draggable wrapper ─────────────────────────────────────────────────────────

function DraggableTodoCard({ todo }: { todo: Todo }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: String(todo.id) });

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
      <TodoCard todo={todo} />
    </div>
  );
}

// ── Droppable column ──────────────────────────────────────────────────────────

function DroppableColumn({
  col,
  todos,
}: {
  col: (typeof COLUMNS)[number];
  todos: Todo[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[160px] flex-1 flex-col rounded-xl border ${col.borderColor} bg-white/[0.03] overflow-hidden transition-shadow duration-150 ${
        isOver ? `ring-2 ring-inset ${col.ringColor}` : ""
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
          {todos.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-2 min-h-[80px]">
        {todos.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-white/30">Empty</p>
        ) : (
          todos.map((todo) => <DraggableTodoCard key={todo.id} todo={todo} />)
        )}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function UpcomingAgenda({ todos }: UpcomingAgendaProps) {
  const { updateTodo } = useTodoStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const activeTodo = activeId
    ? todos.find((t) => String(t.id) === activeId)
    : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;
    const newStatus = over.id as TodoStatus;
    const todoId = Number(active.id);
    const todo = todos.find((t) => t.id === todoId);
    if (!todo || todo.status === newStatus) return;
    updateTodo(todoId, { status: newStatus });
  }

  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/50">
        No tasks yet — add some on the TODOs page.
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
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.status}
            col={col}
            todos={todos.filter((t) => t.status === col.status)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeTodo && (
          <div className="rotate-1 scale-105 pointer-events-none w-52">
            <TodoCard todo={activeTodo} dragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

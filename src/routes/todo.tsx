import { createFileRoute, redirect } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon, Plus } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useReminderStore } from "@/zustand/reminderStore";
import TodoComponent from "@/componenets/TodoList/Todo";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { isAuthenticated } from "@/lib/authVerification";
import { containsDangerousInput } from "@/lib/inputSanitization";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/todo")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

type TodoStatus = Todo["status"];

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

function DraggableCard({ todo }: { todo: Todo }) {
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
      <TodoComponent
        id={todo.id}
        title={todo.title}
        description={todo.description}
        dueDate={todo.dueDate}
        status={todo.status}
      />
    </div>
  );
}

function DroppableColumn({
  col,
  count,
  children,
}: {
  col: (typeof COLUMNS)[number];
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border ${col.borderColor} bg-white/3 overflow-hidden transition-shadow duration-150 ${
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
          {count}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-2 min-h-[80px]">{children}</div>
    </div>
  );
}

function TodoSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 overflow-x-hidden">
      {/* Form skeleton */}
      <div className="max-w-2xl mx-auto mb-6 md:mb-8 space-y-3 px-2 md:px-0">
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-8 md:h-9 w-full" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 md:h-9 w-full" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Skeleton className="h-8 md:h-9 flex-1" />
          <Skeleton className="h-8 md:h-9 flex-1" />
          <Skeleton className="h-8 md:h-9 w-full sm:w-10" />
        </div>
      </div>

      {/* Kanban columns skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className={`rounded-xl border ${col.borderColor} bg-white/3 overflow-hidden`}
          >
            <div className={`flex items-center justify-between px-3 py-2.5 ${col.headerBg}`}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="flex flex-col gap-2 p-2 min-h-[80px]">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteComponent() {
  useDocumentTitle("Todo List");

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const { addTodo, updateTodo, todos, fetchTodos, isLoading, hasInitialized } = useTodoStore();
  const fetchReminders = useReminderStore((s) => s.fetchReminders);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTodos();
    fetchReminders();
  }, [fetchTodos, fetchReminders]);

  if (!hasInitialized && isLoading) return <TodoSkeleton />;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
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

  function formHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title.trim()) {
      setFormErrors({ title: "Please enter a title" });
      return;
    }

    const errors: Record<string, string> = {};
    if (containsDangerousInput(title)) {
      errors.title =
        "Invalid characters detected. HTML and scripts are not allowed.";
    }
    if (description && containsDangerousInput(description)) {
      errors.description =
        "Invalid characters detected. HTML and scripts are not allowed.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    addTodo({
      title: title.trim(),
      description: description?.trim() || "",
      dueDate: date || null,
      status: status as TodoStatus,
    });

    e.currentTarget.reset();
    setDate(undefined);
    setStatus("");
    setOpen(false);
  }

  const byStatus = (s: TodoStatus) => todos.filter((t) => t.status === s);

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 overflow-x-hidden">
      {/* Add task form */}
      <div className="max-w-2xl mx-auto mb-6 md:mb-8">
        <form
          onSubmit={formHandler}
          className="relative overflow-hidden rounded-xl py-4 md:py-5"
        >
          <div className="relative z-10 space-y-3 md:space-y-4 px-2 md:px-0">
            <div className="space-y-1">
              <Label
                htmlFor="title"
                className="text-xs font-medium text-white uppercase tracking-wide"
              >
                Title
              </Label>
              <Input
                type="text"
                placeholder="Enter task title"
                name="title"
                id="title"
                required
                className={`h-8 md:h-9 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-white/30 text-sm${formErrors.title ? " border-red-500" : ""}`}
              />
              {formErrors.title && (
                <p className="text-xs text-red-400">{formErrors.title}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="description"
                className="text-xs font-medium text-white uppercase tracking-wide"
              >
                Description
              </Label>
              <Textarea
                name="description"
                placeholder="What should be done?"
                maxLength={150}
                id="description"
                className={`h-8 md:h-9 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-white/30 text-sm resize-none${formErrors.description ? " border-red-500" : ""}`}
              />
              {formErrors.description && (
                <p className="text-xs text-red-400">{formErrors.description}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 sm:items-end">
              <div className="flex-1">
                <Label
                  htmlFor="date"
                  className="text-xs font-medium text-white uppercase tracking-wide"
                >
                  Due Date
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      type="button"
                      className="h-8 md:h-9 w-full justify-between font-normal bg-white/5 border-white/15 text-white hover:bg-white/10 text-sm"
                    >
                      {date ? date.toLocaleDateString() : "Select date"}
                      <ChevronDownIcon className="h-3 w-3 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      onSelect={(d) => {
                        setDate(d);
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label
                  htmlFor="status"
                  className="text-xs font-medium text-white uppercase tracking-wide"
                >
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger
                    className="h-8 md:h-9 w-full bg-white/5 border-white/15 text-white hover:bg-white/10 text-sm"
                    id="status"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">TODO</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Kill">Kill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <GradientButton
                type="submit"
                className="h-8 md:h-9 sm:flex-shrink-0 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Add Task</span>
              </GradientButton>
            </div>
          </div>
        </form>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const items = byStatus(col.status);
            return (
              <DroppableColumn key={col.status} col={col} count={items.length}>
                {items.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-white/30">
                    No tasks here
                  </p>
                ) : (
                  items.map((todo) => (
                    <DraggableCard key={todo.id} todo={todo} />
                  ))
                )}
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeTodo && (
            <div className="rotate-1 scale-105 shadow-2xl shadow-black/50 opacity-95 pointer-events-none">
              <TodoComponent
                id={activeTodo.id}
                title={activeTodo.title}
                description={activeTodo.description}
                dueDate={activeTodo.dueDate}
                status={activeTodo.status}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

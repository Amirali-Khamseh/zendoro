"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useTodoStore, type Todo } from "@/zustand/todoStore";
import {
  useReminderStore,
  type Reminder,
} from "@/zustand/reminderStore";
import { ReminderForm } from "@/componenets/Reminder/ReminderForm";
import { ReminderCard } from "@/componenets/Reminder/ReminderCard";
import {
  Trash,
  Trash2,
  CalendarIcon,
  Bell,
  Plus,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { getStatusConfig } from "./getStatusConfig";

export default function TodoComponent({
  id,
  description: initialDescription,
  dueDate: initialDueDate,
  status: initialStatus,
  title: initialTitle,
}: Todo) {
  const { updateTodo, deleteTodo } = useTodoStore();

  // Reminder linkage (todo ↔ reminders)
  const reminders = useReminderStore((s) => s.reminders);
  const addReminder = useReminderStore((s) => s.addReminder);
  const updateReminder = useReminderStore((s) => s.updateReminder);
  const toggleComplete = useReminderStore((s) => s.toggleComplete);
  const setDeletingReminder = useReminderStore((s) => s.setDeletingReminder);
  const confirmDelete = useReminderStore((s) => s.confirmDelete);
  const linkedReminders = useMemo(
    () => reminders.filter((r) => r.todoId === id),
    [reminders, id],
  );

  // local state for editing
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus);
  const [dueDate, setDueDate] = useState<Date | null>(initialDueDate ?? null);

  // local state for the reminder add/edit dialog
  const [reminderFormOpen, setReminderFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const handleUpdate = (
    overrides?: Partial<Pick<Todo, "title" | "description" | "status" | "dueDate">>,
  ) => {
    updateTodo(id, { title, description, status, dueDate, ...overrides });
  };

  const openAddReminder = () => {
    setEditingReminder(null);
    setReminderFormOpen(true);
  };

  const openEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setReminderFormOpen(true);
  };

  const handleSaveReminder = async (data: Omit<Reminder, "id" | "userId">) => {
    if (editingReminder) {
      await updateReminder(editingReminder.id, { ...data, todoId: id });
    } else {
      await addReminder({ ...data, todoId: id });
    }
    setReminderFormOpen(false);
    setEditingReminder(null);
  };

  const handleDeleteReminder = async (reminderId: number) => {
    const reminder = reminders.find((r) => r.id === reminderId);
    if (!reminder) return;
    setDeletingReminder(reminder);
    await confirmDelete();
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/10 hover:shadow-lg hover:z-10 transition-all duration-300 p-3">
      <div
        className={`absolute top-3 right-3 w-2 h-2 rounded-full ${statusConfig.dot} opacity-60`}
      />

      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleUpdate()}
          placeholder="Task title..."
          className="border-0 bg-transparent p-0 text-base font-medium text-white placeholder:text-white/40 focus-visible:ring-0 h-auto"
        />

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => handleUpdate()}
          placeholder="Add details..."
          className="border-0 bg-transparent p-0 text-sm text-white/70 placeholder:text-white/40 focus-visible:ring-0 resize-none min-h-0"
          rows={1}
        />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {/* Status with icon */}
        <div className="w-full">
          <Select
            value={status}
            onValueChange={(val) => {
              const next = val as "TODO" | "In Progress" | "Done" | "Kill";
              setStatus(next);
              handleUpdate({ status: next });
            }}
          >
            <SelectTrigger
              className={`h-7 min-w-0 text-xs border-0 ${statusConfig.color} hover:opacity-80 transition-opacity`}
            >
              <div className="flex flex-1 min-w-0 items-center gap-1.5 overflow-hidden">
                <StatusIcon className="h-3 w-3 shrink-0" />
                <SelectValue placeholder="Status" className="truncate" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">Todo</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Kill">Kill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2">
          <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 shrink-0 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {dueDate ? format(dueDate, "MMM d") : "Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={dueDate ?? undefined}
              onSelect={(date) => {
                setDueDate(date ?? null);
                handleUpdate({ dueDate: date ?? null });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Reminders linked to this todo */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative h-7 shrink-0 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
            >
              <Bell className="h-3 w-3" />
              {linkedReminders.length > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white/15 px-1 text-[10px] font-semibold">
                  {linkedReminders.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-2 bg-neutral-900 border-white/10 text-white"
            align="end"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  Reminders
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={openAddReminder}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>

              {linkedReminders.length === 0 ? (
                <p className="px-1 py-3 text-center text-xs text-white/40">
                  No reminders yet
                </p>
              ) : (
                linkedReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-1">
                    <div className="min-w-0 flex-1">
                      <ReminderCard
                        reminder={reminder}
                        compact
                        onToggleComplete={toggleComplete}
                        onEdit={openEditReminder}
                        onDelete={handleDeleteReminder}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 shrink-0 p-0 text-white/50 hover:bg-white/10 hover:text-white"
                      onClick={() => openEditReminder(reminder)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 shrink-0 p-0 text-white/50 hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => handleDeleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 w-7 shrink-0 p-0 text-white/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <Trash className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">
                Delete task?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTodo(id)}
                className="bg-red-500 text-white hover:bg-red-600 text-sm"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>

      {reminderFormOpen && (
        <ReminderForm
          reminder={editingReminder}
          selectedDate={dueDate ?? new Date()}
          defaultTitle={title}
          onSave={handleSaveReminder}
          onClose={() => {
            setReminderFormOpen(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
}

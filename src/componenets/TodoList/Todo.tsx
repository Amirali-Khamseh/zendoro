"use client";

import { useState } from "react";
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
import { Trash, CalendarIcon, CheckCircle2, Circle, Zap } from "lucide-react";
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

  // local state for editing
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus);
  const [dueDate, setDueDate] = useState<Date | null>(initialDueDate ?? null);

  const handleUpdate = () => {
    updateTodo(id, { title, description, status, dueDate });
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] p-3">
      <div
        className={`absolute top-3 right-3 w-2 h-2 rounded-full ${statusConfig.dot} opacity-60`}
      />

      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleUpdate}
          placeholder="Task title..."
          className="border-0 bg-transparent p-0 text-base font-medium text-white placeholder:text-white/40 focus-visible:ring-0 h-auto"
        />

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleUpdate}
          placeholder="Add details..."
          className="border-0 bg-transparent p-0 text-sm text-white/70 placeholder:text-white/40 focus-visible:ring-0 resize-none min-h-0"
          rows={1}
        />
      </div>

      <div className="flex items-center gap-2 mt-3">
        {/* Status with icon */}
        <div className="flex-1">
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val as "TODO" | "In Progress" | "Done" | "Kill");
              handleUpdate();
            }}
          >
            <SelectTrigger
              className={`h-7 text-xs border-0 ${statusConfig.color} hover:opacity-80 transition-opacity`}
            >
              <div className="flex items-center gap-1.5">
                <StatusIcon className="h-3 w-3" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3" />
                  Todo
                </div>
              </SelectItem>
              <SelectItem value="In Progress">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  In Progress
                </div>
              </SelectItem>
              <SelectItem value="Done">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Done
                </div>
              </SelectItem>
              <SelectItem value="Kill">
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3" />
                  Kill
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
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
                handleUpdate();
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-white/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
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
  );
}

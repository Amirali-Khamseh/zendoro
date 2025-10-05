import { createFileRoute, redirect } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
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
import { useTodoStore } from "@/zustand/todoStore";
import { v4 as uuidv4 } from "uuid";
import TodoComponent from "@/componenets/TodoList/Todo";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { isAuthenticated } from "@/lib/authVerification";

export const Route = createFileRoute("/todo")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function RouteComponent() {
  useDocumentTitle("Todo List");

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string>("");
  const { addTodo, todos } = useTodoStore();

  function formHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    addTodo({
      id: uuidv4(),
      title: title.trim(),
      description: description?.trim() || "",
      dueDate: date || null,
      status: status as "TODO" | "In Progress" | "Done" | "Kill",
    });

    e.currentTarget.reset();
    setDate(undefined);
    setStatus("");
    setOpen(false);
  }

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 overflow-x-hidden">
      <div className="max-w-2xl mx-auto mt-3 md:mt-6 space-y-3 md:space-y-4">
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
                className="h-8 md:h-9 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-sm"
              />
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
                className="h-8 md:h-9 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-sm resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 sm:items-end">
              <div className="flex-1 ">
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
                      className="h-8 md:h-9 w-full justify-between font-normal bg-white border-slate-200 hover:bg-white text-sm"
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
                      onSelect={(date) => {
                        setDate(date);
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 ">
                <Label
                  htmlFor="status"
                  className="text-xs font-medium text-white uppercase tracking-wide"
                >
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger
                    className="h-8 md:h-9 w-full bg-white border-slate-200 hover:bg-white text-sm"
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
        {todos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2">
                Tasks ({todos.length})
              </span>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1" />
            </div>

            <div className="space-y-2">
              {todos.map((todo) => (
                <TodoComponent
                  key={todo.id}
                  id={todo.id}
                  description={todo.description}
                  title={todo.title}
                  dueDate={todo.dueDate}
                  status={todo.status}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

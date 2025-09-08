import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Todo from "./Todo";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
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

export default function TodoList() {
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
    <div className="max-w-lg mx-auto mt-4 space-y-4">
      {/* Form Card */}
      <form
        onSubmit={formHandler}
        className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div>
          <Label htmlFor="title" className="text-sm text-gray-600">
            Title
          </Label>
          <Input
            type="text"
            placeholder="Enter task title"
            name="title"
            id="title"
            required
            className="mt-1 w-full"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm text-gray-600">
            Description
          </Label>
          <Textarea
            name="description"
            placeholder="What should be done?"
            maxLength={150}
            id="description"
            className="mt-1 w-full resize-none"
          />
        </div>

        {/* Date & Status in one row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="date" className="text-sm text-gray-600">
              Due Date
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  type="button"
                  className="mt-1 w-full justify-between font-normal"
                >
                  {date ? date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon className="h-4 w-4 opacity-70" />
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

          <div className="flex-1">
            <Label htmlFor="status" className="text-sm text-gray-600">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger className="mt-1 w-full" id="status">
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
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-200"
        >
          Add Todo
        </Button>
      </form>

      {/* Todo List */}
      {todos.length > 0 && (
        <div className="space-y-3">
          {todos.map((todo) => (
            <Todo
              key={todo.id}
              id={todo.id}
              description={todo.description}
              title={todo.title}
              dueDate={todo.dueDate}
              status={todo.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}

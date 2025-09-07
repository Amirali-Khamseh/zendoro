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
    if (!status) {
      alert("Please select a status");
      return;
    }

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
    <div>
      <form onSubmit={formHandler}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              placeholder="Title"
              name="title"
              id="title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              placeholder="What should be done"
              maxLength={150}
              id="description"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
              Select the due date
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  type="button"
                  className="w-48 justify-between font-normal"
                >
                  {date ? date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
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

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]" id="status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">TODO</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
                <SelectItem value="Kill">Kill</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Add Todo
          </Button>
        </div>
      </form>

      {todos.length >= 1 &&
        todos.map((todo) => (
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
  );
}

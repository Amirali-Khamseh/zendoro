import { Todo } from "./Todo";
import { useTodoStore } from "@/zustand/todoStor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const updateTodo = useTodoStore((state) => state.updateTodo);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [status, setStatus] = useState("TODO");

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date>();
  const [editStatus, setEditStatus] = useState("TODO");

  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTodo({
      title,
      description,
      dueDate: dueDate || null,
      status: status as "TODO" | "In Progress" | "Done" | "Kill",
    });
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    setStatus("TODO");
  }

  function handleEditTodo(index: number) {
    const todo = todos[index];
    setEditingIndex(index);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditDueDate(todo.dueDate || undefined);
    setEditStatus(todo.status);
  }

  function handleUpdateTodo(e: React.FormEvent) {
    e.preventDefault();
    if (editingIndex === null || !editTitle.trim()) return;

    updateTodo(editingIndex, {
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate || null,
      status: editStatus as "TODO" | "In Progress" | "Done" | "Kill",
    });

    setEditingIndex(null);
    setEditTitle("");
    setEditDescription("");
    setEditDueDate(undefined);
    setEditStatus("TODO");
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditTitle("");
    setEditDescription("");
    setEditDueDate(undefined);
    setEditStatus("TODO");
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {editingIndex !== null && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Edit Todo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateTodo} className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="What needs to be done?"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-base"
                  required
                />
                <Input
                  type="text"
                  placeholder="Add a description (optional)"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal text-sm bg-transparent"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {editDueDate
                            ? format(editDueDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={editDueDate}
                          onSelect={setEditDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">Todo</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="Kill">Kill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Update Todo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {editingIndex === null && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              Add New Todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                  required
                />
                <Input
                  type="text"
                  placeholder="Add a description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal text-sm bg-transparent"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">Todo</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="Kill">Kill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Todo
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {todos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <div className="text-lg font-medium mb-2">No todos yet</div>
              <div className="text-sm">
                Create your first todo to get started!
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {todos.map((todo, idx) => (
            <Todo
              key={idx}
              {...todo}
              onDelete={() => deleteTodo(idx)}
              onEdit={() => handleEditTodo(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, Calendar } from "lucide-react";
import { format } from "date-fns";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface TodoProps {
  title: string;
  description?: string;
  dueDate?: Date | null;
  status: "TODO" | "In Progress" | "Done" | "Kill";
  onDelete: () => void;
  onEdit: () => void;
}

const statusColors = {
  TODO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "In Progress":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Kill: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function Todo({
  title,
  description,
  dueDate,
  status,
  onDelete,
  onEdit,
}: TodoProps) {
  const [open, setOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [todoTitle, setTodoTitle] = React.useState(title);
  const [todoDescription, setTodoDescription] = React.useState(
    description || "",
  );
  const [todoStatus, setTodoStatus] = React.useState(status);
  const [todoDueDate, setTodoDueDate] = React.useState(
    dueDate ? format(dueDate, "yyyy-MM-dd") : "",
  );

  // Modal edit states
  const [editTitle, setEditTitle] = React.useState(todoTitle);
  const [editDescription, setEditDescription] = React.useState(todoDescription);
  const [editStatus, setEditStatus] = React.useState(todoStatus);
  const [editDueDate, setEditDueDate] = React.useState(
    todoDueDate ? new Date(todoDueDate) : undefined,
  );

  // Truncate description to 30 chars
  const truncatedDescription =
    todoDescription && todoDescription.length > 30
      ? todoDescription.slice(0, 30) + "..."
      : todoDescription;

  // Save handler: update card content
  const handleSave = () => {
    setTodoTitle(editTitle);
    setTodoDescription(editDescription);
    setTodoStatus(editStatus);
    setTodoDueDate(editDueDate ? format(editDueDate, "yyyy-MM-dd") : "");
    setEditMode(false);
    setOpen(false);
    onEdit();
  };

  // Cancel handler
  const handleCancel = () => {
    setEditMode(false);
    setEditTitle(todoTitle);
    setEditDescription(todoDescription);
    setEditStatus(todoStatus);
    setEditDueDate(todoDueDate ? new Date(todoDueDate) : undefined);
  };

  return (
    <>
      <Card className="transition-all hover:shadow-md min-h-[56px] py-1">
        <CardContent className="p-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-base truncate">{todoTitle}</h3>
                <Badge variant="secondary" className={statusColors[todoStatus]}>
                  {todoStatus}
                </Badge>
              </div>
              {todoDescription && (
                <div className="flex items-center gap-2 max-w-full">
                  <p className="text-sm text-muted-foreground line-clamp-1 overflow-hidden break-words max-w-[180px]">
                    {truncatedDescription}
                  </p>
                  {todoDescription.length > 30 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-6 min-w-[40px]"
                      onClick={() => setOpen(true)}
                    >
                      Show More
                    </Button>
                  )}
                </div>
              )}
              {todoDueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Due {format(new Date(todoDueDate), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditMode(true);
                  setOpen(true);
                }}
                className="h-7 w-7 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col gap-2">
          <DialogHeader>
            {editMode ? (
              <>
                <input
                  className="w-full font-medium text-lg mb-2 border rounded px-2 py-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                />
                <div className="flex items-center gap-2 mt-1">
                  <Select
                    value={editStatus}
                    onValueChange={(v) =>
                      setEditStatus(v as TodoProps["status"])
                    }
                  >
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal text-sm bg-transparent"
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
              </>
            ) : (
              <>
                <DialogTitle>{todoTitle}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={statusColors[todoStatus]}
                  >
                    {todoStatus}
                  </Badge>
                  {todoDueDate && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Due {format(new Date(todoDueDate), "MMM dd, yyyy")}
                      </span>
                    </span>
                  )}
                </div>
              </>
            )}
          </DialogHeader>
          <div className="w-full">
            {editMode ? (
              <textarea
                className="w-full border rounded px-2 py-1 mt-2"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
                rows={4}
              />
            ) : (
              todoDescription && (
                <p className="text-base text-muted-foreground mt-2 break-words w-full">
                  {todoDescription}
                </p>
              )
            )}
          </div>
          <DialogFooter className="flex gap-2 justify-end mt-2">
            {editMode ? (
              <>
                <Button variant="secondary" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  <Edit3 className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

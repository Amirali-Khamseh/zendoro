import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/zustand/reminderStore";

interface ReminderFormProps {
  reminder?: Reminder | null;
  onSave: (reminder: Omit<Reminder, "id">) => void;
  onClose: () => void;
}

export function ReminderForm({ reminder, onSave, onClose }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
    time: "09:00",
    priority: "medium" as Reminder["priority"],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title,
        description: reminder.description || "",
        date: reminder.date.toISOString().split("T")[0],
        time: reminder.time,
        priority: reminder.priority,
      });
    }
  }, [reminder]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const reminderData: Omit<Reminder, "id"> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      date: new Date(formData.date),
      time: formData.time,
      priority: formData.priority,
      completed: reminder?.completed || false,
    };

    onSave(reminderData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-foreground font-semibold";
      case "medium":
        return "text-foreground";
      case "low":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {reminder ? "Edit Reminder" : "Add New Reminder"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter reminder title..."
              className={cn(
                errors.title &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Add a description (optional)..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={cn(
                  errors.date &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium">
                Time *
              </Label>
              <div className="relative">
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className={cn(
                    errors.time &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleInputChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted border border-muted-foreground/30"></div>
                    <span className={getPriorityColor("low")}>
                      Low Priority
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-foreground/10 border border-foreground/20"></div>
                    <span className={getPriorityColor("medium")}>
                      Medium Priority
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-foreground/20 border border-foreground/30"></div>
                    <span className={getPriorityColor("high")}>
                      High Priority
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {reminder ? "Update Reminder" : "Add Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

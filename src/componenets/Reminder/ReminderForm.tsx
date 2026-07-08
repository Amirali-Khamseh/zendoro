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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Reminder } from "@/zustand/reminderStore";
import { GradientButton } from "../customUIComponenets/CustomButton";
import { REMINDER_PRIORITY_COLORS, REMINDER_LEAD_TIME_OPTIONS } from "@/constants/data";
import { containsDangerousInput } from "@/lib/inputSanitization";

// Select can't hold a null value, so "none" stands in for "no email reminder"
const NO_EMAIL_REMINDER = "none";
const leadTimeToSelectValue = (v: number | null | undefined) =>
  v == null ? NO_EMAIL_REMINDER : String(v);
const selectValueToLeadTime = (v: string): number | null =>
  v === NO_EMAIL_REMINDER ? null : Number(v);

interface ReminderFormProps {
  reminder?: Reminder | null;
  selectedDate?: Date;
  defaultTitle?: string;
  onSave: (reminder: Omit<Reminder, "id" | "userId">) => void;
  onClose: () => void;
}

export function ReminderForm({
  reminder,
  selectedDate,
  defaultTitle,
  onSave,
  onClose,
}: ReminderFormProps) {
  const [formData, setFormData] = useState({
    title: defaultTitle || "",
    description: "",
    date: selectedDate || new Date(),
    time: "09:00",
    priority: "medium" as Reminder["priority"],
    remindBeforeMinutes: null as number | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title,
        description: reminder.description || "",
        date: reminder.date,
        time: reminder.time,
        priority: reminder.priority,
        remindBeforeMinutes: reminder.remindBeforeMinutes ?? null,
      });
    } else if (selectedDate) {
      // Reset form but keep the selected date when adding a new reminder
      setFormData({
        title: defaultTitle || "",
        description: "",
        date: selectedDate,
        time: "09:00",
        priority: "medium",
        remindBeforeMinutes: null,
      });
    }
  }, [reminder, selectedDate, defaultTitle]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (containsDangerousInput(formData.title)) {
      newErrors.title = "Invalid characters detected. HTML and scripts are not allowed.";
    }

    if (formData.description && containsDangerousInput(formData.description)) {
      newErrors.description = "Invalid characters detected. HTML and scripts are not allowed.";
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

    const reminderData: Omit<Reminder, "id" | "userId"> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      date: formData.date,
      time: formData.time,
      priority: formData.priority,
      completed: reminder?.completed || false,
      remindBeforeMinutes: formData.remindBeforeMinutes,
    };

    onSave(reminderData);
  };

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 font-semibold";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-500";
      default:
        return "text-green-500";
    }
  };

  // Generate time options
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });

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
              className={cn(
                "resize-none",
                errors.description &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground",
                      errors.date &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && handleInputChange("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Time *</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => handleInputChange("time", value)}
              >
                <SelectTrigger
                  className={cn(
                    errors.time &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                >
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select time" />
                  </div>
                </SelectTrigger>
                <SelectContent className="">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time} className="">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <SelectContent className="text-white">
                <SelectItem value="low" className="text-white focus:text-white">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${REMINDER_PRIORITY_COLORS.low}`}
                    ></div>
                    <span className={getPriorityColor("low")}>
                      Low Priority
                    </span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="medium"
                  className="text-white focus:text-white"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${REMINDER_PRIORITY_COLORS.medium}`}
                    ></div>
                    <span className={getPriorityColor("medium")}>
                      Medium Priority
                    </span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="high"
                  className="text-white focus:text-white"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${REMINDER_PRIORITY_COLORS.high}`}
                    ></div>
                    <span className={getPriorityColor("high")}>
                      High Priority
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email reminder */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email reminder</Label>
            <Select
              value={leadTimeToSelectValue(formData.remindBeforeMinutes)}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  remindBeforeMinutes: selectValueToLeadTime(value),
                }))
              }
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="text-white">
                {REMINDER_LEAD_TIME_OPTIONS.map((option) => (
                  <SelectItem
                    key={leadTimeToSelectValue(option.value)}
                    value={leadTimeToSelectValue(option.value)}
                    className="text-white focus:text-white"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter
            style={{ display: "flex", gap: "1rem" }}
            className="sm:gap-0"
          >
            <GradientButton type="button" onClick={onClose}>
              Cancel
            </GradientButton>
            <GradientButton type="submit">
              {reminder ? "Update Reminder" : "Add Reminder"}
            </GradientButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

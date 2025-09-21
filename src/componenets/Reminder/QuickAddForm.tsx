import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Clock } from "lucide-react";
import type { Reminder } from "@/zustand/reminderStore";
import { cn } from "@/lib/utils";
import { GradientButton } from "../customUIComponenets/CustomButton";

interface QuickAddFormProps {
  selectedDate: Date;
  onAdd: (reminder: Omit<Reminder, "id">) => void;
  className?: string;
}

export function QuickAddForm({
  selectedDate,
  onAdd,
  className,
}: QuickAddFormProps) {
  const [title, setTitle] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const reminder: Omit<Reminder, "id"> = {
      title: title.trim(),
      date: selectedDate,
      time: "09:00",
      priority: "medium",
      completed: false,
    };

    onAdd(reminder);
    setTitle("");
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setTitle("");
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsExpanded(true)}
        className={cn(
          "w-full justify-start text-white/70 hover:text-white",
          className,
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        Quick add reminder...
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter reminder title..."
          className="flex-1 text-white placeholder:text-white/50"
          autoFocus
        />
        <Button type="submit" size="sm" disabled={!title.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/60">
        <Clock className="w-3 h-3" />
        <span>Default: 9:00 AM, Medium priority</span>
        <GradientButton
          type="button"
          onClick={() => {
            setTitle("");
            setIsExpanded(false);
          }}
          className="ml-auto h-6 px-2 text-xs text-white/70 hover:text-white"
        >
          Cancel
        </GradientButton>
      </div>
    </form>
  );
}

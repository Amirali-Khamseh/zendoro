import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, CheckSquare, Repeat, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useTodoStore } from "@/zustand/todoStore";
import { useHabitStore } from "@/zustand/habbitStore";
import { useReminderStore } from "@/zustand/reminderStore";
import { useGoalStore, type Goal, type GoalInput } from "@/zustand/goalStore";

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null; // present → edit mode
}

// A scrollable list of selectable items used for linking todos/habits/reminders.
function LinkSection<T>({
  icon: Icon,
  title,
  items,
  getId,
  getLabel,
  selected,
  toggle,
}: {
  icon: typeof CheckSquare;
  title: string;
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  selected: Set<string>;
  toggle: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
        <span className="text-muted-foreground/60">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-muted-foreground/60">
          Nothing to link
        </p>
      ) : (
        <ScrollArea className="h-28 rounded-lg border bg-muted/30 p-1">
          {items.map((item) => {
            const id = getId(item);
            return (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={selected.has(id)}
                  onCheckedChange={() => toggle(id)}
                />
                <span className="truncate">{getLabel(item)}</span>
              </label>
            );
          })}
        </ScrollArea>
      )}
    </div>
  );
}

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
}: GoalFormDialogProps) {
  const { addGoal, updateGoal } = useGoalStore();
  const todos = useTodoStore((s) => s.todos);
  const habits = useHabitStore((s) => s.habits);
  const reminders = useReminderStore((s) => s.reminders);

  const isEdit = Boolean(goal);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [todoIds, setTodoIds] = useState<Set<string>>(new Set());
  const [habitIds, setHabitIds] = useState<Set<string>>(new Set());
  const [reminderIds, setReminderIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Seed the form whenever the dialog opens (or the target goal changes).
  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? "");
    setDescription(goal?.description ?? "");
    setTargetDate(goal?.targetDate ?? undefined);
    setTodoIds(new Set((goal?.todoIds ?? []).map(String)));
    setHabitIds(new Set((goal?.habitIds ?? []).map(String)));
    setReminderIds(new Set((goal?.reminderIds ?? []).map(String)));
  }, [open, goal]);

  const toggle =
    (setter: React.Dispatch<React.SetStateAction<Set<string>>>) =>
    (id: string) =>
      setter((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });

  const canSave = title.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    // Todo/reminder ids are numeric; habit ids may be UUID strings (mock) or
    // numbers (prod) — pass habit ids through as their original string form.
    const payload: GoalInput = {
      title: title.trim(),
      description: description.trim() || null,
      targetDate: targetDate ?? null,
      todoIds: [...todoIds].map(Number),
      habitIds: [...habitIds],
      reminderIds: [...reminderIds].map(Number),
    };
    try {
      if (isEdit && goal) {
        await updateGoal(goal.id, payload);
      } else {
        await addGoal(payload);
      }
      onOpenChange(false);
    } catch {
      // store logs the error; keep the dialog open so the user can retry
    } finally {
      setSaving(false);
    }
  };

  const linkedCount = useMemo(
    () => todoIds.size + habitIds.size + reminderIds.size,
    [todoIds, habitIds, reminderIds],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "New goal"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ship v1"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-desc">Description</Label>
            <Textarea
              id="goal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does success look like?"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Target date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "No deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                />
                {targetDate && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setTargetDate(undefined)}
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
            <p className="text-xs font-medium">
              Link items{" "}
              <span className="text-muted-foreground">
                {linkedCount > 0 ? `· ${linkedCount} selected` : ""}
              </span>
            </p>
            <LinkSection
              icon={CheckSquare}
              title="Tasks"
              items={todos}
              getId={(t) => String(t.id)}
              getLabel={(t) => t.title}
              selected={todoIds}
              toggle={toggle(setTodoIds)}
            />
            <LinkSection
              icon={Repeat}
              title="Habits"
              items={habits}
              getId={(h) => String(h.id)}
              getLabel={(h) => h.name}
              selected={habitIds}
              toggle={toggle(setHabitIds)}
            />
            <LinkSection
              icon={Bell}
              title="Reminders"
              items={reminders}
              getId={(r) => String(r.id)}
              getLabel={(r) => r.title}
              selected={reminderIds}
              toggle={toggle(setReminderIds)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

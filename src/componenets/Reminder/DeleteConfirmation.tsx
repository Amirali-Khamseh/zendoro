import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Reminder } from "@/zustand/reminderStore";
import { AlertTriangle } from "lucide-react";
import { GradientButton } from "../customUIComponenets/CustomButton";

interface DeleteConfirmationDialogProps {
  reminder: Reminder | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationDialog({
  reminder,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  if (!reminder) return null;

  return (
    <Dialog open={!!reminder} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Reminder
          </DialogTitle>
          <DialogDescription className="text-left">
            Are you sure you want to delete this reminder? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted rounded-lg p-3 my-4">
          <h4 className="font-medium text-foreground mb-1">{reminder.title}</h4>
          {reminder.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {reminder.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{reminder.date.toLocaleDateString()}</span>
            <span>{reminder.time}</span>
            <span className="capitalize">{reminder.priority} priority</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <GradientButton type="button" onClick={onCancel}>
            Cancel
          </GradientButton>
          <GradientButton type="button" onClick={onConfirm}>
            Delete Reminder
          </GradientButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ResetPasswordResult = { email: string; code: string } | null;

export function ResetPasswordResultDialog({
  result,
  onOpenChange,
}: {
  result: ResetPasswordResult;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog
      open={!!result}
      onOpenChange={(next) => {
        if (!next) setCopied(false);
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-sky-400" />
            Password reset code generated
          </DialogTitle>
          <DialogDescription>
            {result &&
              `A reset code was generated for ${result.email}. In production this is emailed to the user — this test environment has no email transport, so it's shown here instead.`}
          </DialogDescription>
        </DialogHeader>

        {result && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 p-4">
            <span className="text-2xl font-semibold tracking-[0.4em] text-white">
              {result.code}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy
                </>
              )}
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

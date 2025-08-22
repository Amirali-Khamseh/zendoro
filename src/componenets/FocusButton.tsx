import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from "@/components/ui/dialog";
import { TimerButtons } from "./Timer/TimerButtons";
import { formatTime } from "@/lib/formatTime";

export function FocusButton({
  isRunning,
  timeLeft,
  toggleTimerState,
}: {
  isRunning: boolean;
  timeLeft: number;
  toggleTimerState: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <TimerButtons type="focus" />
      </DialogTrigger>
      <DialogOverlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      <DialogContent className="bg-gray-900 text-white p-6 rounded-lg w-[300px] backdrop-blur-3xl">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="font-beba text-[4rem] flex gap-2 justify-center ">
            {formatTime(timeLeft)}
          </DialogTitle>
          <DialogDescription>
            {isRunning ? (
              <TimerButtons type="pause" onClick={toggleTimerState} />
            ) : (
              <TimerButtons type="play" onClick={toggleTimerState} />
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

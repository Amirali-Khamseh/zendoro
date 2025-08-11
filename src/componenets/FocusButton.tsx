import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { TimerButtons } from "./Timer/TimerButtons";

export function FocusButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <TimerButtons type="focus" />
      </DialogTrigger>
      <DialogContent className=" bg-gray-500/75">
        Should fix the dimensions of the modal
      </DialogContent>
    </Dialog>
  );
}

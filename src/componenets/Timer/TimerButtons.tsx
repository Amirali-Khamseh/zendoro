import { Button } from "@/components/ui/button";
import { Fullscreen, Pause, Play, SkipForward, TimerReset } from "lucide-react";

type Props = {
  type: "play" | "pause" | "reset" | "skip" | "focus";
  onClick?: () => void;
};

const icons = {
  play: <Play color="white" fill="white" key="play" />,
  pause: <Pause color="white" fill="white" key="pause" />,
  reset: <TimerReset color="white" key="reset" />,
  skip: <SkipForward color="white" fill="white" key="skip" />,
  focus: <Fullscreen color="white" fill="white" key="focus" />,
};
export function TimerButtons({ type, onClick }: Props) {
  return (
    <Button
      className="w-[40px] h-[40px] rounded-full bg-transparent cursor-pointer hover:bg-slate-600 border-2"
      onClick={onClick}
    >
      {icons[type]}
    </Button>
  );
}

import { Button } from "@/components/ui/button";
import { Fullscreen, Pause, Play, SkipForward, TimerReset } from "lucide-react";

type Props = {
  type: "play" | "pause" | "reset" | "skip" | "focus";
  onClick?: () => void;
};

const icons = {
  play: <Play color="black" fill="black" key="play" />,
  pause: <Pause color="black" fill="black" key="pause" />,
  reset: <TimerReset color="black" key="reset" />,
  skip: <SkipForward color="black" fill="black" key="skip" />,
  focus: <Fullscreen color="black" fill="black" key="focus" />,
};
export function TimerButtons({ type, onClick }: Props) {
  return (
    <Button
      className="w-[40px] h-[40px] rounded-full bg-white cursor-pointer hover:bg-slate-600"
      onClick={onClick}
    >
      {icons[type]}
    </Button>
  );
}

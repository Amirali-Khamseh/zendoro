import { Button } from "@/components/ui/button";
import { Fullscreen, Pause, Play, SkipForward, TimerReset } from "lucide-react";

type Props = {
  type: "play" | "pause" | "reset" | "skip" | "focus";
  onClick?: () => void;
};
const typeMapping = [
  {
    type: "play",
    icon: <Play color="black" fill="black" key="play" />,
  },
  {
    type: "pause",
    icon: <Pause color="black" fill="black" key="pause" />,
  },
  {
    type: "reset",
    icon: <TimerReset color="black" key="reset" />,
  },
  {
    type: "skip",
    icon: <SkipForward color="black" fill="black" key="skip" />,
  },
  {
    type: "focus",
    icon: <Fullscreen color="black" fill="black" key="focus" />,
  },
];
export function TimerButtons({ type, onClick }: Props) {
  return (
    <Button
      className="w-[40px] h-[40px] rounded-full bg-white cursor-pointer hover:bg-slate-600"
      onClick={onClick}
    >
      {typeMapping.map((item) => {
        if (item.type === type) {
          return item.icon;
        }
      })}
    </Button>
  );
}

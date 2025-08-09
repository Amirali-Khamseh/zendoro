import { Button } from "@/components/ui/button";
import { Fullscreen, Pause, Play, SkipForward, TimerReset } from "lucide-react";

type Props = {
  type: "play" | "pause" | "reset" | "skip" | "focus";
};
const typeMapping = [
  {
    type: "play",
    icon: <Play color="black" fill="black" />,
  },
  {
    type: "pause",
    icon: <Pause color="black" fill="black" />,
  },
  {
    type: "reset",
    icon: <TimerReset color="black" />,
  },
  {
    type: "skip",
    icon: <SkipForward color="black" fill="black" />,
  },
  {
    type: "focus",
    icon: <Fullscreen color="black" fill="black" />,
  },
];
export function TimerButtons({ type }: Props) {
  return (
    <Button className="w-[40px] h-[40px] rounded-full bg-white">
      {typeMapping.map((item) => {
        if (item.type === type) {
          return item.icon;
        }
      })}
    </Button>
  );
}

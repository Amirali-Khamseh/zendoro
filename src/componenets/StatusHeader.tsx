import { useModeStore } from "@/zustand/modeStore";
import { Badge } from "@/components/ui/badge";
import { milliSecToMin } from "@/lib/miliSecToMin";
import { Button } from "@/components/ui/button";
import { minToMilli } from "@/lib/minToMilli";

export function StatusHeader() {
  const { name, focusTime, shortBreak, longBreak, changeMode } = useModeStore();

  const safeChange = (value: number) => {
    const minValue = minToMilli(1); // 1 minute in ms
    return value < minValue ? minValue : value;
  };

  return (
    <div className="flex gap-4">
      {/* Focus Time */}
      <Badge variant="outline" className="flex items-center gap-2 text-white ">
        <Button
          className="rounded-full w-8 h-8 p-0 bg-transparent text-2xl"
          onClick={() =>
            changeMode({
              name,
              focusTime: focusTime + minToMilli(1),
              shortBreak,
              longBreak,
            })
          }
        >
          +
        </Button>
        Focus Time : {milliSecToMin(focusTime)}
        <Button
          className="rounded-full w-8 h-8 p-0 bg-transparent text-2xl"
          onClick={() =>
            changeMode({
              name,
              focusTime: safeChange(focusTime - minToMilli(1)),
              shortBreak,
              longBreak,
            })
          }
        >
          -
        </Button>
      </Badge>

      {/* Short Break */}
      <Badge variant="outline" className="flex items-center gap-2  text-white">
        <Button
          className="rounded-full w-8 h-8 p-0 bg-transparent text-2xl"
          onClick={() =>
            changeMode({
              name,
              focusTime,
              shortBreak: shortBreak + minToMilli(1),
              longBreak,
            })
          }
        >
          +
        </Button>
        Short Break : {milliSecToMin(shortBreak)}
        <Button
          className="rounded-full w-8 h-8 p-0 bg-transparent text-2xl"
          onClick={() =>
            changeMode({
              name,
              focusTime,
              shortBreak: safeChange(shortBreak - minToMilli(1)),
              longBreak,
            })
          }
        >
          -
        </Button>
      </Badge>

      {/* Long Break */}
      <Badge variant="outline" className="flex items-center gap-2  text-white">
        <Button
          className="rounded-full w-8 h-8 p-0 bg-transparent text-2xl"
          onClick={() =>
            changeMode({
              name,
              focusTime,
              shortBreak,
              longBreak: longBreak + minToMilli(1),
            })
          }
        >
          +
        </Button>
        Long Break : {milliSecToMin(longBreak)}
        <Button
          className="rounded-full w-8 h-8 p-0 bg-transparent text-2xl"
          onClick={() =>
            changeMode({
              name,
              focusTime,
              shortBreak,
              longBreak: safeChange(longBreak - minToMilli(1)),
            })
          }
        >
          -
        </Button>
      </Badge>
    </div>
  );
}

import { useModeStore } from "@/zustand/modeStore";
import { Badge } from "@/components/ui/badge";
import { milliSecToMin } from "@/lib/miliSecToMin";
import { Button } from "@/components/ui/button";
import { minToMilli } from "@/lib/minToMilli";

function TimeBadge({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <Badge
      variant="outline"
      className="flex flex-col items-center gap-1 text-white text-sm px-3 py-2"
    >
      <h3 className="text-xs">{label}</h3>
      <div className="flex items-center gap-1">
        <Button
          className="rounded-full w-6 h-6 p-0 bg-transparent text-lg"
          onClick={onDecrease}
        >
          -
        </Button>
        <span className="text-sm">{milliSecToMin(value)}</span>
        <Button
          className="rounded-full w-6 h-6 p-0 bg-transparent text-lg"
          onClick={onIncrease}
        >
          +
        </Button>
      </div>
    </Badge>
  );
}

export function StatusHeader() {
  const { name, focusTime, shortBreak, longBreak, changeMode } = useModeStore();

  const safeChange = (value: number) => Math.max(value, minToMilli(1));

  return (
    <div className="flex gap-4">
      <TimeBadge
        label="Focus Time"
        value={focusTime}
        onDecrease={() =>
          changeMode({
            name,
            focusTime: safeChange(focusTime - minToMilli(1)),
            shortBreak,
            longBreak,
          })
        }
        onIncrease={() =>
          changeMode({
            name,
            focusTime: focusTime + minToMilli(1),
            shortBreak,
            longBreak,
          })
        }
      />

      <TimeBadge
        label="Short Break"
        value={shortBreak}
        onDecrease={() =>
          changeMode({
            name,
            focusTime,
            shortBreak: safeChange(shortBreak - minToMilli(1)),
            longBreak,
          })
        }
        onIncrease={() =>
          changeMode({
            name,
            focusTime,
            shortBreak: shortBreak + minToMilli(1),
            longBreak,
          })
        }
      />

      <TimeBadge
        label="Long Break"
        value={longBreak}
        onDecrease={() =>
          changeMode({
            name,
            focusTime,
            shortBreak,
            longBreak: safeChange(longBreak - minToMilli(1)),
          })
        }
        onIncrease={() =>
          changeMode({
            name,
            focusTime,
            shortBreak,
            longBreak: longBreak + minToMilli(1),
          })
        }
      />
    </div>
  );
}

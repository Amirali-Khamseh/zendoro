import { useStore } from "@/zustand/store";
import { Badge } from "@/components/ui/badge";
import { milliSecToMin } from "@/lib/miliSecToMin";

export function StatusHeader() {
  const { focusTime, shortBreak, longBreak } = useStore();

  return (
    <div className="flex gap-12 ">
      <Badge variant="outline" className="text-white">
        Focus Time : {milliSecToMin(focusTime)}
      </Badge>
      <Badge variant="outline" className="text-white">
        Short Break : {milliSecToMin(shortBreak)}
      </Badge>
      <Badge variant="outline" className="text-white">
        Long Break : {milliSecToMin(longBreak)}
      </Badge>
    </div>
  );
}

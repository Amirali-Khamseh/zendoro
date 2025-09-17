import { useModeStore, type ZendoroModeType } from "@/zustand/modeStore";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { milliSecToMin } from "@/lib/miliSecToMin";

type Props = {
  title: string;
  details: string;
  time: ZendoroModeType;
};

export function Mode({ title, details, time }: Props) {
  const {
    changeMode,
    name: currentMode,
    focusTime,
    shortBreak,
    longBreak,
  } = useModeStore();

  function setContextMode() {
    changeMode(time);
  }

  const isSelected = currentMode === time.name;

  // Show current store values if this mode is selected, otherwise show the mode's default values
  const displayDetails = isSelected
    ? `${milliSecToMin(focusTime)}min / ${milliSecToMin(shortBreak)}min / ${milliSecToMin(longBreak)}min`
    : details;

  return (
    <div
      className={`
        flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border bg-background hover:bg-muted/50 hover:border-muted-foreground/20"
        }
      `}
      onClick={setContextMode}
    >
      <RadioGroupItem
        value={time.name}
        id={time.name}
        checked={isSelected}
        className="shrink-0"
      />
      <Label htmlFor={time.name} className="flex-1 cursor-pointer">
        <div className="space-y-1">
          <div
            className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}
          >
            {title}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {displayDetails}
          </div>
        </div>
      </Label>
    </div>
  );
}

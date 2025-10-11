import { useModeStore, type ZendoroModeType } from "@/zustand/modeStore";
import { milliSecToMin } from "@/lib/miliSecToMin";

type Props = {
  title: string;
  details: string;
  time: ZendoroModeType;
};

export function Mode({ title, details, time }: Props) {
  const { changeMode, currentMode } = useModeStore() as {
    changeMode: (mode: ZendoroModeType) => void;
    currentMode: ZendoroModeType | null;
  };

  function setContextMode() {
    changeMode(time);
  }

  const isSelected = currentMode?.name === time.name;

  // Show current store values if this mode is selected, otherwise show the mode's default values
  const displayDetails =
    isSelected && currentMode
      ? `${milliSecToMin(currentMode.focusTime)}min / ${milliSecToMin(currentMode.shortBreak)}min / ${milliSecToMin(currentMode.longBreak)}min`
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
      <div
        className={`w-4 h-4 rounded-full border-2 shrink-0 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground"}`}
      />
      <div className="flex-1 cursor-pointer">
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
      </div>
    </div>
  );
}

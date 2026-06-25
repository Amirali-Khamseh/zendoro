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
          ? "border-white/40 bg-white/10 shadow-sm"
          : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30"
      }
      `}
      onClick={setContextMode}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 shrink-0 ${isSelected ? "bg-white border-white" : "border-white/40"}`}
      />
      <div className="flex-1 cursor-pointer">
        <div className="space-y-1">
          <div
            className={`font-medium ${isSelected ? "text-white" : "text-white/80"}`}
          >
            {title}
          </div>
          <div className="text-xs text-white/60 font-mono">
            {displayDetails}
          </div>
        </div>
      </div>
    </div>
  );
}

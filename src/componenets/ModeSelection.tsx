import { RadioGroup } from "@/components/ui/radio-group";
import { modesValue } from "@/constants/data";
import { Mode } from "./Modes";
import { useModeStore } from "@/zustand/modeStore";

export function ModeSelection() {
  const { name: currentMode, changeMode } = useModeStore();

  const handleModeChange = (value: string) => {
    const selectedMode = modesValue.find((mode) => mode.time.name === value);
    if (selectedMode) {
      changeMode(selectedMode.time);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Focus Mode</h3>
        <p className="text-sm text-muted-foreground">
          Select the timer configuration that works best for you
        </p>
      </div>

      <RadioGroup
        value={currentMode}
        onValueChange={handleModeChange}
        className="space-y-3"
      >
        {modesValue.map((mode) => (
          <Mode
            key={mode.title}
            title={mode.title}
            details={mode.details}
            time={mode.time}
          />
        ))}
      </RadioGroup>
    </div>
  );
}

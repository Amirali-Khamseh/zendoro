import { modesValue } from "@/constants/data";

import { useModeStore } from "@/zustand/modeStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ModeSelection() {
  const { name: currentMode, changeMode } = useModeStore();

  const handleModeChange = (value: string) => {
    const selectedMode = modesValue.find((mode) => mode.time.name === value);
    if (selectedMode) {
      changeMode(selectedMode.time);
    }
  };

  return (
    <div className="">
      <Tabs
        value={currentMode}
        onValueChange={handleModeChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          {modesValue.map((mode) => (
            <TabsTrigger
              key={mode.title}
              value={mode.time.name}
              className="text-sm data-[state=active]:shadow-lg data-[state=active]:shadow-black/80"
            >
              {mode.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

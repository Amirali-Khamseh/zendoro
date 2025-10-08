import { useModeStore } from "@/zustand/modeStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

export function ModeSelection() {
  const {
    name: currentMode,
    changeMode,
    availableModes,
    isLoading,
    fetchAvailableModes,
  } = useModeStore();

  useEffect(() => {
    // Fetch available modes when component mounts
    if (availableModes.length === 0) {
      fetchAvailableModes();
    }
  }, [fetchAvailableModes, availableModes.length]);

  const handleModeChange = (value: string) => {
    const selectedMode = availableModes.find((mode) => mode.name === value);
    if (selectedMode) {
      changeMode(selectedMode);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-sm">
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <Tabs
        value={currentMode}
        onValueChange={handleModeChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          {availableModes.map((mode) => (
            <TabsTrigger
              key={mode.name}
              value={mode.name}
              className="text-xs md:text-sm data-[state=active]:shadow-lg data-[state=active]:shadow-black/80"
            >
              {mode.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

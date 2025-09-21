import { StatusHeader } from "@/componenets/StatusHeader";
import { StatusTopLine } from "@/componenets/StatusTopLine";
import { Timer } from "@/componenets/Timer/Timer";
import { ModeSelection } from "@/componenets/ModeSelection";
import { useModeStore } from "@/zustand/modeStore";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  useDocumentTitle("Focus Timer");

  const { focusTime } = useModeStore();
  const [timerKey, setTimerKey] = useState(0);

  // Force timer re-render when mode changes
  useEffect(() => {
    setTimerKey((prev) => prev + 1);
  }, [focusTime]);

  return (
    <section className="w-full flex p-4 gap-8">
      {/* Mode Selection Panel */}
      <div className="w-80 flex-shrink-0">
        <ModeSelection />
      </div>

      {/* Timer Panel */}
      <div className="flex-1 flex flex-col gap-4 items-center">
        <StatusTopLine />
        <StatusHeader />
        <Timer key={timerKey} initialTime={focusTime} />
      </div>
    </section>
  );
}

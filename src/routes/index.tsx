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
    <div className="max-w-7xl mx-auto p-2 md:p-4 overflow-x-hidden">
      <section className="flex gap-4 md:gap-8">
        {/* Timer Panel */}
        <div className="flex-1 flex flex-col gap-3 md:gap-4 items-center">
          <StatusTopLine />
          <ModeSelection />
          <Timer key={timerKey} initialTime={focusTime} />
          <StatusHeader />
        </div>
      </section>
    </div>
  );
}

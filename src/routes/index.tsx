import { StatusHeader } from "@/componenets/StatusHeader";
import { StatusTopLine } from "@/componenets/StatusTopLine";
import { Timer } from "@/componenets/Timer/Timer";
import { ModeSelection } from "@/componenets/ModeSelection";
import { useModeStore, type ZendoroModeType } from "@/zustand/modeStore";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isAuthenticated } from "@/lib/authVerification";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function RouteComponent() {
  useDocumentTitle("Focus Timer");

  const { currentMode, fetchAvailableModes } = useModeStore() as {
    currentMode: ZendoroModeType | null;
    fetchAvailableModes: () => void;
  };
  const [timerKey, setTimerKey] = useState(0);

  const focusTime = currentMode?.focusTime || 25 * 60 * 1000; // Default to 25 minutes

  // Fetch available modes when component mounts
  useEffect(() => {
    if (!currentMode) {
      fetchAvailableModes();
    }
  }, [currentMode, fetchAvailableModes]);

  // Force timer re-render when mode changes
  useEffect(() => {
    setTimerKey((prev) => prev + 1);
  }, [currentMode]);

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

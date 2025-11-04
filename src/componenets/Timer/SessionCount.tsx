import { useEffect } from "react";
import { useModeStore } from "@/zustand/modeStore";

export default function SessionCount() {
  // subscribe only to the value we need (prevents unnecessary re-renders)
  const { currentFocusSessionCount, fetchFocusSessionCount } =
    useModeStore() as {
      currentFocusSessionCount: number;
      fetchFocusSessionCount?: () => Promise<void>;
    };

  // ensure we request the latest count when the component mounts
  useEffect(() => {
    if (fetchFocusSessionCount) fetchFocusSessionCount();
  }, [fetchFocusSessionCount]);
  return (
    <div className="flex gap-4 mt-4 w-full">
      <div className="flex flex-col justify-between items-center bg-white/15 rounded-2xl p-3 flex-1">
        <div className="text-white text-xs font-semibold uppercase tracking-wide mb-1">
          Session Count
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white  font-bold font-beba">
            #{currentFocusSessionCount}
          </span>
        </div>
      </div>
    </div>
  );
}

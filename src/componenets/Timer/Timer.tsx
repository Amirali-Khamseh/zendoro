import { useEffect, useRef, useState } from "react";
import { TimerButtons } from "./TimerButtons";
import { formatTime } from "@/lib/formatTime";
import { FocusButton } from "../FocusButton";
import { useModeStore, type ZendoroModeType } from "@/zustand/modeStore";

import { getNextSessionInfo } from "./utils/getNextSessionInfo";
import { getCurrentSessionIcon } from "./utils/getCurrentSessionIcon";
import SessionCount from "./SessionCount";

type Props = {
  initialTime: number;
};

export function Timer({ initialTime }: Props) {
  const { currentMode } = useModeStore() as {
    currentMode: ZendoroModeType | null;
  };

  // Get timer values from currentMode, with fallbacks
  const focusTime = currentMode?.focusTime || initialTime;
  const shortBreak = currentMode?.shortBreak || initialTime;
  const longBreak = currentMode?.longBreak || initialTime;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [focusSessionCount, setFocusSessionCount] = useState(0);

  const [currentSessionType, setCurrentSessionType] = useState<
    "focus" | "longBreak" | "shortBreak"
  >("focus");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isInFocusSession = currentSessionType === "focus";

  // Initialize timer when currentMode is first loaded
  useEffect(() => {
    if (currentMode && timeLeft === initialTime) {
      setTimeLeft(focusTime);
    }
  }, [currentMode, focusTime, initialTime, timeLeft]);
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 100) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);

            if (currentSessionType === "focus") {
              const newCount = focusSessionCount + 1;
              setFocusSessionCount(newCount);

              if (newCount % 4 === 0) {
                setTimeLeft(longBreak);
                setCurrentSessionType("longBreak");
              } else {
                setTimeLeft(shortBreak);
                setCurrentSessionType("shortBreak");
              }
            } else {
              setTimeLeft(focusTime);
              setCurrentSessionType("focus");
            }
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isRunning,
    focusSessionCount,
    focusTime,
    shortBreak,
    longBreak,
    currentSessionType,
  ]);

  // Update timer when currentMode changes or session type changes
  useEffect(() => {
    if (!isRunning) {
      // Only update if timer is not running
      if (currentSessionType === "focus") {
        setTimeLeft(focusTime);
      } else if (currentSessionType === "shortBreak") {
        setTimeLeft(shortBreak);
      } else if (currentSessionType === "longBreak") {
        setTimeLeft(longBreak);
      }
    }
  }, [focusTime, shortBreak, longBreak, currentSessionType, isRunning]);

  {
    /* Handlers and Helper functions */
  }
  const toggleTimerState = () => {
    setIsRunning((prev) => !prev);
  };
  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };
  const pause = () => {
    setIsRunning(false);
  };
  const reset = () => {
    setIsRunning(false);
    if (currentSessionType === "focus") {
      setTimeLeft(focusTime);
    } else if (currentSessionType === "shortBreak") {
      setTimeLeft(shortBreak);
    } else {
      setTimeLeft(longBreak);
    }
  };
  const handleSkip = () => {
    if (isInFocusSession) {
      const newCount = focusSessionCount + 1;
      setFocusSessionCount(newCount);

      if (newCount % 4 === 0) {
        setTimeLeft(longBreak);
        setCurrentSessionType("longBreak");
      } else {
        setTimeLeft(shortBreak);
        setCurrentSessionType("shortBreak");
      }
    } else {
      setTimeLeft(focusTime);
      setCurrentSessionType("focus");
    }

    setIsRunning(false);
  };

  const nextSessionInfo = getNextSessionInfo(
    currentSessionType,
    focusSessionCount,
  );

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[400px] mx-auto rounded-xl flex flex-col items-center px-0 sm:px-4 md:px-6 overflow-hidden">
      {/* Content on top */}
      <div className="relative z-10 w-full flex flex-col items-center max-w-full">
        <h1 className="text-xl text-[6rem] font-beba font-bold text-white text-center break-words px-2">
          {formatTime(timeLeft)}
        </h1>

        <div className="flex gap-0.5 sm:gap-2 justify-center w-full flex-wrap max-w-full px-1">
          {isRunning ? (
            <TimerButtons type="pause" onClick={pause} />
          ) : (
            <TimerButtons type="play" onClick={start} />
          )}
          <TimerButtons type="reset" onClick={reset} />
          <TimerButtons type="skip" onClick={handleSkip} />
          <FocusButton
            isRunning={isRunning}
            timeLeft={timeLeft}
            toggleTimerState={toggleTimerState}
          />
        </div>
        {/* Stepper */}
        <div className="flex flex-col items-center w-full mt-2 sm:mt-6 max-w-full">
          {/* Row with circles + connector */}
          <div className="flex items-center w-full max-w-full px-0 sm:px-6 py-2 sm:py-4">
            {/* Current Step Circle */}
            <div className="flex items-center justify-center w-4 h-4 sm:w-8 sm:h-8 bg-white rounded-full border-1 sm:border-4 border-white shadow-[0_0_4px_1px_rgba(255,255,255,0.5)] sm:shadow-[0_0_8px_2px_rgba(255,255,255,0.6),0_0_0_4px_rgba(255,0,182,0.2)] flex-shrink-0">
              <span className="scale-50 sm:scale-100">
                {getCurrentSessionIcon(currentSessionType)}
              </span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-[1px] sm:h-[2px] bg-white/30 relative mx-1 sm:mx-2 min-w-0">
              <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-white/30 rounded-full"></div>
            </div>

            {/* Next Step Circle */}
            <div className="flex items-center justify-center w-4 h-4 sm:w-8 sm:h-8 bg-white/20 rounded-full border-1 sm:border-2 border-white/40 flex-shrink-0">
              <span className="scale-50 sm:scale-100">
                {nextSessionInfo.icon}
              </span>
            </div>
          </div>

          {/* Row with labels */}
          <div className="flex justify-between w-full mt-0.5 sm:mt-2 px-0 sm:px-6 max-w-full overflow-hidden">
            <span className="text-white text-[8px] sm:text-xs font-medium capitalize truncate max-w-[35%] leading-tight">
              {currentSessionType === "longBreak"
                ? "Long Break"
                : currentSessionType === "shortBreak"
                  ? "Short Break"
                  : "Focus"}
            </span>
            <span className="text-white/60 text-[8px] sm:text-xs font-light truncate max-w-[35%] text-right leading-tight">
              {nextSessionInfo.label}
            </span>
          </div>
        </div>

        {/* Session Count */}
        <SessionCount sessionCount={focusSessionCount} />
      </div>
    </div>
  );
}

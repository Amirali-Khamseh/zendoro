import { useEffect, useRef, useState } from "react";
import { TimerButtons } from "./TimerButtons";
import { formatTime } from "@/lib/formatTime";
import { FocusButton } from "../FocusButton";
import { useModeStore } from "@/zustand/modeStore";

import { getNextSessionInfo } from "./utils/getNextSessionInfo";
import { getCurrentSessionIcon } from "./utils/getCurrentSessionIcon";
import SessionCount from "./SessionCount";

type Props = {
  initialTime: number;
};

export function Timer({ initialTime }: Props) {
  const { focusTime, longBreak, shortBreak } = useModeStore();
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [focusSessionCount, setFocusSessionCount] = useState(0);

  const [currentSessionType, setCurrentSessionType] = useState<
    "focus" | "longBreak" | "shortBreak"
  >("focus");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isInFocusSession = currentSessionType === "focus";
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

  useEffect(() => {
    if (currentSessionType === "focus") {
      setTimeLeft(focusTime);
    }
  }, [focusTime]);

  useEffect(() => {
    if (currentSessionType === "shortBreak") {
      setTimeLeft(shortBreak);
    }
  }, [shortBreak]);

  useEffect(() => {
    if (currentSessionType === "longBreak") {
      setTimeLeft(longBreak);
    }
  }, [longBreak]);

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
    setTimeLeft(initialTime);
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
    <div className="relative w-[400px] rounded-xl flex flex-col items-center p-6 overflow-hidden">
      {/* Background Glow Effects */}
      <div
        className="absolute bottom-0 left-[-20%] right-0 top-[-10%] 
                  h-[500px] w-[500px] rounded-full 
                  bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"
      ></div>
      <div
        className="absolute bottom-0 right-[-20%] top-[-10%] 
                  h-[500px] w-[500px] rounded-full 
                  bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"
      ></div>

      {/* Content on top */}
      <div className="relative z-10">
        <h1 className="text-[6rem] font-beba font-bold text-white">
          {formatTime(timeLeft)}
        </h1>

        <div className="flex gap-2">
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
        <div className="flex flex-col items-center w-full mt-6">
          {/* Row with circles + connector */}
          <div className="flex items-center w-full">
            {/* Current Step Circle */}
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full border-4 border-white shadow-[0_0_12px_4px_rgba(255,255,255,0.7),0_0_0_6px_rgba(255,0,182,0.25)]">
              {getCurrentSessionIcon(currentSessionType)}
            </div>

            {/* Connector */}
            <div className="flex-1 h-[2px] bg-white/30 relative mx-2">
              <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-white/30 rounded-full"></div>
            </div>

            {/* Next Step Circle */}
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full border-2 border-white/40">
              {nextSessionInfo.icon}
            </div>
          </div>

          {/* Row with labels */}
          <div className="flex justify-between w-full mt-2">
            <span className="text-white text-xs font-semibold capitalize">
              {currentSessionType === "longBreak"
                ? "Long Break"
                : currentSessionType === "shortBreak"
                  ? "Short Break"
                  : "Focus"}
            </span>
            <span className="text-white/70 text-xs font-medium">
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

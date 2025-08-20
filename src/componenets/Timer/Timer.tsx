import { useContext, useEffect, useRef, useState } from "react";
import { TimerButtons } from "./TimerButtons";
import { formatTime } from "@/lib/formatTime";
import { FocusButton } from "../FocusButton";

import { isNextSessionLongBreak } from "./isNextSessionLongBreak";
import { isOneBeforeLongBreak } from "./isOneBeforeLongBreak";
import { modeContext } from "@/context/modeContext";

type Props = {
  initialTime: number;
};

export function Timer({ initialTime }: Props) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [focusSessionCount, setFocusSessionCount] = useState(0);
  {
    /*The reason the type is not enum is cause i needed to make a key value pair of both and was much more work to do in order to limit tehse types */
  }
  const [currentSessionType, setCurrentSessionType] = useState<
    "focus" | "longBreak" | "shortBreak"
  >("focus");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { shortBreak, longBreak, focusTime } = useContext(modeContext);
  /* Keeping track of  Pomodor sessions*/
  const isInFocusSession = currentSessionType === "focus";
  /* Handlers */
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
  /* Timer effect */
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 100) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            // when timer finishes
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
              // Just finished a break, start next focus session
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
  /* Sync the initialTime with Context value and update session type */
  useEffect(() => {
    setTimeLeft(initialTime);
    setIsRunning(false);

    // Update the current session type based on the new initialTime
    if (initialTime === focusTime) {
      setCurrentSessionType("focus");
    } else if (initialTime === shortBreak) {
      setCurrentSessionType("shortBreak");
    } else if (initialTime === longBreak) {
      setCurrentSessionType("longBreak");
    }
  }, [initialTime, focusTime, shortBreak, longBreak]);

  function toggleTimerState() {
    setIsRunning((prev) => !prev);
  }
  return (
    <div className="w-[400px] h-[250px] rounded-xl flex  flex-col items-center p-6 bg-gradient-to-r from-blue-400 to-blue-200  ">
      <h1 className="text-[6rem]  font-beba font-bold">
        {formatTime(timeLeft)}
      </h1>
      <div className="  flex gap-2">
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

      <div className="text-sm mb-2 text-white">
        Focus Sessions: {focusSessionCount} | Next:{" "}
        {isNextSessionLongBreak(focusSessionCount) && focusSessionCount > 0
          ? "Long Break"
          : isOneBeforeLongBreak(focusSessionCount)
            ? "Long Break after this"
            : "Short Break"}
      </div>
    </div>
  );
}

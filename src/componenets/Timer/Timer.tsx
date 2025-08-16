import { useEffect, useRef, useState } from "react";
import { TimerButtons } from "./TimerButtons";
import { formatTime } from "@/lib/formatTime";
import { FocusButton } from "../FocusButton";
type Props = {
  initialTime: number;
  onFinish?: () => void;
};
export function Timer({ initialTime, onFinish }: Props) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
  /* Timer effect */
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 100) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            onFinish?.();
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
  }, [isRunning, onFinish]);
  /*Sync the intialTime with Context value */
  useEffect(() => {
    setTimeLeft(initialTime);
    setIsRunning(false);
  }, [initialTime]);

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
        <TimerButtons type="skip" onClick={() => alert("change mode")} />
        <FocusButton />
      </div>
    </div>
  );
}

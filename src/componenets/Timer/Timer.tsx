import { useEffect, useState } from "react";
import { TimerButtons } from "./TimerButtons";
import { formatTime } from "@/lib/formatTime";
type Props = {
  duration: number;
};
export function Timer({ duration }: Props) {
  const [time, setTime] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      isRunning ? setTime(time - 1000) : setTime(time);
    }, 1000);
  }, [time]);
  return (
    <div className="w-[400px] h-[250px] rounded-xl flex  flex-col items-center p-6 bg-gradient-to-r from-blue-400 to-blue-200  ">
      {isRunning ? "isRunning" : "isNotRunning"}
      <h1 className="text-[6rem]  font-beba font-bold">{formatTime(time)}</h1>
      <div className="  flex gap-2">
        {isRunning ? (
          <TimerButtons
            type="pause"
            onClick={() => setIsRunning((prev) => !prev)}
          />
        ) : (
          <TimerButtons
            type="play"
            onClick={() => setIsRunning((prev) => !prev)}
          />
        )}
        <TimerButtons
          type="reset"
          onClick={() => setIsRunning((prev) => !prev)}
        />
        <TimerButtons
          type="skip"
          onClick={() => setIsRunning((prev) => !prev)}
        />
        <TimerButtons
          type="focus"
          onClick={() => setIsRunning((prev) => !prev)}
        />
      </div>
    </div>
  );
}

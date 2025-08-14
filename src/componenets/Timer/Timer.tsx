import { useEffect, useState } from "react";
import { TimerButtons } from "./TimerButtons";
import { formatTime } from "@/lib/formatTime";
import { FocusButton } from "../FocusButton";
type Props = {
  time: number;
};
export function Timer({ time }: Props) {
  const [timer, setTimer] = useState<number>(time);
  const [isRunning, setIsRunning] = useState(true);
  useEffect(() => setTimer(time), [time]);
  useEffect(() => {
    //TODO : the condition isn't strong enough and its lagging for a duration of 1 second
    //TODO : fomatiing the min and sec to show two digits when showing 0
    if (timer < 0) return;
    setTimeout(() => {
      if (isRunning && timer !== 0) {
        setTimer((timer) => timer - 1000);
      } else {
        setTimer((timer) => timer + 0);
      }
    }, 1000);
  }, [timer, isRunning]);

  return (
    <div className="w-[400px] h-[250px] rounded-xl flex  flex-col items-center p-6 bg-gradient-to-r from-blue-400 to-blue-200  ">
      {isRunning ? "isRunning" : "isNotRunning"}
      <h1 className="text-[6rem]  font-beba font-bold">{formatTime(timer)}</h1>
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
        <TimerButtons type="reset" onClick={() => setTimer(0)} />
        <TimerButtons type="skip" onClick={() => alert("change mode")} />
        <FocusButton />
      </div>
    </div>
  );
}

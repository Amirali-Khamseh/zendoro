import { useEffect, useState } from "react";
import { TimerButtons } from "./TimerButtons";
import { formatTime } from "@/lib/formatTime";
import { FocusButton } from "../FocusButton";
type Props = {
  focusTime: number;
  shortBreak: number;
  longBreak: number;
};
export function Timer({ focusTime, shortBreak, longBreak }: Props) {
  const [time, setTime] = useState(focusTime);
  const [isRunning, setIsRunning] = useState(true);
  console.log(`shortbreak: ${shortBreak} , longBreak:${longBreak}`);
  useEffect(() => {
    //TODO : the condition isn't strong enough and its lagging for a duration of 1 second
    //TODO : fomatiing the min and sec to show two digits when showing 0
    if (time < 0) return;
    setTimeout(() => {
      if (isRunning && time !== 0) {
        setTime((time) => time - 1000);
      } else {
        setTime((time) => time + 0);
      }
    }, 1000);
  }, [time, isRunning]);

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
        <TimerButtons type="reset" onClick={() => setTime(0)} />
        <TimerButtons type="skip" onClick={() => alert("change mode")} />
        <FocusButton />
      </div>
    </div>
  );
}

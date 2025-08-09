import { TimerButtons } from "./TimerButtons";

export function Timer() {
  return (
    <div className="w-[400px] h-[250px] rounded-xl flex  flex-col items-center p-6 bg-gradient-to-r from-blue-400 to-blue-200  ">
      <h1 className="text-[6rem]  font-beba font-bold">22:00</h1>
      <div className="  flex gap-2">
        <TimerButtons type="play" />
        {/* <TimerButtons type="pause" /> */}
        <TimerButtons type="reset" />
        <TimerButtons type="skip" />
        <TimerButtons type="focus" />
      </div>
    </div>
  );
}

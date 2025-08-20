import { Timer } from "./Timer/Timer";
import { useContext } from "react";
import { milliSecToMin } from "@/lib/miliSecToMin";
import { modeContext } from "@/context/modeContext";

export function MainContent() {
  const { name, focusTime, shortBreak, longBreak } = useContext(modeContext);
  return (
    <section className="w-full  flex flex-col gap-4 items-center p-4 ">
      <h2 className="font-beba font-medium text-2xl">{name}</h2>
      <p>short-break : {milliSecToMin(shortBreak)}</p>
      <p>long-break: {milliSecToMin(longBreak)}</p>
      <Timer initialTime={focusTime} />
    </section>
  );
}

import { Timer } from "./Timer/Timer";
import { useContext } from "react";
import { miliSecToMin } from "@/lib/miliSecToMin";
import { modeContext } from "@/App";

export function MainContent() {
  const { name, focusTime, shortBreak, longBreak } = useContext(modeContext);
  return (
    <section className="w-[80%]  flex flex-col gap-4 items-center p-4 ">
      <h2 className="font-beba font-medium text-2xl">{name}</h2>
      <p>short-break : {miliSecToMin(shortBreak)}</p>
      <p>long-break: {miliSecToMin(longBreak)}</p>
      {/*Here after one time in mode is done i should pass the other one */}
      <Timer time={focusTime} />
    </section>
  );
}

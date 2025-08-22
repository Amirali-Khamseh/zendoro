import { Timer } from "./Timer/Timer";
import { useContext } from "react";

import { modeContext } from "@/context/modeContext";
import { StatusHeader } from "./StatusHeader";
import { StatusTopLine } from "./StatusTopLine";

export function MainContent() {
  const { focusTime } = useContext(modeContext);
  return (
    <section className="w-full  flex flex-col gap-4 items-center p-4 ">
      <StatusTopLine />
      <StatusHeader />
      <Timer initialTime={focusTime} />
    </section>
  );
}

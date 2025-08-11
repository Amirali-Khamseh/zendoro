import { miliSecToMin } from "@/lib/miliSecToMin";
import { Timer } from "./Timer/Timer";

export function MainContent() {
  return (
    <section className="w-[80%]  flex flex-col gap-4 items-center p-4 ">
      <h2 className="font-beba font-medium text-2xl">Standard</h2>
      <Timer duration={miliSecToMin(60)} />
    </section>
  );
}

import { StatusHeader } from "@/componenets/StatusHeader";
import { StatusTopLine } from "@/componenets/StatusTopLine";
import { Timer } from "@/componenets/Timer/Timer";
import { useModeStore } from "@/zustand/modeStore";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { focusTime } = useModeStore();
  return (
    <section className="w-full flex p-4">
      <div className="w-full flex flex-col gap-4 items-center ">
        <StatusTopLine />
        <StatusHeader />
        <Timer initialTime={focusTime} />
      </div>
    </section>
  );
}

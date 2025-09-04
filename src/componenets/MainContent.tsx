import { Timer } from "./Timer/Timer";

import { useModeStore } from "@/zustand/modeStore";
import { StatusHeader } from "./StatusHeader";
import { StatusTopLine } from "./StatusTopLine";
import TodoList from "./TodoList/TodoList";

export function MainContent() {
  const { focusTime } = useModeStore();
  return (
    <section className="w-full flex p-4">
      <div className="w-1/2 flex flex-col gap-4 items-center ">
        <StatusTopLine />
        <StatusHeader />
        <Timer initialTime={focusTime} />
      </div>
      <div className="w-1/2">
        <TodoList />
      </div>
    </section>
  );
}

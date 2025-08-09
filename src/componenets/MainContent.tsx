import { Timer } from "./Timer/Timer";

export function MainContent() {
  return (
    <section className="w-[80%] border-2 border-black flex flex-col gap-4 items-center p-4">
      <h2 className="bloc">I should be a dynamic title</h2>
      <Timer />
    </section>
  );
}

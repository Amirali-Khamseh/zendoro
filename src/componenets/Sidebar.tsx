import { RadioGroup } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { modesValue } from "@/constants/data";
import { Mode } from "./Modes";
import { Link } from "@tanstack/react-router";
export function Sidebar() {
  return (
    <section className="w-full h-screen  border-gray-300 p-4">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <Link to="/">Focus Time</Link>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <RadioGroup defaultValue="option-one">
              {modesValue.map((mode) => (
                <Mode
                  key={mode.title}
                  title={mode.title}
                  details={mode.details}
                  time={mode.time}
                />
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <Link to="/habit-tracker">Habit Tracker</Link>
        </AccordionItem>
        <AccordionItem value="item-3">
          <Link to="/todo">TODOs</Link>
        </AccordionItem>
        <AccordionItem value="item-4">
          <Link to="/reminder">Reminder</Link>
        </AccordionItem>
        <AccordionItem value="item-5">
          <Link to="/">Weekly Planner</Link>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

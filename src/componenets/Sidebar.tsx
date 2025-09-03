import { RadioGroup } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { modesValue } from "@/constants/data";
import { Mode } from "./Modes";
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
          <AccordionTrigger>Modes</AccordionTrigger>
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
        <AccordionItem value="item-2">Habbit Tracker </AccordionItem>
        <AccordionItem value="item-2">Reminder </AccordionItem>
        <AccordionItem value="item-2">Weekly Planner </AccordionItem>
      </Accordion>
    </section>
  );
}

import { RadioGroup } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ModesValue } from "@/constants/data";
import { Modes } from "./Modes";
export function Sidebar() {
  return (
    <section className="w-[20%] h-screen rounded-r-lg border-r-1 border-gray-300 p-4">
      {/* <section className="w-[20%] h-[calc(100vh-60px)] rounded-r-lg border-r-1 border-gray-300 p-4"> */}
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
              {/* TODO: Why Radio button doesn't show up when i use it
              indirectly */}
              {ModesValue.map((mode) => (
                <Modes
                  key={mode.title}
                  title={mode.title}
                  details={mode.details}
                  time={mode.time}
                />
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

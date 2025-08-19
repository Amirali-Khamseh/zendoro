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
    <section className="w-full h-screen rounded-r-lg border-r-1 border-gray-300 p-4">
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
      </Accordion>
    </section>
  );
}

import { modeContext, type ModeContextType } from "@/context/modeContext";
import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { useContext } from "react";
type Props = {
  title: string;
  details: string;
  time: ModeContextType;
};
export function Mode({ title, details, time }: Props) {
  const { changeMode } = useContext(modeContext);
  function setContextMode() {
    changeMode(time);
  }
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="option-one" id="option-one" />
      <div onClick={setContextMode} className="cursor-pointer">
        {title}
        <h4 className="text-gray-400 text-xs">{details}</h4>
      </div>
    </div>
  );
}

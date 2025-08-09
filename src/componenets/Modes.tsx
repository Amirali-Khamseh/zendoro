import { RadioGroupItem } from "@radix-ui/react-radio-group";
type Props = {
  title: string;
  details: string;
};
export function Modes({ title, details }: Props) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="option-one" id="option-one" />
      <div>
        {title}
        <h4 className="text-gray-400 text-xs">{details}</h4>
      </div>
    </div>
  );
}

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useModeStore } from "@/zustand/modeStore";
import { milliSecToMin } from "@/lib/miliSecToMin";
import { minToMilli } from "@/lib/minToMilli";
import { GradientButton } from "./customUIComponenets/CustomButton";

export function StatusTopLine() {
  const { name, changeMode, shortBreak, longBreak, focusTime } = useModeStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSumbit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newMode = {
      focusTime: Number(formData.get("focusTime")),
      shortBreak: Number(formData.get("shortBreak")),
      longBreak: Number(formData.get("longBreak")),
    };

    const newErrors: Record<string, string> = {};

    if (!newMode.focusTime || newMode.focusTime <= 0) {
      newErrors.focusTime = "Focus time must be greater than 0.";
    }

    if (!newMode.shortBreak || newMode.shortBreak <= 0) {
      newErrors.shortBreak = "Short break must be greater than 0.";
    }

    if (!newMode.longBreak || newMode.longBreak <= 0) {
      newErrors.longBreak = "Long break must be greater than 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    changeMode({
      name: newMode.name,
      focusTime: minToMilli(newMode.focusTime),
      shortBreak: minToMilli(newMode.shortBreak),
      longBreak: minToMilli(newMode.longBreak),
    });
  }

  return (
    <Popover>
      <PopoverTrigger className="w-[400px] flex items-center justify-center gap-2 font-beba font-medium text-2xl cursor-pointer">
        <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent flex-1" />
        <span className="text-white px-2">{name}</span>
        <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent flex-1" />
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <form className="grid gap-4" onSubmit={handleSumbit}>
          <div className="space-y-2">
            <h4 className="leading-none font-medium"> Mode Configuration</h4>
            <p className="text-muted-foreground text-sm">
              Customize your Mode based on your Mood :)
            </p>
          </div>
          <div className="grid gap-4">
            {/* Mode Name */}
            <div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxHeight">Mode name</Label>
                <Input
                  readOnly
                  id="maxHeight"
                  name="name"
                  defaultValue={name}
                  maxLength={30}
                  className={`col-span-2 h-8 ${
                    errors.name ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Focus Time */}
            <div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Focus Time</Label>
                <Input
                  id="width"
                  name="focusTime"
                  defaultValue={milliSecToMin(focusTime)}
                  type="number"
                  min={1}
                  className={`col-span-2 h-8 ${
                    errors.focusTime ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
              {errors.focusTime && (
                <p className="text-red-500 text-sm mt-1">{errors.focusTime}</p>
              )}
            </div>

            {/* Short Break */}
            <div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">Short Break</Label>
                <Input
                  id="maxWidth"
                  name="shortBreak"
                  defaultValue={milliSecToMin(shortBreak)}
                  type="number"
                  min={1}
                  className={`col-span-2 h-8 ${
                    errors.shortBreak ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
              {errors.shortBreak && (
                <p className="text-red-500 text-sm mt-1">{errors.shortBreak}</p>
              )}
            </div>

            {/* Long Break */}
            <div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">Long Break</Label>
                <Input
                  id="height"
                  name="longBreak"
                  defaultValue={milliSecToMin(longBreak)}
                  type="number"
                  min={1}
                  className={`col-span-2 h-8 ${
                    errors.longBreak ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
              {errors.longBreak && (
                <p className="text-red-500 text-sm mt-1">{errors.longBreak}</p>
              )}
            </div>
          </div>

          <GradientButton type="submit">Save</GradientButton>
        </form>
      </PopoverContent>
    </Popover>
  );
}

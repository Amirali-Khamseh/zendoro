/*


TODO : FIX THE FORM SUBMISSION

*/
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useContext, useState } from "react";
import { modeContext, type ModeContextType } from "@/context/modeContext";
import { Button } from "@/components/ui/button";
import { milliSecToMin } from "@/lib/miliSecToMin";
export function StatusTopLine() {
  const { name, changeMode, shortBreak, longBreak, focusTime } =
    useContext(modeContext);
  const [newMode, setNewMode] = useState({
    name,
    changeMode,
    shortBreak,
    longBreak,
    focusTime,
  });
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    //TODO:  i gotta  do validation, Maybe i can use some toast or Error state
    changeMode(newMode);
  }

  return (
    <Popover>
      <PopoverTrigger className="font-beba font-medium text-2xl text-white cursor-pointer">
        {name}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h4 className="leading-none font-medium"> Mode Configuration</h4>
            <p className="text-muted-foreground text-sm">
              Customize your Mode based on your Mood :)
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Mode name</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
                value={newMode.name}
                onChange={(e) =>
                  setNewMode({ ...newMode, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Focus Time</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
                value={milliSecToMin(newMode.focusTime)}
                onChange={(e) =>
                  setNewMode({
                    ...newMode,
                    focusTime: milliSecToMin(Number(e.target.value)),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Short Break</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
                value={milliSecToMin(newMode.shortBreak)}
                onChange={(e) =>
                  setNewMode({
                    ...newMode,
                    shortBreak: milliSecToMin(Number(e.target.value)),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Long Break</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
                value={milliSecToMin(newMode.longBreak)}
                onChange={(e) =>
                  setNewMode({
                    ...newMode,
                    longBreak: milliSecToMin(Number(e.target.value)),
                  })
                }
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="outline"
            className=" bg-slate-900 text-white"
          >
            Save
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

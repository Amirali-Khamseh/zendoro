import { useState } from "react";
import { format } from "date-fns";
import { CalendarRange } from "lucide-react";
import type { DateRange as RdpRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DashboardPreset, DateRange } from "@/zustand/dashboardStore";

const PRESETS: { value: Exclude<DashboardPreset, "custom">; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "month", label: "This month" },
];

interface DateRangeFilterProps {
  preset: DashboardPreset;
  range: DateRange;
  onChange: (preset: DashboardPreset, custom?: DateRange) => void;
}

export function DateRangeFilter({
  preset,
  range,
  onChange,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const customLabel =
    preset === "custom" && range.from && range.to
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`
      : "Custom";

  const handleRangeSelect = (selected: RdpRange | undefined) => {
    if (selected?.from && selected?.to) {
      onChange("custom", { from: selected.from, to: selected.to });
      setOpen(false);
    }
  };

  const pillClass = (active: boolean) =>
    cn(
      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
      active
        ? "bg-white/15 text-white"
        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={pillClass(preset === p.value)}
        >
          {p.label}
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-auto rounded-full px-3 py-1 text-xs font-medium",
              preset === "custom"
                ? "bg-white/15 text-white hover:bg-white/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
            {customLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
          <Calendar
            mode="range"
            numberOfMonths={2}
            defaultMonth={range.from ?? undefined}
            selected={
              preset === "custom" && range.from && range.to
                ? { from: range.from, to: range.to }
                : undefined
            }
            onSelect={handleRangeSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

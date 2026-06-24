import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  /** Tailwind text-color class for the icon, e.g. "text-emerald-400" */
  accent?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "text-white/60",
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs md:text-sm text-white/60 uppercase tracking-wide">
          {label}
        </span>
        <Icon className={`h-4 w-4 md:h-5 md:w-5 shrink-0 ${accent}`} />
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-semibold text-white">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
    </div>
  );
}

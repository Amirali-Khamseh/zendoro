interface GoalRingProps {
  percent: number; // 0–100
  size?: number; // px diameter
  stroke?: number; // ring thickness
  className?: string;
}

/**
 * A circular progress ring. The percent is rendered in the center; the arc
 * turns emerald once the goal is complete, otherwise sky-blue.
 */
export function GoalRing({
  percent,
  size = 72,
  stroke = 7,
  className = "",
}: GoalRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const done = clamped >= 100;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-700 ease-out ${
            done ? "text-emerald-400" : "text-sky-400"
          }`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-bold text-white"
          style={{ fontSize: size * 0.26 }}
        >
          {clamped}
          <span className="text-white/50" style={{ fontSize: size * 0.16 }}>
            %
          </span>
        </span>
      </div>
    </div>
  );
}

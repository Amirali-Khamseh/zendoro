export default function SessionCount({
  sessionCount,
}: {
  sessionCount: number;
}) {
  return (
    <div className="flex gap-4 mt-4 w-full">
      <div className="flex flex-col justify-between items-center bg-white/15 rounded-2xl p-3 flex-1">
        <div className="text-white text-xs font-semibold uppercase tracking-wide mb-1">
          Session Count
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-bold">#{sessionCount}</span>
        </div>
      </div>
    </div>
  );
}

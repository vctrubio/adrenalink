import { getHMDuration } from "@/getters/duration-getter";

interface TimeDurationBadgeProps {
  startTime: string;
  duration: number;
}

export function TimeDurationBadge({ startTime, duration }: TimeDurationBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl text-foreground">{startTime}</span>
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold text-foreground bg-muted">
        +{getHMDuration(duration)}
      </span>
    </div>
  );
}


import { getPrettyDuration } from "@/getters/duration-getter";

interface TimeDurationBadgeProps {
  startTime: string;
  duration: number;
}

export function TimeDurationBadge({ startTime, duration }: TimeDurationBadgeProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border">
      <span className="font-bold text-2xl text-foreground">{startTime}</span>
      <span className="text-sm px-2 py-1 bg-muted rounded text-foreground">
        <span className="text-muted-foreground">+</span>
        {getPrettyDuration(duration)}
      </span>
    </div>
  );
}


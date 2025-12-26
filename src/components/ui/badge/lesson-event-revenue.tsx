import FlagIcon from "@/public/appSvgs/FlagIcon";
import { Clock, TrendingUp } from "lucide-react";

interface LessonEventRevenueBadgeProps {
  lessonCount: number;
  duration: string;
  revenue: number;
}

export function LessonEventRevenueBadge({ lessonCount, duration, revenue }: LessonEventRevenueBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground bg-muted">
      <span className="inline-flex items-center gap-1">
        <FlagIcon size={12} className="scale-x-[-1]" /> {lessonCount}
      </span>
      <span className="inline-flex items-center gap-1">
        <Clock size={12} /> {duration}
      </span>
      <span className="inline-flex items-center gap-1">
        <TrendingUp size={12} className="text-success" /> {revenue}
      </span>
    </span>
  );
}

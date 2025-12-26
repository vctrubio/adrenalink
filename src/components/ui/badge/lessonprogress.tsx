import FlagIcon from "@/public/appSvgs/FlagIcon";

interface LessonProgressBadgeProps {
  planned: number;
  completed: number;
  uncompleted: number;
  background: string;
}

export function LessonProgressBadge({ planned, completed, uncompleted, background }: LessonProgressBadgeProps) {
  const total = planned + completed + uncompleted;
  const done = completed + uncompleted;

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background }} />
      <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground bg-muted">
        {done}/{total} <FlagIcon size={12} className="scale-x-[-1]" />
      </span>
    </div>
  );
}

import LessonIcon from "@/public/appSvgs/LessonIcon";
import { STATUS_GREEN, ACTION_CYAN } from "@/types/status";

interface TeacherStatusBadgeProps {
  totalLessons: number;
  plannedLessons: number;
}

export function TeacherStatusBadge({ totalLessons, plannedLessons }: TeacherStatusBadgeProps) {
  if (totalLessons === 0) {
    return (
      <div
        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          backgroundColor: `${STATUS_GREEN}40`,
          color: "#1f2937",
        }}
      >
        New
      </div>
    );
  }

  // Show all lessons with blue background if there are planned lessons, green if all completed
  const hasPlanedLessons = plannedLessons > 0;
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: hasPlanedLessons ? `${ACTION_CYAN}40` : `${STATUS_GREEN}40`,
        color: "#1f2937",
      }}
    >
      <LessonIcon size={14} />
      <span>{totalLessons}</span>
    </div>
  );
}

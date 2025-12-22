import LessonIcon from "@/public/appSvgs/LessonIcon";
import { BADGE_STATUS_GREEN, BADGE_ACTION_CYAN, BADGE_BG_OPACITY_DARK } from "@/types/status";

interface TeacherStatusBadgeProps {
  totalLessons: number;
  plannedLessons: number;
}

export function TeacherStatusBadge({ totalLessons, plannedLessons }: TeacherStatusBadgeProps) {
  if (totalLessons === 0) {
    return (
      <div
        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
        style={{
          backgroundColor: `${BADGE_STATUS_GREEN}${BADGE_BG_OPACITY_DARK}`,
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
      style={{
        backgroundColor: hasPlanedLessons ? `${BADGE_ACTION_CYAN}${BADGE_BG_OPACITY_DARK}` : `${BADGE_STATUS_GREEN}${BADGE_BG_OPACITY_DARK}`,
      }}
    >
      <LessonIcon size={14} />
      <span>{totalLessons}</span>
    </div>
  );
}

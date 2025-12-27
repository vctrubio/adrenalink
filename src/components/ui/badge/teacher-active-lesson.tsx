import FlagIcon from "@/public/appSvgs/FlagIcon";
import { BADGE_STATUS_GREEN, BADGE_ACTION_CYAN, BADGE_BG_OPACITY_DARK } from "@/types/status";

interface TeacherActiveLessonProps {
  totalLessons: number;
  completedLessons: number;
}

export function TeacherActiveLesson({ totalLessons, completedLessons }: TeacherActiveLessonProps) {
  if (totalLessons === 0) {
    return (
      <div
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-foreground"
        style={{
          backgroundColor: `${BADGE_STATUS_GREEN}${BADGE_BG_OPACITY_DARK}`,
        }}
      >
        New
      </div>
    );
  }

  // Show green if all lessons are completed, cyan if there are still lessons to go
  const isFinished = completedLessons === totalLessons;
  
  return (
    <div
      className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground"
      style={{
        backgroundColor: isFinished ? `${BADGE_STATUS_GREEN}${BADGE_BG_OPACITY_DARK}` : `${BADGE_ACTION_CYAN}${BADGE_BG_OPACITY_DARK}`,
      }}
    >
      <span>{completedLessons}/{totalLessons}</span>
      <FlagIcon size={12} className="scale-x-[-1]" />
    </div>
  );
}

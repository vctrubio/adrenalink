import { TeacherActiveLesson } from "./teacher-active-lesson";

interface LessonProgressBadgeProps {
    planned: number;
    completed: number;
    uncompleted: number;
    background: string;
}

export function LessonProgressBadge({ planned, completed, uncompleted, background }: LessonProgressBadgeProps) {
    const total = planned + completed + uncompleted;
    const done = completed + uncompleted;

    if (total === 0) return "No lessons";

    return (
        <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background }} />
            <TeacherActiveLesson totalLessons={total} completedLessons={done} />
        </div>
    );
}

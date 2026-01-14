import { getTeacherId } from "@/supabase/server/teacher-id";
import { getSchoolHeader } from "@/types/headers";
import { TeacherLessonsClient } from "./TeacherLessonsClient";

export const dynamic = "force-dynamic";

interface LessonsPageProps {
    params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonsPageProps) {
    const { id: teacherId } = await params;
    const schoolHeader = await getSchoolHeader();

    const result = await getTeacherId(teacherId);

    if (!result.success || !result.data) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
                Error: {result.error || "Teacher not found"}
            </div>
        );
    }

    const teacher = result.data;

    return (
        <TeacherLessonsClient
            teacher={teacher}
            currency={schoolHeader?.currency || "EUR"}
        />
    );
}
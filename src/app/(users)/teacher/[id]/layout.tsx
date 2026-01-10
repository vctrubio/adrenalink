import { type ReactNode } from "react";
import { getTeacherId } from "@/supabase/server/teacher-id";
import { getSchoolHeader } from "@/types/headers";
import UserWelcome from "@/src/components/UserWelcome";

interface TeacherLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string }>;
}

export default async function TeacherLayout({ children, params }: TeacherLayoutProps) {
    const { id: teacherId } = await params;

    const schoolHeader = await getSchoolHeader();
    const teacherResult = await getTeacherId(teacherId);

    if (!teacherResult.success || !teacherResult.data) {
        return <div className="p-4 text-destructive">Error loading teacher data: {teacherResult.error || "Teacher not found"}</div>;
    }

    const teacher = teacherResult.data;

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <UserWelcome firstName={teacher.schema.first_name} lastName={teacher.schema.last_name} schoolName={schoolHeader?.name} />
            {children}
        </div>
    );
}

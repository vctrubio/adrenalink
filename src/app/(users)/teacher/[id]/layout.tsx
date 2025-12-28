import { type ReactNode } from "react";
import { getTeachers } from "@/actions/teacher-action";
import { getSchoolHeader } from "@/types/headers";
import UserWelcome from "@/src/components/UserWelcome";

interface TeacherLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string }>;
}

export default async function TeacherLayout({ children, params }: TeacherLayoutProps) {
    const { id: teacherId } = await params;

    const schoolHeader = await getSchoolHeader();
    const teacherResult = await getTeachers();

    if (!teacherResult.success) {
        return <div className="p-4 text-destructive">Error loading teacher data</div>;
    }

    const teacher = teacherResult.data.find((t) => t.schema.id === teacherId);

    if (!teacher) {
        return <div className="p-4 text-destructive">Teacher not found</div>;
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <UserWelcome
                firstName={teacher.schema.firstName}
                lastName={teacher.schema.lastName}
                schoolName={schoolHeader?.name}
            />
            {children}
        </div>
    );
}

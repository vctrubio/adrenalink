import { type ReactNode } from "react";
import { getStudentId } from "@/supabase/server/student-id";
import { getSchoolHeader } from "@/types/headers";
import UserWelcome from "@/src/components/UserWelcome";

interface StudentLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string }>;
}

export default async function StudentLayout({ children, params }: StudentLayoutProps) {
    const { id: studentId } = await params;

    const schoolHeader = await getSchoolHeader();
    const studentResult = await getStudentId(studentId);

    if (!studentResult.success || !studentResult.data) {
        return <div className="p-4 text-destructive">Error loading student data: {studentResult.error || "Student not found"}</div>;
    }

    const student = studentResult.data;

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <UserWelcome firstName={student.schema.first_name} lastName={student.schema.last_name} schoolName={schoolHeader?.name} />
            {children}
        </div>
    );
}

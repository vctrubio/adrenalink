import { type ReactNode } from "react";
import { getStudents } from "@/actions/student-action";
import { getSchoolHeader } from "@/types/headers";
import UserWelcome from "@/src/components/UserWelcome";

interface StudentLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string }>;
}

export default async function StudentLayout({ children, params }: StudentLayoutProps) {
    const { id: studentId } = await params;

    const schoolHeader = await getSchoolHeader();
    const studentResult = await getStudents();

    if (!studentResult.success) {
        return <div className="p-4 text-destructive">Error loading student data</div>;
    }

    const student = studentResult.data.find((s) => s.schema.id === studentId);

    if (!student) {
        return <div className="p-4 text-destructive">Student not found</div>;
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <UserWelcome
                firstName={student.schema.firstName}
                lastName={student.schema.lastName}
                schoolName={schoolHeader?.name}
            />
            {children}
        </div>
    );
}

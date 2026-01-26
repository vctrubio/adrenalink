import { type ReactNode } from "react";
import { getStudentUser } from "@/supabase/server/student-user";
import { getUserSchoolContext } from "@/src/providers/user-school-provider";
import UserWelcome from "@/src/components/UserWelcome";
import { StudentUserProvider } from "@/src/providers/student-user-provider";
import { StudentNavigation } from "./StudentNavigation";

interface StudentLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string }>;
}

export default async function StudentLayout({ children, params }: StudentLayoutProps) {
    const { id: studentId } = await params;

    const { schoolHeader } = await getUserSchoolContext();
    const studentUserResult = await getStudentUser(studentId);

    if (!studentUserResult.success || !studentUserResult.data) {
        return <div className="p-4 text-destructive">Error loading student data: {studentUserResult.error || "Student not found"}</div>;
    }

    const studentUser = studentUserResult.data;

    return (
        <StudentUserProvider
            data={studentUser}
            schoolHeader={schoolHeader}
        >
            <div className="space-y-6 max-w-2xl mx-auto p-4">
                <UserWelcome firstName={studentUser.student.first_name} lastName={studentUser.student.last_name} schoolName={schoolHeader?.schoolName} />
                <StudentNavigation studentId={studentId} />
                {children}
            </div>
        </StudentUserProvider>
    );
}

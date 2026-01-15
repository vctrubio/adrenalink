import { type ReactNode } from "react";
import { getTeacherUser } from "@/supabase/server/teacher-user";
import { getSchoolHeader } from "@/types/headers";
import UserWelcome from "@/src/components/UserWelcome";
import { TeacherNavigation } from "./TeacherNavigation";
import { TeacherUserProvider } from "@/src/providers/teacher-user-provider";

interface TeacherLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string }>;
}

export default async function TeacherLayout({ children, params }: TeacherLayoutProps) {
    const { id: teacherId } = await params;

    const schoolHeader = await getSchoolHeader();
    const teacherUserResult = await getTeacherUser(teacherId);

    if (!teacherUserResult.success || !teacherUserResult.data) {
        return <div className="p-4 text-destructive">Error loading teacher data: {teacherUserResult.error || "Teacher not found"}</div>;
    }

    const teacherUser = teacherUserResult.data;

    return (
        <TeacherUserProvider
            data={teacherUser}
            schoolId={schoolHeader?.id || ""}
            currency={schoolHeader?.currency || "YEN"}
            timezone={schoolHeader?.timezone}
        >
            <div className="space-y-6 max-w-2xl mx-auto p-4">
                <UserWelcome firstName={teacherUser.teacher.first_name} lastName={teacherUser.teacher.last_name} schoolName={schoolHeader?.name} />
                <TeacherNavigation teacherId={teacherId} />
                {children}
            </div>
        </TeacherUserProvider>
    );
}

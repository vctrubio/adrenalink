import { type ReactNode } from "react";
import { getTeacherUser } from "@/supabase/server/teacher-user";
import { getUserSchoolContext } from "@/src/providers/user-school-provider";
import UserWelcome from "@/src/components/UserWelcome";
import { TeacherNavigation } from "./TeacherNavigation";
import { TeacherUserProvider } from "@/src/providers/teacher-user-provider";

interface TeacherLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string }>;
}

export default async function TeacherLayout({ children, params }: TeacherLayoutProps) {
    const { id: teacherId } = await params;

    const { schoolHeader } = await getUserSchoolContext();
    const teacherUserResult = await getTeacherUser(teacherId);

    if (!teacherUserResult.success || !teacherUserResult.data) {
        return <div className="p-4 text-destructive">Error loading teacher data: {teacherUserResult.error || "Teacher not found"}</div>;
    }

    const teacherUser = teacherUserResult.data;

    return (
        <TeacherUserProvider
            data={teacherUser}
            schoolHeader={schoolHeader}
        >
            <div className="space-y-6 max-w-2xl mx-auto p-4">
                <UserWelcome firstName={teacherUser.teacher.first_name} lastName={teacherUser.teacher.last_name} schoolName={schoolHeader?.schoolName} />
                <TeacherNavigation teacherId={teacherId} />
                {children}
            </div>
        </TeacherUserProvider>
    );
}

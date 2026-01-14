import { getTeacherId } from "@/supabase/server/teacher-id";
import { getSchoolHeader } from "@/types/headers";
import { TeacherCommissionsClient } from "./TeacherCommissionsClient";

export const dynamic = "force-dynamic";

interface CommissionsPageProps {
    params: Promise<{ id: string }>;
}

export default async function CommissionPage({ params }: CommissionsPageProps) {
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
        <TeacherCommissionsClient
            teacher={teacher}
            currency={schoolHeader?.currency || "EUR"}
        />
    );
}
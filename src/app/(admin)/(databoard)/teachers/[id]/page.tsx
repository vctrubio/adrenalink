import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { TeacherModel } from "@/backend/models";
import { TeacherIdStats } from "@/src/components/databoard/stats/TeacherIdStats";
import { TeacherDetailWrapper } from "./TeacherDetailWrapper";

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return <div>School context not found</div>;
    }

    const result = await getEntityId("teacher", id);

    if (!result.success) {
        return <div>Teacher not found</div>;
    }

    const teacher = result.data as TeacherModel;

    // Verify teacher belongs to the school
    if (teacher.updateForm.schoolId !== schoolHeader.id) {
        return <div>You do not have permission to view this teacher</div>;
    }

    const stats = TeacherIdStats.getStats(teacher);

    return <TeacherDetailWrapper teacher={teacher} stats={stats} />;
}

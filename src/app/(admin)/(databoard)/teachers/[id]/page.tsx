import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { TeacherModel } from "@/backend/models";
import { TeacherDataboard } from "@/getters/databoard-getter";
import { createStat } from "@/src/components/databoard/stats/stat-factory";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { TeacherLeftColumn } from "./TeacherLeftColumn";
import { TeacherRightColumn } from "./TeacherRightColumn";

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

    const stats = [
        createStat("teacher", `${teacher.schema.firstName} ${teacher.schema.lastName}`, teacher.schema.firstName),
        createStat("lessons", TeacherDataboard.getLessonCount(teacher), "Lessons"),
        createStat("events", TeacherDataboard.getEventCount(teacher), "Events"),
        createStat("duration", TeacherDataboard.getDurationMinutes(teacher), "Duration"),
        createStat("commission", TeacherDataboard.getCommission(teacher), "Commission"),
        createStat("revenue", TeacherDataboard.getSchoolRevenue(teacher), "School Revenue"),
    ].filter(Boolean) as any[];

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<TeacherLeftColumn teacher={teacher} />}
            rightColumn={<TeacherRightColumn teacher={teacher} />}
        />
    );
}

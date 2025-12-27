import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { TeacherModel } from "@/backend/models";
import { TeacherDataboard } from "@/getters/databoard-getter";
import { createStat } from "@/src/components/databoard/stats/stat-factory";
import { EntityStatsWrapper } from "@/src/components/databoard/EntityStatsWrapper";
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
        createStat("teacher", teacher.schema.username, teacher.schema.username),
        createStat("lessons", TeacherDataboard.getLessonCount(teacher), "Lessons"),
        createStat("events", TeacherDataboard.getEventCount(teacher), "Events"),
        createStat("duration", TeacherDataboard.getDurationMinutes(teacher), "Duration"),
        createStat("commission", TeacherDataboard.getCommission(teacher), "Commission"),
        createStat("revenue", TeacherDataboard.getSchoolRevenue(teacher), "School Revenue"),
    ].filter(Boolean) as any[];

    return (
        <EntityStatsWrapper stats={stats}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">
                <div className="lg:col-span-4">
                    <div className="sticky top-8">
                        <TeacherLeftColumn teacher={teacher} />
                    </div>
                </div>
                <div className="lg:col-span-8">
                    <TeacherRightColumn teacher={teacher} />
                </div>
            </div>
        </EntityStatsWrapper>
    );
}

import { getEntityId } from "@/actions/id-actions";
import type { StudentModel } from "@/backend/models";
import { StudentDataboard } from "@/getters/databoard-getter";
import { createStat } from "@/src/components/databoard/stats/stat-factory";
import { EntityStatsWrapper } from "@/src/components/databoard/EntityStatsWrapper";
import { StudentLeftColumn } from "./StudentLeftColumn";
import { StudentRightColumn } from "./StudentRightColumn";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEntityId("student", id);

    if (!result.success) {
        return <div>Student not found</div>;
    }

    const student = result.data as StudentModel;

    // Use stat-factory as single source of truth for presentation
    const stats = [
        createStat("student", `${student.schema.firstName} ${student.schema.lastName}`, student.schema.firstName),
        createStat("bookings", StudentDataboard.getBookingCount(student), "Bookings"),
        createStat("events", StudentDataboard.getEventCount(student), "Events"),
        createStat("duration", StudentDataboard.getDurationMinutes(student), "Duration"),
        createStat("schoolNet", StudentDataboard.getSchoolNet(student), "Net"),
    ].filter(Boolean) as any[];

    return (
        <EntityStatsWrapper stats={stats}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">
                <div className="lg:col-span-4">
                    <div className="sticky top-8">
                        <StudentLeftColumn student={student} />
                    </div>
                </div>
                <div className="lg:col-span-8">
                    <StudentRightColumn student={student} />
                </div>
            </div>
        </EntityStatsWrapper>
    );
}

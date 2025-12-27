import { getEntityId } from "@/actions/id-actions";
import type { StudentModel } from "@/backend/models";
import { StudentDataboard } from "@/getters/databoard-getter";
import { createStat } from "@/src/components/databoard/stats/stat-factory";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
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
        <EntityIdLayout
            stats={stats}
            leftColumn={<StudentLeftColumn student={student} />}
            rightColumn={<StudentRightColumn student={student} />}
        />
    );
}

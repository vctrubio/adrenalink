import { getStudentId } from "@/supabase/server/student-id";
import { StudentData } from "@/backend/data/StudentData";
import { StudentTableGetters } from "@/getters/table-getters";
import { createStat } from "@/src/components/databoard/stats/stat-factory";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { StudentLeftColumn } from "./StudentLeftColumn";
import { StudentRightColumn } from "./StudentRightColumn";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getStudentId(id);

    if (!result.success || !result.data) {
        return <div>Student not found</div>;
    }

    const student: StudentData = result.data;

    // Use stat-factory as single source of truth for presentation
    const stats = [
        createStat("student", `${student.schema.first_name} ${student.schema.last_name}`, student.schema.first_name),
        createStat("bookings", StudentTableGetters.getBookingCount(student), "Bookings"),
        createStat("events", StudentTableGetters.getEventCount(student), "Events"),
        createStat("duration", StudentTableGetters.getTotalDurationMinutes(student), "Duration"),
        createStat("revenue", StudentTableGetters.getTotalPaid(student), "Revenue"),
        createStat("profit", StudentTableGetters.getProfit(student), "Profit"),
    ].filter(Boolean) as any[];

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<StudentLeftColumn student={student} />}
            rightColumn={<StudentRightColumn student={student} />}
        />
    );
}

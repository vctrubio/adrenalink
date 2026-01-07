import { getStudentId } from "@/supabase/server/student-id";
import { StudentData } from "@/backend/data/StudentData";
import { StudentTableGetters } from "@/getters/table-getters";
import { getStat } from "@/backend/RenderStats";
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

    const stats = [
        getStat("student", `${student.schema.first_name} ${student.schema.last_name}`, student.schema.first_name),
        getStat("bookings", StudentTableGetters.getBookingCount(student)),
        getStat("events", StudentTableGetters.getEventCount(student)),
        getStat("duration", StudentTableGetters.getTotalDurationMinutes(student)),
        getStat("studentPayments", StudentTableGetters.getTotalPaid(student)),
        getStat("profit", StudentTableGetters.getProfit(student)),
    ].filter(Boolean) as any[];

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<StudentLeftColumn student={student} />}
            rightColumn={<StudentRightColumn student={student} />}
        />
    );
}

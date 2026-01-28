import { getStudentId } from "@/supabase/server/student-id";
import { StudentData } from "@/backend/data/StudentData";
import { StudentTableGetters } from "@/getters/table-getters";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { StudentLeftColumn } from "./StudentLeftColumn";
import { StudentRightColumn } from "./StudentRightColumn";

import { TableLayout } from "../../TableLayout";
import type { TableStat } from "../../TablesHeaderStats";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getStudentId(id);

    if (!result.success || !result.data) {
        return <div>Student not found</div>;
    }

    const student: StudentData = result.data;

    const stats: TableStat[] = [
        {
            type: "student",
            value: `${student.schema.first_name} ${student.schema.last_name}`,
            desc: "Student Profile",
        },
        {
            type: "events",
            value: StudentTableGetters.getEventCount(student),
            label: "Events",
            desc: "Total events attended",
        },
        {
            type: "duration",
            value: StudentTableGetters.getTotalDurationMinutes(student),
            desc: "Total time spent in lessons",
        },
        {
            type: "studentPayments",
            value: StudentTableGetters.getTotalPaid(student),
            label: "Payments",
            desc: "Total payments made",
        },
    ];

    return (
        <TableLayout stats={stats} showSearch={false}>
            <EntityIdLayout
                stats={stats}
                leftColumn={<StudentLeftColumn student={student} />}
                rightColumn={<StudentRightColumn student={student} />}
            />
        </TableLayout>
    );
}

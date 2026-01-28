import { getTeachersTable } from "@/supabase/server/teachers";
import { TeachersTable } from "./TeachersTable";
import { TableLayout } from "../TableLayout";
import type { TableStat } from "../TablesHeaderStats";
import { getAggregateTeachers } from "@/backend/data/TeacherStats";

export const dynamic = "force-dynamic";

export default async function TeachersMasterTablePage() {
    const teachers = await getTeachersTable();
    const stats_data = getAggregateTeachers(teachers);

    console.log("Teachers stats data:", stats_data);
    const stats: TableStat[] = [
        { type: "teachers", value: stats_data.teacherCount, desc: "Total registered teachers" },
        { type: "lessons", value: stats_data.totalLessons, desc: "Total lessons assigned" },
        { type: "duration", value: stats_data.totalDurationMinutes, desc: "Total instruction hours" },
        { type: "commission", value: stats_data.totalCommissions, desc: "Total earned commissions" },
        // { type: "teacherPayments", value: stats_data.totalPayments, label: "Paid", desc: "Total payments processed" }
    ];

    return (
        <TableLayout stats={stats}>
            <TeachersTable teachers={teachers} />
        </TableLayout>
    );
}

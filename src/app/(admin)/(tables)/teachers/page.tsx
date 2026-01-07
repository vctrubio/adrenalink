import { getTeachersTable } from "@/supabase/server/teachers";
import { TeachersTable } from "./TeachersTable";
import { TablesPageClient } from "../TablesPageClient";
import type { TableStat } from "../TablesHeaderStats";
import { getAggregateTeachers } from "@/backend/data/TeacherStats";

export default async function TeachersMasterTablePage() {
    const teachers = await getTeachersTable();
    const stats_data = getAggregateTeachers(teachers);

    const stats: TableStat[] = [
        { type: "teachers", value: stats_data.teacherCount, desc: "Total registered teachers" },
        { type: "lessons", value: stats_data.totalLessons, desc: "Total lessons assigned" },
        { type: "duration", value: stats_data.totalDurationMinutes, desc: "Total instruction hours" },
        { type: "commission", value: stats_data.totalCommissions.toFixed(0), desc: "Total earned commissions" },
        // { type: "teacherPayments", value: stats_data.totalPayments.toFixed(0), label: "Paid", desc: "Total payments processed" }
    ];

    return (
        <TablesPageClient title="Teachers Master Table" description="Manage instructors, track lessons, earnings and assigned gear." stats={stats}>
            <TeachersTable teachers={teachers} />
        </TablesPageClient>
    );
}

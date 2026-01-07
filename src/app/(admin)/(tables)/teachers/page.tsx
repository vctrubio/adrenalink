import { getTeachersTable } from "@/supabase/server/teachers";
import { TeachersTable } from "./TeachersTable";
import { TablesPageClient } from "@/src/components/tables/TablesPageClient";
import type { TableStat } from "@/src/components/tables/TablesHeaderStats";

export default async function TeachersMasterTablePage() {
    const teachers = await getTeachersTable();

    // Calculate stats
    const totalTeachers = teachers.length;
    let totalLessons = 0;
    let totalDurationMinutes = 0;
    let totalCommissions = 0;
    let totalPayments = 0;

    teachers.forEach(t => {
        // Aggregate lessons and duration from activityStats record
        Object.values(t.activityStats).forEach(s => {
            totalLessons += s.count;
            totalDurationMinutes += s.durationMinutes;
        });
        
        totalCommissions += t.financialStats.totalCommissions;
        totalPayments += t.financialStats.totalPayments;
    });

    const stats: TableStat[] = [
        { type: "teacher", value: totalTeachers, label: "Teachers" },
        { type: "lessons", value: totalLessons },
        { type: "duration", value: (totalDurationMinutes / 60).toFixed(1) + "h" },
        { type: "commission", value: totalCommissions.toFixed(0) },
        { type: "teacherPayments", value: totalPayments.toFixed(0), label: "Paid" }
    ];

    return (
        <TablesPageClient
            title="Teachers Master Table"
            description="Manage instructors, track lessons, earnings and assigned gear."
            stats={stats}
        >
            <TeachersTable teachers={teachers} />
        </TablesPageClient>
    );
}
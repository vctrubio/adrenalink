import { getStudentsTable } from "@/supabase/server/students";
import { StudentsTable } from "./StudentsTable";
import { TableLayout } from "../TableLayout";
import type { TableStat } from "../TablesHeaderStats";
import { getAggregateStudents } from "@/backend/data/StudentStats";

export default async function StudentsMasterTablePage() {
    const students = await getStudentsTable();
    const stats_data = getAggregateStudents(students);

    const stats: TableStat[] = [
        { type: "students", value: stats_data.studentCount, desc: "Total registered students" },
        { type: "events", value: stats_data.totalEvents, label: "Events", desc: "Total events attended" },
        { type: "duration", value: stats_data.totalDurationMinutes, desc: "Total time spent in lessons" },
        { type: "studentPayments", value: stats_data.totalPayments.toFixed(0), label: "Payments", desc: "Total payments from bookings" }
    ];

    return (
        <TableLayout stats={stats}>
            <StudentsTable students={students} />
        </TableLayout>
    );
}
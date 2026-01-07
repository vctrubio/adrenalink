import { getStudentsTable } from "@/supabase/server/students";
import { StudentsTable } from "./StudentsTable";
import { TablesPageClient } from "@/src/components/tables/TablesPageClient";
import type { TableStat } from "@/src/components/tables/TablesHeaderStats";

export default async function StudentsMasterTablePage() {
    const students = await getStudentsTable();

    // Calculate stats
    const totalStudents = students.length;
    let totalBookings = 0;
    let totalPaid = 0;
    let totalExpected = 0;

    students.forEach(s => {
        totalBookings += s.bookings.length;
        s.bookings.forEach(b => {
            totalPaid += b.totalPayments;
            totalExpected += b.expectedRevenue;
        });
    });

    const net = totalPaid - totalExpected;

    const stats: TableStat[] = [
        { type: "student", value: totalStudents, label: "Students" },
        { type: "bookings", value: totalBookings },
        { type: "studentPayments", value: totalPaid.toFixed(0), label: "Total Paid" }, 
        { type: "profit", value: net.toFixed(0), label: "Net Balance", variant: "profit" }
    ];

    return (
        <TablesPageClient 
            title="Students Master Table" 
            description="Manage students, view their bookings, and track payment status."
            stats={stats}
        >
            <StudentsTable students={students} />
        </TablesPageClient>
    );
}
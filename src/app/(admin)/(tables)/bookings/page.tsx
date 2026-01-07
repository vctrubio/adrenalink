import { getBookingsTable } from "@/supabase/server/bookings";
import { BookingsTable } from "./BookingsTable";
import { TablesPageClient } from "@/src/components/tables/TablesPageClient";
import type { TableStat } from "@/src/components/tables/TablesHeaderStats";

export default async function BookingsMasterTablePage() {
    const bookings = await getBookingsTable();

    // Calculate stats
    const totalBookings = bookings.length;
    let totalCapacity = 0;
    let totalEventRevenue = 0;
    let totalStudentPayments = 0;
    let totalTeacherCost = 0;

    bookings.forEach(b => {
        totalCapacity += b.capacityStudents;
        totalEventRevenue += b.totalEventRevenue;
        totalStudentPayments += b.totalStudentPayments;
        // Teacher cost is payment if exists, else commission (liability)
        totalTeacherCost += (b.totalTeacherPayments || b.totalTeacherCommissions);
    });

    const profit = totalStudentPayments - totalTeacherCost;

    const stats: TableStat[] = [
        { type: "bookings", value: totalBookings },
        { type: "student", value: totalCapacity, label: "Capacity" },
        { type: "revenue", value: totalEventRevenue.toFixed(0), label: "Event Rev" },
        { type: "studentPayments", value: totalStudentPayments.toFixed(0), label: "Payments" },
        { type: "profit", value: profit.toFixed(0), label: "Profit", variant: "profit" }
    ];

    return (
        <TablesPageClient
            title="Bookings Master Table"
            description="Comprehensive view of all school bookings and their status."
            stats={stats}
        >
            <BookingsTable bookings={bookings} />
        </TablesPageClient>
    );
}
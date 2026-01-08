import { getBookingsTable } from "@/supabase/server/bookings";
import { BookingsTable } from "./BookingsTable";
import { TableLayout } from "../TableLayout";
import type { TableStat } from "../TablesHeaderStats";
import { getAggregateBookings } from "@/backend/data/BookingStats";

export default async function BookingsMasterTablePage() {
    const bookings = await getBookingsTable();
    const stats_data = getAggregateBookings(bookings);

    const stats: TableStat[] = [
        { type: "bookings", value: stats_data.totalBookings, desc: "Total amount of bookings" },
        { 
            type: "students", 
            value: bookings.reduce((sum, b) => sum + b.package.capacityStudents, 0), 
            label: "Students", 
            desc: "Total amount of students" 
        },
        { type: "events", value: stats_data.events.count, label: "Events", desc: "Total amount of events" },
        { 
            type: stats_data.balance >= 0 ? "profit" : "loss", 
            value: Math.abs(stats_data.balance), 
            label: stats_data.balance >= 0 ? "Profit" : "Deficit",
            desc: stats_data.balance >= 0 ? "Operating profit" : "Operating deficit"
        },
    ];

    return (
        <TableLayout stats={stats}>
            <BookingsTable bookings={bookings} />
        </TableLayout>
    );
}
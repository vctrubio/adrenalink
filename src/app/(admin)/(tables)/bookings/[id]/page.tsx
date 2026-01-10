import { getBookingId } from "@/supabase/server/booking-id";
import { BookingData } from "@/backend/data/BookingData";
import { BookingTableGetters } from "@/getters/table-getters";
import { getStat } from "@/backend/RenderStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { BookingLeftColumn } from "./BookingLeftColumn";
import { BookingRightColumn } from "./BookingRightColumn";

import { TableLayout } from "../../TableLayout";
import type { TableStat } from "../../TablesHeaderStats";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getBookingId(id);

    if (!result.success || !result.data) {
        return <div>Booking not found</div>;
    }

    const booking: BookingData = result.data;
    const balance = BookingTableGetters.getBalance(booking);

    const stats: TableStat[] = [
        {
            type: "bookings",
            value: booking.schema.leader_student_name,
            desc: "Booking Leader",
        },
        {
            type: "students",
            value: booking.relations.students.length,
            label: "Students",
            desc: "Students in group",
        },
        {
            type: "events",
            value: booking.relations.lessons.reduce((sum, l) => sum + (l.events?.length || 0), 0),
            label: "Events",
            desc: "Total lesson events",
        },
        {
            type: balance >= 0 ? "profit" : "loss",
            value: Math.abs(balance),
            label: balance >= 0 ? "Profit" : "Deficit",
            desc: balance >= 0 ? "Operating profit" : "Operating deficit",
        },
    ];

    return (
        <TableLayout stats={stats} showSearch={false}>
            <EntityIdLayout
                stats={stats}
                leftColumn={<BookingLeftColumn booking={booking} />}
                rightColumn={<BookingRightColumn booking={booking} />}
            />
        </TableLayout>
    );
}

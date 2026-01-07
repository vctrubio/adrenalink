import { getBookingId } from "@/supabase/server/booking-id";
import { BookingData } from "@/backend/data/BookingData";
import { BookingTableGetters } from "@/getters/table-getters";
import { getStat } from "@/backend/RenderStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { BookingLeftColumn } from "./BookingLeftColumn";
import { BookingRightColumn } from "./BookingRightColumn";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getBookingId(id);

    if (!result.success || !result.data) {
        return <div>Booking not found</div>;
    }

    const booking: BookingData = result.data;

    const stats = [
        getStat("booking", booking.schema.leader_student_name),
        getStat("lessons", booking.relations.lessons.length),
        getStat("duration", BookingTableGetters.getUsedMinutes(booking)),
        getStat("receipt", BookingTableGetters.getRevenue(booking)),
        getStat("moneyToPay", BookingTableGetters.getDueAmount(booking)),
    ].filter(Boolean) as any[];

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<BookingLeftColumn booking={booking} />}
            rightColumn={<BookingRightColumn booking={booking} />}
        />
    );
}

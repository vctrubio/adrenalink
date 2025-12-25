import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { BookingModel } from "@/backend/models";
import { EntityHeaderRow } from "@/src/components/databoard/EntityHeaderRow";
import { BookingIdStats } from "@/src/components/databoard/stats/BookingIdStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { BookingLeftColumn } from "./BookingLeftColumn";
import { BookingRightColumn } from "./BookingRightColumn";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return <EntityIdLayout header={<EntityHeaderRow entityId="booking" entityName={`Booking ${id}`} stats={[]} />} leftColumn={<div>School context not found</div>} rightColumn={null} />;
    }

    const result = await getEntityId("booking", id);

    if (!result.success) {
        return <EntityIdLayout header={<EntityHeaderRow entityId="booking" entityName={`Booking ${id}`} stats={[]} />} leftColumn={<div>Booking not found</div>} rightColumn={null} />;
    }

    const booking = result.data as BookingModel;

    // Verify booking belongs to the school
    if (booking.schema.schoolId !== schoolHeader.id) {
        return <EntityIdLayout header={<EntityHeaderRow entityId="booking" entityName={`Booking ${id}`} stats={[]} />} leftColumn={<div>You do not have permission to view this booking</div>} rightColumn={null} />;
    }

    const bookingStats = BookingIdStats.getStats(booking);

    return <EntityIdLayout header={<EntityHeaderRow entityId="booking" entityName={<DateRangeBadge startDate={booking.schema.dateStart} endDate={booking.schema.dateEnd} />} stats={bookingStats} shouldAnimate={false} />} leftColumn={<BookingLeftColumn booking={booking} />} rightColumn={<BookingRightColumn booking={booking} />} />;
}

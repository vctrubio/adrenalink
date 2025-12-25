import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { BookingModel } from "@/backend/models";
import { EntityHeaderRow } from "@/src/components/databoard/EntityHeaderRow";
import { BookingIdStats } from "@/src/components/databoard/stats/BookingIdStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { BookingProgressBadge } from "@/src/components/ui/badge/bookingprogress";
import { getBookingProgressBar } from "@/getters/booking-progress-getter";
import { BookingV2LeftColumn } from "./BookingV2LeftColumn";
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

    const lessons = booking.relations?.lessons || [];
    const studentPackage = booking.relations?.studentPackage;
    const totalMinutes = studentPackage?.schoolPackage?.durationMinutes || 0;
    const progressBar = getBookingProgressBar(lessons, totalMinutes);

    const allEvents = lessons.flatMap((lesson) => lesson.events || []);
    const usedMinutes = allEvents.reduce((sum, event) => sum + (event.duration || 0), 0);

    return (
        <EntityIdLayout
            header={
                <EntityHeaderRow
                    entityId="booking"
                    entityName={<DateRangeBadge startDate={booking.schema.dateStart} endDate={booking.schema.dateEnd} />}
                    stats={bookingStats}
                    shouldAnimate={false}
                    secondaryContent={<BookingProgressBadge usedMinutes={usedMinutes} totalMinutes={totalMinutes} background={progressBar.background} />}
                />
            }
            leftColumn={<BookingV2LeftColumn booking={booking} />}
            rightColumn={<BookingRightColumn booking={booking} />}
        />
    );
}

import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { BookingModel } from "@/backend/models";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { BookingIdStats } from "@/src/components/databoard/stats/BookingIdStats";
import { getBookingProgressBar } from "@/getters/booking-progress-getter";
import { BookingLeftColumn } from "./BookingLeftColumn";
import { BookingRightColumn } from "./BookingRightColumn";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return <EntityIdLayout header={null} leftColumn={<div>School context not found</div>} rightColumn={null} />;
    }

    const result = await getEntityId("booking", id);

    if (!result.success) {
        return <EntityIdLayout header={null} leftColumn={<div>Booking not found</div>} rightColumn={null} />;
    }

    const booking = result.data as BookingModel;

    // Verify booking belongs to the school
    if (booking.schema.schoolId !== schoolHeader.id) {
        return <EntityIdLayout header={null} leftColumn={<div>You do not have permission to view this booking</div>} rightColumn={null} />;
    }

    const allBookingStats = BookingIdStats.getStats(booking);
    const bookingStats = allBookingStats.filter((stat) => stat.label !== "Due");

    const lessons = booking.relations?.lessons || [];
    const studentPackage = booking.relations?.studentPackage;
    const totalMinutes = studentPackage?.schoolPackage?.durationMinutes || 0;
    const progressBar = getBookingProgressBar(lessons, totalMinutes);

    const allEvents = lessons.flatMap((lesson) => lesson.events || []);
    const usedMinutes = allEvents.reduce((sum, event) => sum + (event.duration || 0), 0);

    return (
        <EntityIdLayout
            header={null}
            leftColumn={<BookingLeftColumn booking={booking} usedMinutes={usedMinutes} totalMinutes={totalMinutes} progressBar={progressBar} />}
            rightColumn={<BookingRightColumn booking={booking} stats={bookingStats} />}
        />
    );
}

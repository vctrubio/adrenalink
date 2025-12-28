import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { BookingModel } from "@/backend/models";
import { BookingStats as BookingStatsGetter } from "@/getters/bookings-getter";
import { createStat } from "@/src/components/databoard/stats/stat-factory";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { getBookingProgressBar } from "@/getters/booking-progress-getter";
import { BookingLeftColumn } from "./BookingLeftColumn";
import { BookingRightColumn } from "./BookingRightColumn";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return <div>School context not found</div>;
    }

    const result = await getEntityId("booking", id);

    if (!result.success) {
        return <div>Booking not found</div>;
    }

    const booking = result.data as BookingModel;

    // Verify booking belongs to the school
    if (booking.schema.schoolId !== schoolHeader.id) {
        return <div>You do not have permission to view this booking</div>;
    }

    // Use stat-factory as single source of truth for presentation
    const eventsCount = BookingStatsGetter.getEventsCount(booking);
    const durationMinutes = booking.stats?.total_duration_minutes || 0;
    const studentPayments = BookingStatsGetter.getStudentPayments(booking);
    const commissions = BookingStatsGetter.getTeacherCommissions(booking);
    const revenue = BookingStatsGetter.getMoneyIn(booking);
    const net = revenue - commissions;

    const bookingStats = [
        eventsCount > 0 && createStat("events", eventsCount, "Events"),
        durationMinutes > 0 && createStat("duration", durationMinutes, "Duration"),
        studentPayments > 0 && createStat("moneyPaid", studentPayments, "Student Payments"),
        commissions > 0 && createStat("commission", commissions, "Commissions"),
        revenue > 0 && createStat("revenue", revenue, "Revenue"),
        net !== 0 && createStat("schoolNet", net, "Net"),
    ].filter(Boolean) as any[];

    const lessons = booking.relations?.lessons || [];
    const studentPackage = booking.relations?.studentPackage;
    const totalMinutes = studentPackage?.schoolPackage?.durationMinutes || 0;
    const progressBar = getBookingProgressBar(lessons, totalMinutes);

    const allEvents = lessons.flatMap((lesson) => lesson.events || []);
    const usedMinutes = allEvents.reduce((sum, event) => sum + (event.duration || 0), 0);

    return (
        <EntityIdLayout
            stats={bookingStats}
            leftColumn={<BookingLeftColumn booking={booking} usedMinutes={usedMinutes} totalMinutes={totalMinutes} progressBar={progressBar} />}
            rightColumn={<BookingRightColumn booking={booking} stats={bookingStats} />}
        />
    );
}

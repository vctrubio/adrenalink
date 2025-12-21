import type { StudentModel } from "@/backend/models";
import type { StatItem } from "@/src/components/ui/row";
import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export const StudentIdStats = {
    getStats: (student: StudentModel): StatItem[] => {
        const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
        const bookingStudents = student.relations?.bookingStudents || [];

        const totals = bookingStudents.reduce(
            (acc, bs) => {
                const booking = bs.booking;
                if (!booking) return acc;

                const lessons = booking.lessons || [];
                const events = lessons.flatMap((lesson) => lesson.events || []);
                const durationMinutes = events.reduce((sum, event) => sum + (event.duration || 0), 0);

                const bookingPayments = student.relations?.bookingPayments?.filter((bp) => bp.bookingId === booking.id) || [];
                const moneyPaid = bookingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                const moneyToPay = booking.studentPackage?.schoolPackage?.pricePerStudent || 0;

                return {
                    bookings: acc.bookings + 1,
                    events: acc.events + events.length,
                    durationMinutes: acc.durationMinutes + durationMinutes,
                    moneyToPay: acc.moneyToPay + moneyToPay,
                    moneyPaid: acc.moneyPaid + moneyPaid,
                };
            },
            { bookings: 0, events: 0, durationMinutes: 0, moneyToPay: 0, moneyPaid: 0 },
        );

        return [
            {
                label: "Bookings",
                icon: <BookingIcon />,
                value: totals.bookings,
                color: bookingEntity.color,
            },
            {
                label: "Total Events",
                icon: <FlagIcon />,
                value: totals.events,
                color: eventEntity.color,
            },
            {
                label: "Total Hours",
                icon: <DurationIcon />,
                value: getPrettyDuration(totals.durationMinutes),
                color: "#4b5563",
            },
            {
                label: "Total To Pay",
                icon: <BankIcon />,
                value: `$${totals.moneyToPay}`,
                color: "#4b5563",
            },
            {
                label: "Total Paid",
                icon: <BankIcon />,
                value: `$${totals.moneyPaid}`,
                color: "#4b5563",
            },
        ];
    }
}

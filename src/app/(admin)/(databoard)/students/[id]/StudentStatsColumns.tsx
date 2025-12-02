"use client";

import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { StudentModel } from "@/backend/models";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export function StudentStatsColumns({ student }: { student: StudentModel }) {
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

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Student Statistics</h2>
            <div className="flex justify-around gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BookingIcon className="w-4 h-4" style={{ color: bookingEntity.color }} />
                        <p className="text-sm text-muted-foreground">Bookings</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{totals.bookings}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FlagIcon className="w-4 h-4" style={{ color: eventEntity.color }} />
                        <p className="text-sm text-muted-foreground">Total Events</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{totals.events}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <DurationIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{getPrettyDuration(totals.durationMinutes)}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Total To Pay</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">${totals.moneyToPay}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">${totals.moneyPaid}</p>
                </div>
            </div>
        </div>
    );
}

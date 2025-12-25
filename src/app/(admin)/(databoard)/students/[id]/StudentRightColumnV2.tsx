"use client";

import { motion } from "framer-motion";
import type { StudentModel } from "@/backend/models";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { FullBookingCard } from "@/src/components/ids";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";

interface Totals {
    bookings: number;
    events: number;
    hours: number;
}

// Sub-component: Summary Header
function SummaryHeader({ totals }: { totals: Totals }) {
    return (
        <div className="flex items-center gap-6 px-4 py-3 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{totals.bookings}</span>
                <span className="text-muted-foreground">bookings</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <FlagIcon size={16} className="text-muted-foreground" />
                <span className="font-semibold">{totals.events}</span>
                <span className="text-muted-foreground">events</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <DurationIcon size={16} className="text-muted-foreground" />
                <span className="font-semibold">{totals.hours.toFixed(1)}h</span>
                <span className="text-muted-foreground">total</span>
            </div>
        </div>
    );
}

// Sub-component: Empty State
function EmptyState() {
    return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
            No bookings found for this student
        </div>
    );
}

// Main Component
interface StudentRightColumnV2Props {
    student: StudentModel;
}

export function StudentRightColumnV2({ student }: StudentRightColumnV2Props) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const bookingStudents = student.relations?.bookingStudents || [];

    if (bookingStudents.length === 0) {
        return <EmptyState />;
    }

    // Calculate totals across all bookings
    const totals: Totals = bookingStudents.reduce(
        (acc, bs) => {
            const booking = bs.booking;
            if (!booking) return acc;

            const lessons = booking.lessons || [];
            const events = lessons.reduce((sum: number, lesson: any) => {
                return sum + (lesson.events?.length || 0);
            }, 0);
            const minutes = lessons.reduce((sum: number, lesson: any) => {
                return sum + (lesson.events?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0);
            }, 0);

            return {
                bookings: acc.bookings + 1,
                events: acc.events + events,
                hours: acc.hours + minutes / 60,
            };
        },
        { bookings: 0, events: 0, hours: 0 }
    );

    // Sort bookings by date (most recent first)
    const sortedBookingStudents = [...bookingStudents].sort((a, b) => {
        const dateA = new Date(a.booking?.dateStart || 0).getTime();
        const dateB = new Date(b.booking?.dateStart || 0).getTime();
        return dateB - dateA;
    });

    return (
        <div className="space-y-4">
            <SummaryHeader totals={totals} />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {sortedBookingStudents.map((bs) => {
                    if (!bs.booking) return null;

                    return (
                        <FullBookingCard
                            key={bs.booking.id}
                            bookingData={bs.booking}
                            currency={currency}
                            formatCurrency={formatCurrency}
                        />
                    );
                })}
            </motion.div>
        </div>
    );
}

"use client";

import { ActiveBookingTab } from "@/src/components/tabs/ActiveBookingTab";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

interface ActiveBookingStatsListProps {
    bookings: ActiveBookingModel[];
    onReload?: () => void;
}

export const ActiveBookingStatsList = ({ bookings, onReload }: ActiveBookingStatsListProps) => {
    // Calculate unique students across all active bookings
    const uniqueStudentIds = new Set<string>();
    bookings.forEach((booking) => {
        booking.students.forEach((student) => {
            uniqueStudentIds.add(student.id);
        });
    });

    // Calculate total unique teachers across all bookings
    const totalUniqueTeachers = bookings.reduce((sum, booking) => sum + booking.uniqueTeacherCount, 0);

    //todo: add stats of unqiue + missing hours
    return (
        <div className="space-y-6">
            {/* Bookings List - One per row */}
            <div className="space-y-3 max-w-full">
                {bookings.length > 0 ? (
                    bookings.map((booking) => <ActiveBookingTab key={booking.id} booking={booking} />)
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No active bookings at the moment</p>
                    </div>
                )}
            </div>
        </div>
    );
};

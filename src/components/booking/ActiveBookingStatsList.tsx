"use client";

import { ActiveBookingTab } from "@/src/components/tabs/ActiveBookingTab";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";

interface ActiveBookingStatsListProps {
    bookings: ClassboardModel;
    onReload?: () => void;
}

export const ActiveBookingStatsList = ({ bookings, onReload }: ActiveBookingStatsListProps) => {
    const bookingEntries = Object.entries(bookings);

    // Calculate unique students across all active bookings
    const uniqueStudentIds = new Set<string>();
    bookingEntries.forEach(([_, data]) => {
        data.bookingStudents.forEach((bookingStudent) => {
            uniqueStudentIds.add(bookingStudent.student.id);
        });
    });

    // Calculate total unique teachers across all bookings
    const totalUniqueTeachers = bookingEntries.reduce((sum, [_, data]) => {
        const uniqueTeachers = new Set(data.lessons.map((lesson) => lesson.teacher.username));
        return sum + uniqueTeachers.size;
    }, 0);

    //todo: add stats of unqiue + missing hours
    return (
        <div className="space-y-6">
            {/* Bookings List - One per row */}
            <div className="space-y-3 max-w-full">
                {bookingEntries.length > 0 ? (
                    bookingEntries.map(([id, data]) => <ActiveBookingTab key={id} id={id} data={data} />)
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No active bookings at the moment</p>
                    </div>
                )}
            </div>
        </div>
    );
};

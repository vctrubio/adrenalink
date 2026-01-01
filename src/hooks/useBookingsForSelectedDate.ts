import { useMemo } from "react";
import { isDateInRange } from "@/getters/date-getter";
import type { ClassboardModel, ClassboardData } from "@/backend/models/ClassboardModel";

// Type alias for convenience
export type BookingForDate = ClassboardData;

export function useBookingsForSelectedDate(
    classboardData: ClassboardModel,
    selectedDate: string,
): BookingForDate[] {
    return useMemo(() => {
        console.log("🔄 [useBookingsForSelectedDate] Filtering for date:", selectedDate);

        const filtered: BookingForDate[] = Object.entries(classboardData)
            .map(([bookingId, bookingData]) => {
                // bookingData is already ClassboardData type, just ensure proper structure
                return {
                    ...bookingData,
                    bookingId, // Add bookingId for reference
                } as BookingForDate & { bookingId: string };
            })
            .filter((booking) =>
                isDateInRange(selectedDate, booking.booking.dateStart, booking.booking.dateEnd),
            ) as BookingForDate[];

        console.log("📅 [useBookingsForSelectedDate] Filtered bookings:", filtered.length);

        // Log the complete data structure for debugging
        filtered.forEach((booking) => {
            console.log(`\n📦 Booking: ${booking.booking.id}`);
            console.log(`   Leader: ${booking.booking.leaderStudentName}`);

            booking.lessons.forEach((lesson) => {
                console.log(`   📚 Lesson: ${lesson.id}`);
                console.log(`      Teacher: ${lesson.teacher?.id || "NONE"} | ${lesson.teacher?.username || "N/A"}`);
                console.log(`      Commission: ${lesson.commission?.type || "NONE"}`);
                console.log(`      Events: ${lesson.events?.length || 0}`);
                lesson.events?.forEach((event) => {
                    console.log(`        - Event: ${event.id}`);
                });
            });
        });

        return filtered;
    }, [classboardData, selectedDate]);
}

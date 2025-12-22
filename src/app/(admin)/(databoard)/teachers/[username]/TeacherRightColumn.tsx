import type { TeacherModel } from "@/backend/models";
import { createBookingModel } from "@/backend/models";
import { BookingContainer } from "@/src/components/ids/BookingContainer";

interface TeacherRightColumnProps {
    teacher: TeacherModel;
}

export function TeacherRightColumn({ teacher }: TeacherRightColumnProps) {
    // Extract unique bookings from lessons
    const bookingMap = new Map();
    const lessons = teacher.relations?.lessons || [];
    for (const lesson of lessons) {
        if (lesson.booking && !bookingMap.has(lesson.booking.id)) {
            bookingMap.set(lesson.booking.id, lesson.booking);
        }
    }
    const bookings = Array.from(bookingMap.values());

    return (
        <>
            {/* Teacher Bookings*/}
            {bookings.length > 0 && (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <BookingContainer key={booking.id} booking={createBookingModel(booking)} />
                    ))}
                </div>
            )}
        </>
    );
}


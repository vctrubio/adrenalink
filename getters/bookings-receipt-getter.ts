import { getPrettyDuration } from "@/getters/duration-getter";
import type { ClassboardLesson } from "@/backend/models/ClassboardModel";
import type { SchoolPackageType } from "@/drizzle/schema";

interface ReceiptEvent {
    index: number;
    teacherName: string;
    eventDate: string;
    eventTime: string;
    duration: string;
    location: string;
}

interface BookingReceipt {
    studentName: string;
    packageHours: number;
    totalEventHours: number;
    pricePerHour: number;
    totalPrice: number;
    startDate: string;
    events: ReceiptEvent[];
}

export function getBookingReceipt(
    lessons: ClassboardLesson[],
    schoolPackage: SchoolPackageType,
    studentName: string,
    pricePerStudent: number,
    bookingDateStart: string,
): BookingReceipt {
    const packageHours = schoolPackage.durationMinutes / 60;
    const allEvents = lessons.flatMap((lesson) => lesson.events);
    const totalEventMinutes = allEvents.reduce((sum, e) => sum + e.duration, 0);
    const totalEventHours = totalEventMinutes / 60;
    const pricePerHour = pricePerStudent;
    const totalPrice = totalEventHours * pricePerHour;
    const startDate = new Date(bookingDateStart).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

    const events: ReceiptEvent[] = allEvents.map((event, i) => {
        const lesson = lessons.find((l) => l.events.some((e) => e.id === event.id));
        const teacherName = lesson?.teacher.firstName || lesson?.teacher.username || "Unknown";
        const eventDate = new Date(event.date).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" });
        const eventTime = new Date(event.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        return {
            index: i + 1,
            teacherName,
            eventDate,
            eventTime,
            duration: getPrettyDuration(event.duration),
            location: event.location || "No location",
        };
    });

    return {
        studentName,
        packageHours,
        totalEventHours,
        pricePerHour,
        totalPrice,
        startDate,
        events,
    };
}

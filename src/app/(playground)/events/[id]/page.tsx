import { db } from "@/drizzle/db";
import { event as eventTable, lesson as lessonTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { ActiveBookingTab } from "@/src/components/tabs/ActiveBookingTab";
import EventCard from "@/src/app/(admin)/classboard/EventCard";
import { EventDisplayCard } from "./EventDisplayCard";
import type { ClassboardData } from "@/backend/models/ClassboardModel";
import type { EventNode } from "@/backend/TeacherQueue";
import { AlertTriangle, User, Users, Wind, Hash } from "lucide-react";

// Data fetching function
async function getEventData(eventId: string) {
    // 1. Find the event and its direct relations
    const event = await db.query.event.findFirst({
        where: eq(eventTable.id, eventId),
        with: {
            lesson: {
                with: {
                    teacher: true,
                    commission: true,
                    booking: {
                        with: {
                            school: true,
                            bookingStudents: {
                                with: {
                                    student: true,
                                },
                            },
                            studentPackage: {
                                with: {
                                    schoolPackage: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!event) return null;

    // 2. Find all lessons and their events for the entire booking to make progress bar accurate
    const allLessonsForBooking = await db.query.lesson.findMany({
        where: eq(lessonTable.bookingId, event.lesson.bookingId),
        with: {
            teacher: true,
            commission: true,
            events: true,
        },
    });

    return {
        event,
        allLessonsForBooking,
    };
}

export default async function EventViewPage({ params }: { params: { id: string } }) {
    const fetchedData = await getEventData(params.id);

    if (!fetchedData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex items-center gap-4 p-8 bg-card border rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Event Not Found</h1>
                        <p className="text-muted-foreground">The requested event with ID "{params.id}" could not be found.</p>
                    </div>
                </div>
            </div>
        );
    }

    const { event, allLessonsForBooking } = fetchedData;

    const { lesson } = event;
    if (!lesson) {
        return <div className="p-8 text-center text-destructive">Error: The lesson associated with this event could not be found.</div>;
    }

    const { teacher, commission, booking } = lesson;
    if (!booking) {
        return <div className="p-8 text-center text-destructive">Error: The booking associated with this lesson could not be found.</div>;
    }

    const { school, bookingStudents, studentPackage } = booking;
    const { schoolPackage } = studentPackage;

    // --- Data Transformation ---

    const bookingDataForTab: ClassboardData = {
        booking: {
            dateStart: booking.dateStart,
            dateEnd: booking.dateEnd,
            schoolId: booking.schoolId,
        },
        schoolPackage: schoolPackage,
        bookingStudents: bookingStudents.map((bs) => ({
            student: {
                ...bs.student,
                description: null, // This info is on schoolStudents, not directly available here but is optional
            },
        })),
        lessons: allLessonsForBooking,
    };

    const eventDataForAdminCard: EventNode = {
        id: event.id,
        lessonId: event.lessonId,
        bookingId: lesson.bookingId,
        eventData: {
            date: event.date.toISOString(),
            duration: event.duration,
            location: event.location,
            status: event.status,
        },
        studentData: bookingStudents.map((bs) => bs.student),
        packageData: schoolPackage,
        next: null, // No queue context here
    };

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-2 text-white">Event Booking Dashboard</h1>
            <p className="text-white/60 mb-6">
                A 360° view of event <code className="bg-white/10 text-white/80 px-1.5 py-1 rounded-md text-xs">{params.id}</code> for all user portals.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top-Left: Booking Card */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-white/80">
                        <User className="w-5 h-5" /> Admin Portal View
                    </h2>
                    <ActiveBookingTab id={booking.id} data={bookingDataForTab} />
                </div>

                {/* Top-Right: Admin Event Card */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-white/80">
                        <Hash className="w-5 h-5" /> Classboard Admin View
                    </h2>
                    <EventCard event={eventDataForAdminCard} />
                </div>

                {/* Bottom-Left: Student Event Card */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-white/80">
                        <Users className="w-5 h-5" /> Student Portal View
                    </h2>
                    <EventDisplayCard event={event} lesson={lesson} students={bookingStudents.map((bs) => bs.student)} schoolPackage={schoolPackage} userRole="student" />
                </div>

                {/* Bottom-Right: Teacher Event Card */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-white/80">
                        <Wind className="w-5 h-5" /> Teacher Portal View
                    </h2>
                    <EventDisplayCard event={event} lesson={lesson} students={bookingStudents.map((bs) => bs.student)} schoolPackage={schoolPackage} userRole="teacher" />
                </div>
            </div>
        </div>
    );
}

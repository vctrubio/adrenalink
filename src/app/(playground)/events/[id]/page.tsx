import { db } from "@/drizzle/db";
import { event as eventTable, lesson as lessonTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { ActiveBookingTab } from "@/src/components/tabs/ActiveBookingTab";
import EventCard from "@/src/app/(admin)/classboard/EventCard";
import { EventStudentCard } from "@/src/portals/EventStudentCard";
import type { ClassboardData } from "@/backend/models/ClassboardModel";
import type { EventNode } from "@/backend/TeacherQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tag } from "@/src/components/ui/tag";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { AlertTriangle, User, Users, Wind, Wallet, Calendar, Clock, MapPin, Hash, Tag as TagIcon } from "lucide-react";

// Fully-fledged EventTeacherCard component
function EventTeacherCard({ event, lesson, commission, students, schoolPackage }: any) {
    const { teacher } = lesson;
    const studentCount = students.length;
    const commissionTotal = (parseFloat(commission.cph) * event.duration) / 60;
    const eventDate = new Date(event.date);
    const dayName = eventDate.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const time = eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] h-full flex flex-col">
            {/* Header: Day and Date */}
            <div className="flex items-baseline gap-3 mb-6">
                <h3 className="text-4xl font-black tracking-tight text-foreground">{dayName}</h3>
                <span className="text-xl font-medium text-muted-foreground">{monthDay}</span>
            </div>

            {/* Time & Location */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Time</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{time}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Location</span>
                    </div>
                    <p className="text-lg font-bold text-foreground leading-tight">{event.location}</p>
                </div>
            </div>

            {/* Students List */}
            <div className="mb-6 flex-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Students ({studentCount})</span>
                </div>
                <div className="space-y-2">
                    {students.map((student: any) => (
                        <div key={student.id} className="text-sm font-medium text-foreground">{student.firstName} {student.lastName}</div>
                    ))}
                </div>
            </div>

            {/* Commission and Package */}
            <div className="mt-auto pt-6 border-t border-border/50 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Package</span>
                    <span className="text-sm font-semibold text-foreground">{schoolPackage.description}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rate</span>
                     <span className="text-sm font-semibold text-foreground">${commission.cph}/hr ({commission.commissionType})</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Wallet className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-foreground">${commissionTotal.toFixed(2)}</span>
                     <span className="text-xs font-medium text-muted-foreground self-end pb-1">Earned</span>
                </div>
            </div>
            <div className="absolute top-6 right-6">
                <Tag 
                    name={EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG].label}
                    color={EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG].color}
                    borderColorHex={EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG].color}
                    icon={<TagIcon className="w-4 h-4" />}
                    bgColor={`${EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG].color}20`}
                />
            </div>
        </div>
    );
}

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
        }
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
        return <div className="p-8 text-center text-destructive">Error: The lesson associated with this event could not be found.</div>
    }

    const { teacher, commission, booking } = lesson;
    if (!booking) {
        return <div className="p-8 text-center text-destructive">Error: The booking associated with this lesson could not be found.</div>
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
        bookingStudents: bookingStudents.map(bs => ({
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
        studentData: bookingStudents.map(bs => bs.student),
        packageData: schoolPackage,
        next: null, // No queue context here
    };

    const eventDataForStudentCard = {
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        location: event.location,
        date: event.date.toISOString(),
        duration: event.duration,
        capacity: schoolPackage.capacityStudents,
        packageDescription: schoolPackage.description,
        pricePerHour: schoolPackage.pricePerStudent / (schoolPackage.durationMinutes / 60),
        status: event.status,
        categoryEquipment: schoolPackage.categoryEquipment,
        capacityEquipment: schoolPackage.capacityEquipment,
    };
    
    return (
        <div className="p-4 md:p-8 bg-muted/20 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">Event Booking Dashboard</h1>
            <p className="text-muted-foreground mb-6">A 360° view of event <code className="bg-muted px-1.5 py-1 rounded-md text-xs">{params.id}</code> for all user portals.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top-Left: Booking Card */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5"/> Admin Portal View</h2>
                    <ActiveBookingTab id={booking.id} data={bookingDataForTab} />
                </div>

                {/* Top-Right: Admin Event Card */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><Hash className="w-5 h-5"/> Classboard Admin View</h2>
                    <EventCard event={eventDataForAdminCard} />
                </div>

                {/* Bottom-Left: Student Event Card */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5"/> Student Portal View</h2>
                    <EventStudentCard {...eventDataForStudentCard} />
                </div>

                {/* Bottom-Right: Teacher Event Card */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><Wind className="w-5 h-5"/> Teacher Portal View</h2>
                    <EventTeacherCard 
                        event={event}
                        lesson={lesson}
                        commission={commission}
                        students={bookingStudents.map(bs => bs.student)}
                        schoolPackage={schoolPackage}
                    />
                </div>
            </div>
        </div>
    );
}

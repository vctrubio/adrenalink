"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useStudentLessonListener } from "@/src/supabase/subscribe";
import type { StudentPackageBookingLessons } from "@/src/actions/user-action";
import type { ApiActionResponseModel } from "@/types/actions";
import { Calendar, Clock } from "lucide-react";

interface StudentPortalProps {
    studentId: string;
    schoolId: string;
    data: StudentPackageBookingLessons;
    onDataUpdate: (data: StudentPackageBookingLessons) => void;
}

export function StudentPortal({ studentId, schoolId, data, onDataUpdate }: StudentPortalProps) {
    const previousEventsRef = useRef<Map<string, StudentPackageBookingLessons["lessons"][0]["events"]>>(new Map());

    // Initialize previous events on mount
    useEffect(() => {
        data.lessons.forEach((lesson) => {
            previousEventsRef.current.set(lesson.id, lesson.events);
        });
    }, [data]);

    // Detect event changes and show toast
    const detectEventChanges = (newData: StudentPackageBookingLessons) => {
        newData.lessons.forEach((lesson) => {
            const previousEvents = previousEventsRef.current.get(lesson.id) || [];
            const previousEventIds = new Set(previousEvents.map((e) => e.id));
            const newEventIds = new Set(lesson.events.map((e) => e.id));

            // Check for new events
            lesson.events.forEach((event) => {
                if (!previousEventIds.has(event.id)) {
                    const date = new Date(event.date).toLocaleDateString();
                    const time = new Date(event.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                    toast.custom(
                        () => (
                            <div className="flex items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950 p-4 shadow-lg">
                                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-semibold text-foreground">Event Added</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {lesson.teacherName} • {date} at {time}
                                    </div>
                                </div>
                            </div>
                        ),
                        { duration: 4000 }
                    );
                }
            });

            // Check for deleted events
            previousEvents.forEach((event) => {
                if (!newEventIds.has(event.id)) {
                    toast.custom(
                        () => (
                            <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950 p-4 shadow-lg">
                                <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-semibold text-foreground">Event Removed</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {lesson.teacherName} • event update desc:::
                                    </div>
                                </div>
                            </div>
                        ),
                        { duration: 4000 }
                    );
                }
            });

            // Update ref with new events
            previousEventsRef.current.set(lesson.id, lesson.events);
        });
    };

    // Setup real-time listener
    const handleEventDetected = (result: ApiActionResponseModel<StudentPackageBookingLessons>) => {
        if (result.success && result.data) {
            detectEventChanges(result.data);
            onDataUpdate(result.data);
        }
    };

    useStudentLessonListener({
        studentId,
        schoolId,
        onEventDetected: handleEventDetected,
    });

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    {data.firstName} {data.lastName}
                </h1>
                <p className="text-muted-foreground">Student Portal</p>
            </div>

            <div className="grid gap-6">
                {data.lessons.length === 0 ? (
                    <div className="text-muted-foreground">No lessons found</div>
                ) : (
                    data.lessons.map((lesson) => (
                        <div key={lesson.id} className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-semibold text-lg">{lesson.teacherName}</h2>
                                    <p className="text-sm text-muted-foreground">@{lesson.teacherUsername}</p>
                                </div>
                                <div className="text-sm bg-muted px-3 py-1 rounded">
                                    {lesson.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Package</p>
                                    <p className="font-medium">{lesson.schoolPackage.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Price per Student</p>
                                    <p className="font-medium">${lesson.schoolPackage.pricePerStudent}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Duration</p>
                                    <p className="font-medium">{lesson.schoolPackage.durationMinutes} min</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Commission</p>
                                    <p className="font-medium">
                                        {lesson.commission.type === "percentage" ? `${lesson.commission.cph}%` : `$${lesson.commission.cph}`}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Events</h3>
                                <div className="space-y-2">
                                    {lesson.events.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No events scheduled</p>
                                    ) : (
                                        lesson.events.map((event) => (
                                            <div key={event.id} className="bg-muted/50 p-3 rounded text-sm">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                                                    <span className="text-xs bg-background px-2 py-1 rounded">{event.status}</span>
                                                </div>
                                                <p className="text-muted-foreground">
                                                    {new Date(event.date).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })} • {event.duration} min
                                                </p>
                                                <p className="text-muted-foreground text-xs mt-1">{event.location}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground border-t pt-4">
                                <p>
                                    Booking: {new Date(lesson.booking.dateStart).toLocaleDateString("en-US")} -{" "}
                                    {new Date(lesson.booking.dateEnd).toLocaleDateString("en-US")}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

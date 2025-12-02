"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useStudentLessonListener } from "@/supabase/subscribe";
import type { StudentPackageBookingLessons } from "@/actions/user-action";
import type { ApiActionResponseModel } from "@/types/actions";
import { Calendar, Clock } from "lucide-react";
import { EventStudentCard } from "./EventStudentCard";

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
                            <div className="flex items-center gap-4 rounded-2xl border-2 border-blue-500/50 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/90 dark:to-cyan-950/90 p-5 shadow-2xl backdrop-blur-sm">
                                <div className="p-2 rounded-full bg-blue-500/20">
                                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-foreground text-lg">New Session Added!</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        <span className="font-medium">{lesson.teacherName}</span> • {date} at {time}
                                    </div>
                                </div>
                            </div>
                        ),
                        { duration: 5000 }
                    );
                }
            });

            // Check for deleted events
            previousEvents.forEach((event) => {
                if (!newEventIds.has(event.id)) {
                    const date = new Date(event.date).toLocaleDateString();
                    const time = new Date(event.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                    toast.custom(
                        () => (
                            <div className="flex items-center gap-4 rounded-2xl border-2 border-orange-500/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/90 dark:to-amber-950/90 p-5 shadow-2xl backdrop-blur-sm">
                                <div className="p-2 rounded-full bg-orange-500/20">
                                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-foreground text-lg">Session Cancelled</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        <span className="font-medium">{lesson.teacherName}</span> • {date} at {time}
                                    </div>
                                </div>
                            </div>
                        ),
                        { duration: 5000 }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950/30 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Hero Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Welcome, {data.firstName}!
                    </h1>
                    <p className="text-lg text-muted-foreground">Your adventure awaits</p>
                </div>

                <div className="space-y-8">
                    {data.lessons.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">No lessons scheduled yet</p>
                            <p className="text-sm text-muted-foreground mt-2">Check back soon for your upcoming sessions!</p>
                        </div>
                    ) : (
                        data.lessons.map((lesson) => (
                            <div key={lesson.id} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-6 shadow-lg">
                            <div className="flex justify-between items-start pb-4 border-b border-border/50">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Package</p>
                                    <h2 className="text-2xl font-bold text-foreground">{lesson.schoolPackage.name}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">with {lesson.teacherName}</p>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-background/80 backdrop-blur-sm border border-border text-foreground shadow-sm">
                                    {lesson.status}
                                </span>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-4 text-lg">Your Sessions</h3>
                                <div className="space-y-4">
                                    {lesson.events.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">No sessions scheduled yet</p>
                                    ) : (
                                        lesson.events.map((event) => {
                                            const pricePerHour = (lesson.schoolPackage.pricePerStudent / lesson.schoolPackage.durationMinutes) * 60;
                                            return (
                                                <EventStudentCard
                                                    key={event.id}
                                                    teacherName={lesson.teacherName}
                                                    location={event.location}
                                                    date={event.date}
                                                    duration={event.duration}
                                                    capacity={lesson.schoolPackage.capacityStudents}
                                                    packageDescription={lesson.schoolPackage.name}
                                                    pricePerHour={pricePerHour}
                                                    status={event.status}
                                                    categoryEquipment={lesson.schoolPackage.categoryEquipment}
                                                    capacityEquipment={lesson.schoolPackage.capacityEquipment}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="text-xs text-center text-muted-foreground border-t border-border/50 pt-4">
                                <p className="font-medium">
                                    Booking Period: {new Date(lesson.booking.dateStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - {new Date(lesson.booking.dateEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ActiveStudentBookingTab } from "@/src/components/tabs/ActiveStudentBookingTab";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { showEntityToast } from "@/getters/toast-getter";
import { prettyDateSpan } from "@/getters/date-getter";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "@/config/entities";

interface StudentClassDailyProps {
    bookings: DraggableBooking[];
    classboardData: ClassboardModel;
    selectedDate: string;
    classboard: {
        onDragStart: (booking: DraggableBooking) => void;
        onDragEnd: () => void;
        onAddLessonEvent?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
    };
    setOnNewBooking?: (callback: () => void) => void;
}

type StudentBookingFilter = "available" | "onboard";

export default function StudentClassDaily({ bookings, classboardData, selectedDate, classboard, setOnNewBooking }: StudentClassDailyProps) {
    const [filter, setFilter] = useState<StudentBookingFilter>("available");
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");

    // Track last shown booking toast to prevent duplicates
    const lastToastBookingIdRef = useRef<string | null>(null);
    const previousBookingCountRef = useRef(bookings.length);

    // Detect new bookings and show toast
    useEffect(() => {
        if (bookings.length > previousBookingCountRef.current) {
            // Get the newest booking (first one in the array)
            const newestBooking = bookings[0];

            // Check if we already showed a toast for this booking
            if (newestBooking && lastToastBookingIdRef.current !== newestBooking.bookingId) {
                // Get booking data for date span
                const bookingData = classboardData[newestBooking.bookingId];
                const dateStart = bookingData?.booking.dateStart || "";
                const dateEnd = bookingData?.booking.dateEnd || "";

                showEntityToast("booking", {
                    title: "New Booking Alert",
                    description: prettyDateSpan(dateStart, dateEnd),
                    duration: 4000,
                });

                lastToastBookingIdRef.current = newestBooking.bookingId;
            }
        }

        previousBookingCountRef.current = bookings.length;
    }, [bookings, classboardData]);

    // Register a no-op callback with parent (just for compatibility)
    useEffect(() => {
        if (setOnNewBooking) {
            setOnNewBooking(() => {
                // No-op - the actual toast is shown via the useEffect above
            });
        }
    }, [setOnNewBooking]);

    const { filteredBookings, counts } = useMemo(() => {
        // All bookings (onboard)
        const onboardBookings = bookings;

        // Available = onboard bookings that do NOT have an event on selectedDate
        const availableBookings = onboardBookings.filter((booking) => {
            const bookingData = classboardData[booking.bookingId];
            if (!bookingData) return true;

            const lessons = bookingData.lessons || [];
            const hasEventToday = lessons.some((lesson) => {
                const events = lesson.events || [];
                return events.some((event) => {
                    if (!event.date) return false;
                    const eventDate = new Date(event.date).toISOString().split("T")[0];
                    return eventDate === selectedDate;
                });
            });

            return !hasEventToday;
        });

        const counts = {
            onboard: onboardBookings.length,
            available: availableBookings.length,
            completed: 0,
        };

        let filteredData: DraggableBooking[];
        if (filter === "available") {
            filteredData = availableBookings;
        } else {
            filteredData = onboardBookings;
        }

        return { filteredBookings: filteredData, counts };
    }, [bookings, classboardData, selectedDate, filter]);

    const filterTabs: Array<{ id: StudentBookingFilter; label: string; count: number }> = [
        { id: "available", label: "Available", count: counts.available },
        { id: "onboard", label: "Onboard", count: counts.onboard },
    ];

    return (
        <div className="flex flex-col bg-card border border-border rounded-lg p-4 px-6.5 h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div style={{ color: studentEntity?.color }}>
                        <HelmetIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Students</h3>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 bg-muted rounded-lg p-1.5 w-full sm:w-auto">
                    {filterTabs.map(({ id, label, count }) => (
                        <button
                            key={id}
                            onClick={() => setFilter(id)}
                            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filter === id ? "bg-background text-foreground shadow-md border border-border" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
                        >
                            {label}
                            <span className={`ml-2 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold ${filter === id ? "bg-primary/15 text-primary" : "bg-background/50 text-muted-foreground"}`}>{count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {filteredBookings.length > 0 && (
                <div className="flex flex-wrap gap-4 border-t border-border pt-4 flex-1">
                    {filteredBookings.map((booking) => {
                        const bookingData = classboardData[booking.bookingId];
                        if (!bookingData) return null;

                        const availableTeachers = booking.lessons.map((lesson) => lesson.teacherUsername);
                        const existingTeacherUsernames = bookingData.lessons.map((lesson) => lesson.teacher?.username).filter(Boolean) as string[];

                        return (
                            <div key={booking.bookingId}>
                                <ActiveStudentBookingTab
                                    id={booking.bookingId}
                                    data={bookingData}
                                    onAddLessonEvent={(teacherUsername) => classboard.onAddLessonEvent?.(booking, teacherUsername)}
                                    availableTeachers={availableTeachers}
                                    existingTeacherUsernames={existingTeacherUsernames}
                                    onDragStart={() => classboard.onDragStart(booking)}
                                    onDragEnd={classboard.onDragEnd}
                                    draggableBooking={booking}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import StudentBookingCard from "./StudentBookingCard";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { showEntityToast } from "@/getters/toast-getter";
import { prettyDateSpan } from "@/getters/date-getter";

interface StudentClassDailyProps {
    bookings: DraggableBooking[];
    classboardData: ClassboardModel;
    selectedDate: string;
    onDragStart: (booking: DraggableBooking) => void;
    onDragEnd: () => void;
    onAddLessonEvent?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
    setOnNewBooking?: (callback: () => void) => void;
}

type StudentBookingFilter = "available" | "onboard";

export default function StudentClassDaily({ bookings, classboardData, selectedDate, onDragStart, onDragEnd, onAddLessonEvent, setOnNewBooking }: StudentClassDailyProps) {
    const [filter, setFilter] = useState<StudentBookingFilter>("available");

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

    const emptyMessage = {
        available: "No available bookings for this date",
        onboard: "No onboard bookings for this date",
    }[filter];

    const filterTabs: Array<{ id: StudentBookingFilter; label: string; count: number }> = [
        { id: "available", label: "Available", count: counts.available },
        { id: "onboard", label: "Onboard", count: counts.onboard },
    ];

    return (
        <div className="space-y-4 bg-card border border-border rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Student Bookings</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage and schedule available bookings</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 bg-muted rounded-lg p-1.5">
                    {filterTabs.map(({ id, label, count }) => (
                        <button
                            key={id}
                            onClick={() => setFilter(id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filter === id ? "bg-background text-foreground shadow-md border border-border" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
                        >
                            {label}
                            <span className={`ml-2 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold ${filter === id ? "bg-primary/15 text-primary" : "bg-background/50 text-muted-foreground"}`}>{count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {filteredBookings.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="text-muted-foreground text-sm mb-2">No bookings found</div>
                    <p className="text-xs text-muted-foreground/70">{emptyMessage}</p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-4">
                    {filteredBookings.map((booking) => {
                        const bookingData = classboardData[booking.bookingId];
                        const students =
                            bookingData?.bookingStudents.map((bs) => ({
                                name: `${bs.student.firstName} ${bs.student.lastName}`,
                                description: bs.student.description || null,
                                languages: bs.student.languages || [],
                            })) || [];

                        return (
                            <div key={booking.bookingId} style={{ width: "269px" }}>
                                <StudentBookingCard
                                    booking={booking}
                                    students={students}
                                    dateStart={bookingData?.booking.dateStart}
                                    dateEnd={bookingData?.booking.dateEnd}
                                    package={bookingData?.schoolPackage}
                                    selectedClientDate={selectedDate}
                                    onDragStart={() => onDragStart(booking)}
                                    onDragEnd={onDragEnd}
                                    onAddLessonEvent={(teacherUsername) => onAddLessonEvent?.(booking, teacherUsername)}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Switch } from "@headlessui/react";
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

    return (
        <div className="flex flex-col h-full">
            {/* Header with Icon and Switch */}
            <div className="p-4 px-6.5 border-b border-border space-y-3">
                <div className="flex items-center gap-4">
                    <HelmetIcon className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                    <div className="text-xl font-bold text-foreground">Students</div>
                    <div className="ml-auto flex items-center gap-2">
                        <span
                            className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold transition-colors ${filter === "available" ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" : "bg-muted text-muted-foreground"}`}
                        >
                            {counts.available}
                        </span>

                        <Switch
                            checked={filter === "onboard"}
                            onChange={(checked) => setFilter(checked ? "onboard" : "available")}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 ${filter === "onboard" ? "bg-yellow-500" : "bg-muted-foreground/40"}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${filter === "onboard" ? "translate-x-6" : "translate-x-1"}`} />
                        </Switch>

                        <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold transition-colors ${filter === "onboard" ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" : "bg-muted text-muted-foreground"}`}>
                            {counts.onboard}
                        </span>
                    </div>
                </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-4">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => {
                        const bookingData = classboardData[booking.bookingId];
                        if (!bookingData) return null;

                        return <ActiveStudentBookingTab key={booking.bookingId} bookingData={bookingData} draggableBooking={booking} classboard={classboard} selectedDate={selectedDate} />;
                    })
                ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No {filter} students</div>
                )}
            </div>
        </div>
    );
}

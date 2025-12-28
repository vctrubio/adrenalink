"use client";

import { useState, useMemo, useEffect } from "react";
import StudentBookingCard from "./StudentBookingCard";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";

interface StudentClassDailyProps {
    bookings: DraggableBooking[];
    classboardData: ClassboardModel;
    selectedDate: string;
    classboard: {
        onDragStart: (booking: DraggableBooking) => void;
        onDragEnd: () => void;
        onAddLessonEvent?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
        onAddTeacher?: (booking: DraggableBooking, teacherUsername: string) => Promise<void>;
        availableTeachers?: { username: string; firstName: string; id: string }[];
    };
}

type StudentBookingFilter = "available" | "onboard";

export default function StudentClassDaily({ bookings, classboardData, selectedDate, classboard }: StudentClassDailyProps) {
    const [filter, setFilter] = useState<StudentBookingFilter>("available");

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
        <div className="boder border-red-500 mx-auto">
            {/* Header with Icon and Switch */}
            <div className="p-4 px-6.5 border-b border-border space-y-3">
                <div className="flex items-center gap-4">
                    <HelmetIcon className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                    <div className="text-xl font-bold text-foreground">Students</div>
                    <div className="ml-auto">
                        <ToggleSwitch value={filter} onChange={(newFilter) => setFilter(newFilter as StudentBookingFilter)} values={{ left: "available", right: "onboard" }} counts={counts} color="yellow" />
                    </div>
                </div>
            </div>

            {/* Cards */}
            <div className="flex flex-row flex-wrap gap-3 p-4">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => {
                        const bookingData = classboardData[booking.bookingId];
                        if (!bookingData) return null;

                        return <StudentBookingCard key={booking.bookingId} bookingData={bookingData} draggableBooking={booking} classboard={classboard} selectedDate={selectedDate} />;
                    })
                ) : (
                    <div className="flex items-center justify-center w-full h-32 text-xs text-muted-foreground">No {filter} students</div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StudentBookingCard from "./StudentBookingCard";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";

// Muted yellow - softer than entity color
const STUDENT_COLOR = "#ca8a04";

interface StudentClassDailyV2Props {
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

export default function StudentClassDailyV2({ bookings, classboardData, selectedDate, classboard }: StudentClassDailyV2Props) {
    const [filter, setFilter] = useState<StudentBookingFilter>("available");
    const [isExpanded, setIsExpanded] = useState(true);

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
        <div className="flex flex-col h-full">
            {/* Header with Icon and Switch */}
            <div className="p-4 px-6 border-b-2 border-background flex items-center gap-4 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors select-none" onClick={() => setIsExpanded(!isExpanded)}>
                <div style={{ color: STUDENT_COLOR }}>
                    <HelmetIcon className="w-7 h-7 flex-shrink-0" />
                </div>
                <span className="text-lg font-bold text-foreground">Students</span>
                <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch value={filter} onChange={(newFilter) => setFilter(newFilter as StudentBookingFilter)} values={{ left: "available", right: "onboard" }} counts={counts} tintColor={STUDENT_COLOR} />
                </div>
            </div>

            {/* Collapsible Cards Container */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        transition={{ duration: 0.3, ease: "easeOut" }} 
                        className="overflow-x-auto xl:overflow-y-auto flex-1 min-h-0 max-h-[450px] xl:max-h-none"
                    >
                        <div className="p-4">
                            <div className="flex flex-row xl:flex-col gap-3">
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => {
                                        const bookingData = classboardData[booking.bookingId];
                                        if (!bookingData) return null;

                                        return <StudentBookingCard key={booking.bookingId} bookingData={bookingData} draggableBooking={booking} classboard={classboard} selectedDate={selectedDate} />;
                                    })
                                ) : (
                                    <div className="flex items-center justify-center w-full h-16 text-xs text-muted-foreground/20">No {filter} students</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

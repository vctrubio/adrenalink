"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StudentBookingCard from "./StudentBookingCard";
import BookingOnboardCard from "./BookingOnboardCard";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import LessonFlagLocationSettingsController from "./LessonFlagLocationSettingsController";
import type { ClassboardData } from "@/backend/models/ClassboardModel";

const STUDENT_COLOR = "#ca8a04";

type StudentBookingFilter = "available" | "all";

export default function StudentClassDaily() {
    const { bookingsForSelectedDate: bookings, globalFlag, optimisticEvents, selectedDate } = useClassboardContext();

    const [filter, setFilter] = useState<StudentBookingFilter>("available");

    const isAdjustmentMode = globalFlag.isAdjustmentMode();

    const { filteredBookings, counts } = useMemo(() => {
        const hasEvents = (booking: ClassboardData): boolean => {
            const lessons = booking.lessons || [];

            // Check real events for the selected date
            const hasRealEvents = lessons.some((lesson) => 
                (lesson.events || []).some(event => event.date.startsWith(selectedDate))
            );
            if (hasRealEvents) return true;

            // Check optimistic events for this booking
            const bookingId = booking.booking.id;
            const hasOptimisticEvent = Array.from(optimisticEvents.values()).some(
                (opt) => opt.bookingId === bookingId && opt.date.startsWith(selectedDate)
            );
            return hasOptimisticEvent;
        };

        const onboardBookings = bookings.filter(hasEvents);
        const availableBookings = bookings.filter((b) => !hasEvents(b));

        const counts = {
            available: availableBookings.length,
            all: bookings.length,
        };

        let filteredData: ClassboardData[];
        if (filter === "all") {
            // Show all student booking cards
            filteredData = bookings;
        } else {
            // Show available bookings, with onboard (hasEvents) sorted to bottom
            filteredData = [...availableBookings, ...onboardBookings];
        }

        return { filteredBookings: filteredData, counts };
    }, [bookings, filter, optimisticEvents]);

    return (
        <div className="flex flex-col h-full bg-card">
            {!isAdjustmentMode && (
                <div className="p-4 px-6 border-b-2 border-background bg-card flex items-center gap-4 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors select-none">
                    <div style={{ color: STUDENT_COLOR }}>
                        <HelmetIcon className="w-7 h-7 flex-shrink-0" />
                    </div>
                    <span className="text-lg font-bold text-foreground">Students</span>
                    <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <ToggleSwitch value={filter} onChange={(newFilter) => setFilter(newFilter as StudentBookingFilter)} values={{ left: "available", right: "all" }} counts={counts} tintColor={STUDENT_COLOR} />
                    </div>
                </div>
            )}

            {/* Collapsible Cards Container */}
            <AnimatePresence>
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-x-auto xl:overflow-y-auto flex-1 min-h-0 max-h-[450px] xl:max-h-none"
                >
                    {isAdjustmentMode ? (
                        <LessonFlagLocationSettingsController />
                    ) : (
                        <div className="p-4">
                            <div className="flex flex-row xl:flex-col gap-3">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {filteredBookings.map((bookingData) => {
                                        const lessons = bookingData.lessons || [];
                                        const hasRealEvents = lessons.some((lesson) => 
                                            (lesson.events || []).some(event => event.date.startsWith(selectedDate))
                                        );
                                        const hasOptimisticEvent = Array.from(optimisticEvents.values()).some(
                                            (opt) => opt.bookingId === bookingData.booking.id && opt.date.startsWith(selectedDate)
                                        );
                                        const hasEventToday = hasRealEvents || hasOptimisticEvent;

                                        // Determine which component to render
                                        const Component = (filter === "all" || !hasEventToday) 
                                            ? StudentBookingCard 
                                            : BookingOnboardCard;

                                        return (
                                            <motion.div
                                                layout="position"
                                                key={bookingData.booking.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{
                                                    duration: 0.3,
                                                    ease: [0.23, 1, 0.32, 1] // Custom quintic ease for a smooth, professional feel
                                                }}
                                                className="flex-shrink-0"
                                            >
                                                <Component bookingData={bookingData} />
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

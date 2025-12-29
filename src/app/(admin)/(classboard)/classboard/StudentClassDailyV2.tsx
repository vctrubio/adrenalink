"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StudentBookingCard from "./StudentBookingCard";
import BookingOnboardCard from "./BookingOnboardCard";
import ExpandCollapseButtons from "@/src/components/ui/ExpandCollapseButtons";
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
    const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set(bookings.map(b => b.bookingId)));

    const toggleBookingExpanded = (bookingId: string) => {
        setExpandedBookings(prev => {
            const newSet = new Set(prev);
            if (newSet.has(bookingId)) {
                newSet.delete(bookingId);
            } else {
                newSet.add(bookingId);
            }
            return newSet;
        });
    };

    const expandAllBookings = () => {
        setExpandedBookings(new Set(bookings.map(b => b.bookingId)));
    };

    const collapseAllBookings = () => {
        setExpandedBookings(new Set());
    };

    const { filteredBookings, counts } = useMemo(() => {
        // All bookings
        const allBookings = bookings;

        // Onboard = bookings that HAVE an event on selectedDate
        const onboardBookings = allBookings.filter((booking) => {
            const bookingData = classboardData[booking.bookingId];
            if (!bookingData) return false;

            const lessons = bookingData.lessons || [];
            return lessons.some((lesson) => {
                const events = lesson.events || [];
                return events.some((event) => {
                    if (!event.date) return false;
                    const eventDate = new Date(event.date).toISOString().split("T")[0];
                    return eventDate === selectedDate;
                });
            });
        });

        const counts = {
            onboard: onboardBookings.length,
            available: allBookings.length,
        };

        let filteredData: DraggableBooking[];
        if (filter === "available") {
            filteredData = allBookings;
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
                    {filter === "available" && (
                        <ExpandCollapseButtons
                            onExpandAll={expandAllBookings}
                            onCollapseAll={collapseAllBookings}
                        />
                    )}
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
                                {filteredBookings.map((booking) => {
                                    const bookingData = classboardData[booking.bookingId];
                                    if (!bookingData) return null;

                                    // Check if this booking has events today
                                    const lessons = bookingData.lessons || [];
                                    const hasEventToday = lessons.some((lesson) => {
                                        const events = lesson.events || [];
                                        return events.some((event) => {
                                            if (!event.date) return false;
                                            const eventDate = new Date(event.date).toISOString().split("T")[0];
                                            return eventDate === selectedDate;
                                        });
                                    });

                                    // For "available" filter: Show all bookings (regardless of on board status)
                                    if (filter === "available") {
                                        if (!hasEventToday) {
                                            return <StudentBookingCard key={booking.bookingId} bookingData={bookingData} draggableBooking={booking} classboard={classboard} selectedDate={selectedDate} />;
                                        } else {
                                            return <BookingOnboardCard key={booking.bookingId} bookingData={bookingData} selectedDate={selectedDate} onClick={() => toggleBookingExpanded(booking.bookingId)} />;
                                        }
                                    }

                                    // For "onboard" filter: Show StudentBookingCard for bookings WITH events
                                    if (filter === "onboard" && hasEventToday) {
                                        return <StudentBookingCard key={booking.bookingId} bookingData={bookingData} draggableBooking={booking} classboard={classboard} selectedDate={selectedDate} />;
                                    }

                                    return null;
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

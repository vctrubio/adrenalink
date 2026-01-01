"use client";

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StudentBookingCard from "./StudentBookingCard";
import BookingOnboardCard from "./BookingOnboardCard";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import type { ClassboardData } from "@/backend/models/ClassboardModel";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";

// Muted yellow - softer than entity color
const STUDENT_COLOR = "#ca8a04";

interface StudentClassDailyProps {
    bookings: ClassboardData[];
    classboard: {
        onDragStart: (draggableBooking: DraggableBooking) => void;
        onDragEnd: () => void;
        onAddLessonEvent?: (bookingId: string, lessonId: string) => Promise<void>;
    };
}

type StudentBookingFilter = "available" | "onboard";
type SortOption = "newest" | "latest" | "progression";

export default function StudentClassDaily({ bookings, classboard }: StudentClassDailyProps) {
    const [filter, setFilter] = useState<StudentBookingFilter>("available");
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set(bookings.map((b) => b.booking.id)));
    const [sortBy, setSortBy] = useState<SortOption>("progression");

    // Load sort preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("studentBookingSort");
        if (saved === "newest" || saved === "latest" || saved === "progression") {
            setSortBy(saved);
        }
    }, []);

    // Save sort preference to localStorage
    const handleSortChange = (value: SortOption) => {
        setSortBy(value);
        localStorage.setItem("studentBookingSort", value);
    };

    const toggleBookingExpanded = (bookingId: string) => {
        setExpandedBookings((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(bookingId)) {
                newSet.delete(bookingId);
            } else {
                newSet.add(bookingId);
            }
            return newSet;
        });
    };

    const { filteredBookings, counts } = useMemo(() => {
        // All bookings (already filtered by selectedDate in ClientClassboard)
        const allBookings = bookings;

        // Helper to check if booking has any events
        const hasEvents = (booking: ClassboardData): boolean => {
            const lessons = booking.lessons || [];
            return lessons.some((lesson) => (lesson.events || []).length > 0);
        };

        // Onboard = bookings that have events
        const onboardBookings = allBookings.filter(hasEvents);

        const counts = {
            onboard: onboardBookings.length,
            available: allBookings.length,
        };

        let filteredData = filter === "available" ? allBookings : onboardBookings;

        // Apply sorting
        const sortedData = [...filteredData].sort((a, b) => {
            let comparison = 0;

            if (sortBy === "progression") {
                // Calculate remaining hours (most hours needed first)
                const getTotalRemainingHours = (data: ClassboardData) => {
                    const packageDuration = data.schoolPackage?.durationMinutes || 0;
                    const completedHours = (data.lessons || []).reduce((sum, lesson) => {
                        return (
                            sum +
                            (lesson.events || []).reduce((eventSum, event) => {
                                return event.status === "completed" ? eventSum + (event.duration || 0) : eventSum;
                            }, 0)
                        );
                    }, 0);
                    return packageDuration - completedHours;
                };
                comparison = getTotalRemainingHours(b) - getTotalRemainingHours(a);
            } else if (sortBy === "latest") {
                // Most recent event first
                const getLatestEventDate = (data: ClassboardData) => {
                    const allDates = (data.lessons || []).flatMap((lesson) => (lesson.events || []).map((event) => new Date(event.date || 0).getTime()));
                    return Math.max(...allDates, 0);
                };
                comparison = getLatestEventDate(b) - getLatestEventDate(a);
            } else if (sortBy === "newest") {
                // Newest booking first (by booking ID as proxy for creation time)
                comparison = b.booking.id.localeCompare(a.booking.id);
            }

            // If primary sort is equal, use event status as tiebreaker (non-event first)
            if (comparison === 0) {
                const aHasEvent = hasEvents(a);
                const bHasEvent = hasEvents(b);
                return aHasEvent === bHasEvent ? 0 : aHasEvent ? 1 : -1;
            }

            return comparison;
        });

        return { filteredBookings: sortedData, counts };
    }, [bookings, filter, sortBy]);

    return (
        <div className="flex flex-col h-full bg-card">
            {/* Header with Icon and Switch */}
            <div className="p-4 px-6 border-b-2 border-background bg-card flex items-center gap-4 cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors select-none" onClick={() => setIsExpanded(!isExpanded)}>
                <div style={{ color: STUDENT_COLOR }}>
                    <HelmetIcon className="w-7 h-7 flex-shrink-0" />
                </div>
                <span className="text-lg font-bold text-foreground">Students</span>
                <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {/* <FilterDropdown label="Sort" value={sortBy} options={["newest", "latest", "progression"] as const} onChange={(value) => handleSortChange(value as SortOption)} entityColor={STUDENT_COLOR} /> */}
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
                                {filteredBookings.map((bookingData) => {
                                    // Check if this booking has any events (bookings already filtered by date)
                                    const lessons = bookingData.lessons || [];
                                    const hasEventToday = lessons.some((lesson) => (lesson.events || []).length > 0);

                                    // For "available" filter: Show all bookings (regardless of on board status)
                                    if (filter === "available") {
                                        if (!hasEventToday) {
                                            return (
                                                <StudentBookingCard
                                                    key={bookingData.booking.id}
                                                    bookingData={bookingData}
                                                    bookingId={bookingData.booking.id}
                                                    classboard={classboard}
                                                />
                                            );
                                        } else {
                                            return (
                                                <BookingOnboardCard
                                                    key={bookingData.booking.id}
                                                    bookingData={bookingData}
                                                    onClick={() => toggleBookingExpanded(bookingData.booking.id)}
                                                />
                                            );
                                        }
                                    }

                                    // For "onboard" filter: Show StudentBookingCard for bookings WITH events
                                    if (filter === "onboard" && hasEventToday) {
                                        return (
                                            <StudentBookingCard
                                                key={bookingData.booking.id}
                                                bookingData={bookingData}
                                                bookingId={bookingData.booking.id}
                                                classboard={classboard}
                                            />
                                        );
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

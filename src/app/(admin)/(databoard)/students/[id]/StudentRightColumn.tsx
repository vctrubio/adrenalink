"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { StudentModel } from "@/backend/models";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { FullBookingCard } from "@/src/components/ids";
import { TimelineHeader, type EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import type { TimelineStats } from "@/types/timeline-stats";
import type { SortConfig, SortOption } from "@/types/sort";

// Main Component
interface StudentRightColumnProps {
    student: StudentModel;
}

const SORT_OPTIONS: SortOption[] = [
    { field: "createdAt", direction: "desc", label: "Newest" },
    { field: "createdAt", direction: "asc", label: "Oldest" },
    { field: "dateStart", direction: "desc", label: "Start Date" },
];

const FILTER_OPTIONS = ["All", "Active", "Completed", "Uncompleted"];

export function StudentRightColumn({ student }: StudentRightColumnProps) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";
    
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "dateStart", direction: "desc" });
    const [filter, setFilter] = useState<EventStatusFilter>("all");

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const bookingStudents = student.relations?.bookingStudents || [];

    // Filter and Sort Bookings
    const filteredBookingStudents = useMemo(() => {
        let result = [...bookingStudents];

        // Filter by status
        if (filter !== "all") {
            result = result.filter((bs) => bs.booking?.status === filter);
        }

        // Search filter
        if (search) {
            const query = search.toLowerCase();
            result = result.filter((bs) => {
                const leaderMatch = bs.booking?.leaderStudentName.toLowerCase().includes(query);
                const packageMatch = bs.booking?.studentPackage?.schoolPackage?.description.toLowerCase().includes(query);
                return leaderMatch || packageMatch;
            });
        }

        // Sort
        result.sort((a, b) => {
            let valA: number, valB: number;

            if (sort.field === "createdAt") {
                valA = new Date(a.booking?.createdAt || 0).getTime();
                valB = new Date(b.booking?.createdAt || 0).getTime();
            } else {
                // Default to dateStart
                valA = new Date(a.booking?.dateStart || 0).getTime();
                valB = new Date(b.booking?.dateStart || 0).getTime();
            }

            return sort.direction === "desc" ? valB - valA : valA - valB;
        });

        return result;
    }, [bookingStudents, filter, sort, search]);

    // Calculate Stats
    const stats: TimelineStats = useMemo(() => {
        let eventCount = 0;
        let totalDuration = 0;

        filteredBookingStudents.forEach((bs) => {
            const booking = bs.booking;
            if (!booking) return;

            const lessons = booking.lessons || [];
            eventCount += lessons.reduce((sum: number, lesson: any) => {
                return sum + (lesson.events?.length || 0);
            }, 0);
            totalDuration += lessons.reduce((sum: number, lesson: any) => {
                return sum + (lesson.events?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0);
            }, 0);
        });

        return {
            eventCount,
            totalDuration,
            totalCommission: 0, // Not calculated for this view
            totalRevenue: 0, // Not calculated for this view
            bookingCount: filteredBookingStudents.length,
        };
    }, [filteredBookingStudents]);

    if (bookingStudents.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No bookings found for this student
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <TimelineHeader
                search={search}
                onSearchChange={setSearch}
                sort={sort}
                onSortChange={setSort}
                filter={filter}
                onFilterChange={(v) => setFilter(v as EventStatusFilter)}
                stats={stats}
                currency={currency}
                formatCurrency={formatCurrency}
                showFinancials={false} // Don't show financial stats in header for now, focus on activity
                searchPlaceholder="Search bookings..."
                sortOptions={SORT_OPTIONS}
                filterOptions={FILTER_OPTIONS}
            />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {filteredBookingStudents.map((bs) => {
                    if (!bs.booking) return null;

                    return (
                        <FullBookingCard
                            key={bs.booking.id}
                            bookingData={bs.booking}
                            currency={currency}
                            formatCurrency={formatCurrency}
                        />
                    );
                })}
                {filteredBookingStudents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No bookings match your filters
                    </div>
                )}
            </motion.div>
        </div>
    );
}
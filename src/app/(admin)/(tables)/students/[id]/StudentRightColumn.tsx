"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { StudentData } from "@/backend/data/StudentData";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { FullBookingCard } from "@/src/components/ids";
import { TimelineHeader, type EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import type { SortConfig, SortOption } from "@/types/sort";

// Main Component
interface StudentRightColumnProps {
    student: StudentData;
}

const SORT_OPTIONS: SortOption[] = [
    { field: "created_at", direction: "desc", label: "Newest" },
    { field: "created_at", direction: "asc", label: "Oldest" },
    { field: "date_start", direction: "desc", label: "Start Date" },
];

const FILTER_OPTIONS = ["All", "Active", "Completed", "Uncompleted"];

export function StudentRightColumn({ student }: StudentRightColumnProps) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "date_start", direction: "desc" });
    const [filter, setFilter] = useState<EventStatusFilter>("all");

    const formatCurrency = (num: number): string => {
        const rounded = Math.round(num * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
    };

    const bookings = student.relations?.bookings || [];

    // Filter and Sort Bookings
    const filteredBookings = useMemo(() => {
        let result = [...bookings];

        // Filter by status
        if (filter !== "all") {
            result = result.filter((b) => b.status === filter);
        }

        // Search filter
        if (search) {
            const query = search.toLowerCase();
            result = result.filter((b) => {
                const leaderMatch = b.leader_student_name.toLowerCase().includes(query);
                const packageMatch = b.school_package?.description?.toLowerCase().includes(query);
                return leaderMatch || packageMatch;
            });
        }

        // Sort
        result.sort((a, b) => {
            let valA: number, valB: number;

            if (sort.field === "created_at") {
                valA = new Date(a.created_at || 0).getTime();
                valB = new Date(b.created_at || 0).getTime();
            } else {
                // Default to date_start
                valA = new Date(a.date_start || 0).getTime();
                valB = new Date(b.date_start || 0).getTime();
            }

            return sort.direction === "desc" ? valB - valA : valA - valB;
        });

        return result;
    }, [bookings, filter, sort, search]);

    if (bookings.length === 0) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground italic bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">No bookings found for this student</div>;
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
                searchPlaceholder="Search bookings..."
                sortOptions={SORT_OPTIONS}
                filterOptions={FILTER_OPTIONS}
            />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {filteredBookings.map((b) => {
                    return <FullBookingCard key={b.id} bookingData={b} currency={currency} formatCurrency={formatCurrency} />;
                })}
                {filteredBookings.length === 0 && <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-xl border border-border/50">No bookings match your filters</div>}
            </motion.div>
        </div>
    );
}
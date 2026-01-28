"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { StudentData } from "@/backend/data/StudentData";
import { type EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import type { SortConfig, SortOption } from "@/types/sort";
import { StudentBookingActivityCard } from "../StudentBookingActivityCard";
import { TeacherBookingLessonTable } from "@/src/components/ids/TeacherBookingLessonTable";
import { transactionEventToTimelineEvent } from "@/getters/booking-lesson-event-getter"; // Only need this for timeline conversion
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { Timeline } from "@/src/components/timeline";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import { SearchInput } from "@/src/components/SearchInput";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { ENTITY_DATA } from "@/config/entities";
import { Calendar, List } from "lucide-react";
import { safeArray } from "@/backend/error-handlers";

type ViewMode = "timeline" | "by-lessons" | "by-bookings";

// Main Component
interface StudentRightColumnProps {
    student: StudentData;
}

const EVENT_SORT_OPTIONS: SortOption[] = [
    { field: "date", direction: "desc", label: "Newest" },
    { field: "date", direction: "asc", label: "Oldest" },
];

const BOOKING_SORT_OPTIONS: SortOption[] = [
    { field: "date_start", direction: "desc", label: "Start Date (Newest)" },
    { field: "date_start", direction: "asc", label: "Start Date (Oldest)" },
];

const EVENT_FILTER_OPTIONS = ["All", "planned", "completed", "tbc", "uncompleted"] as const;
const BOOKING_FILTER_OPTIONS = ["All", "active", "completed", "cancelled"] as const;

const VIEW_MODE_OPTIONS = [
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "by-lessons", label: "By Lessons", icon: List },
    { id: "by-bookings", label: "By Bookings", icon: List },
] as const;

export function StudentRightColumn({ student }: StudentRightColumnProps) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "date", direction: "desc" });
    const [filter, setFilter] = useState<EventStatusFilter>("all");
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const formatCurrency = (num: number) => `${num.toFixed(2)} ${currency}`;

    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    // Directly use pre-computed transactions and lessonRows from student.data
    const allTransactions = student.transactions || [];
    const allLessonRows = student.lessonRows || [];
    const allBookings = student.bookings || [];

    const handleEquipmentUpdate = useCallback((eventId: string, equipment: any) => {
        router.refresh();
    }, [router]);

    const handleViewModeChange = useCallback((newMode: string) => {
        setViewMode(newMode as ViewMode);
        setExpandedLesson(null);
        // Reset sort and filter to appropriate defaults for the new view
        if (newMode === "timeline") {
            setSort({ field: "date", direction: "desc" });
            setFilter("all");
        } else if (newMode === "by-lessons" || newMode === "by-bookings") {
            setSort({ field: "date_start", direction: "desc" });
            setFilter("all");
        }
    }, []);

    // Filter events by search and status for timeline view
    const filteredEvents = useMemo(() => {
        let filtered = allTransactions;
        if (filter !== "all") {
            filtered = filtered.filter((event) => event.event.status === filter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (event) =>
                    event.booking.leaderStudentName.toLowerCase().includes(query) ||
                    event.event.location?.toLowerCase().includes(query) ||
                    event.teacher.username.toLowerCase().includes(query),
            );
        }
        return filtered;
    }, [allTransactions, searchQuery, filter]);

    // Sort events
    const sortedEvents = useMemo(() => {
        const sorted = [...filteredEvents];
        sorted.sort((a, b) => {
            let aValue: any;
            let bValue: any;
            switch (sort.field) {
                case "date":
                    aValue = new Date(a.event.date).getTime();
                    bValue = new Date(b.event.date).getTime();
                    break;
                case "duration":
                    aValue = a.event.duration;
                    bValue = b.event.duration;
                    break;
                default:
                    aValue = new Date(a.event.date).getTime();
                    bValue = new Date(b.event.date).getTime();
            }
            if (sort.direction === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        return sorted;
    }, [filteredEvents, sort]);

    // Adapt TransactionEventData to TimelineEvent for timeline view
    const timelineEvents = useMemo(() => {
        return sortedEvents.map(transactionEventToTimelineEvent);
    }, [sortedEvents]);

    // Filter and sort lessonRows for By Lessons view
    const filteredLessonRows = useMemo(() => {
        let result = [...allLessonRows];

        // Filter by status (lesson status)
        if (filter !== "all") {
            result = result.filter((l) => l.lessonStatus === filter);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((l) => {
                const leaderMatch = l.leaderName?.toLowerCase().includes(query);
                return leaderMatch;
            });
        }

        // Sort
        result.sort((a, b) => {
            let valA: number, valB: number;

            if (sort.field === "date_start") {
                valA = new Date(a.dateStart || 0).getTime();
                valB = new Date(b.dateStart || 0).getTime();
            } else {
                valA = new Date(a.dateStart || 0).getTime();
                valB = new Date(b.dateStart || 0).getTime();
            }

            return sort.direction === "desc" ? valB - valA : valA - valB;
        });

        return result;
    }, [allLessonRows, searchQuery, filter, sort]);

    // Filter and sort bookings for By Bookings view
    const filteredBookings = useMemo(() => {
        let result = [...allBookings];

        // Filter by status (booking status)
        if (filter !== "all") {
            result = result.filter((b) => b.status === filter);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((b) => {
                const packageMatch = b.packageName?.toLowerCase().includes(query);
                return packageMatch;
            });
        }

        // Sort
        result.sort((a, b) => {
            let valA: number, valB: number;

            if (sort.field === "date_start") {
                valA = new Date(a.dateStart || 0).getTime();
                valB = new Date(b.dateStart || 0).getTime();
            } else {
                valA = new Date(a.dateStart || 0).getTime();
                valB = new Date(b.dateStart || 0).getTime();
            }

            return sort.direction === "desc" ? valB - valA : valA - valB;
        });

        return result;
    }, [allBookings, searchQuery, filter, sort]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-64">
                    <SearchInput
                        placeholder={
                            viewMode === "timeline"
                                ? "Search by teacher, location, or leader..."
                                : viewMode === "by-lessons"
                                  ? "Search lessons by leader..."
                                  : "Search bookings by package..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        entityColor={studentEntity.color}
                    />
                </div>
                <SortDropdown
                    value={sort}
                    options={viewMode === "timeline" ? EVENT_SORT_OPTIONS : BOOKING_SORT_OPTIONS}
                    onChange={setSort}
                    entityColor={studentEntity.color}
                    toggleMode={true}
                />
                <FilterDropdown
                    label="Status"
                    value={filter === "all" ? "All" : filter}
                    options={viewMode === "timeline" ? [...EVENT_FILTER_OPTIONS] : [...BOOKING_FILTER_OPTIONS]}
                    onChange={(value) => setFilter(value === "All" ? "all" : (value as EventStatusFilter))}
                    entityColor={studentEntity.color}
                />
            </div>

            <ToggleBar value={viewMode} onChange={handleViewModeChange} options={VIEW_MODE_OPTIONS} />

            <AnimatePresence mode="wait">
                {viewMode === "timeline" && (
                    <Timeline
                        events={timelineEvents}
                        currency={currency}
                        formatCurrency={formatCurrency}
                        showTeacher={true}
                        showFinancials={true}
                        onEquipmentUpdate={handleEquipmentUpdate}
                    />
                )}
                {viewMode === "by-lessons" && (
                    <motion.div
                        key="by-lessons"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {filteredLessonRows.map((lesson) => (
                            <TeacherBookingLessonTable
                                key={lesson.lessonId}
                                lesson={lesson}
                                isExpanded={expandedLesson === lesson.lessonId}
                                onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)}
                                currency={currency}
                                onEquipmentUpdate={handleEquipmentUpdate}
                            />
                        ))}
                        {filteredLessonRows.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-xl border border-border/50">
                                No lessons match your filters
                            </div>
                        )}
                    </motion.div>
                )}
                {viewMode === "by-bookings" && (
                    <motion.div
                        key="by-bookings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {filteredBookings.map((booking) => (
                            <StudentBookingActivityCard key={booking.id} booking={booking} stats={booking.stats} />
                        ))}
                        {filteredBookings.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-xl border border-border/50">
                                No bookings match your filters
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

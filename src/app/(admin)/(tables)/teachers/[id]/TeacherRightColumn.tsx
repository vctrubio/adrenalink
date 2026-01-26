"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { TeacherData } from "@/backend/data/TeacherData";
import {
    lessonsToTransactionEvents,
    groupTransactionsByLesson,
    transactionEventToTimelineEvent,
} from "@/getters/booking-lesson-event-getter";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { Timeline } from "@/src/components/timeline";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import { SearchInput } from "@/src/components/SearchInput";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import type { SortConfig, SortOption } from "@/types/sort";
import type { EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import { LESSON_STATUS_CONFIG, type LessonStatus } from "@/types/status";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { Calendar, List } from "lucide-react";
import { TeacherBookingLessonTable } from "@/src/components/ids";
import { CommissionsView } from "@/src/components/teacher/CommissionsView";
import { safeArray } from "@/backend/error-handlers";

type ViewMode = "lessons" | "timeline" | "commissions";
type StatusFilter = EventStatusFilter | LessonStatus | "fixed" | "percentage" | "all";

const SORT_OPTIONS: SortOption[] = [
    { field: "date", direction: "desc", label: "Newest" },
    { field: "date", direction: "asc", label: "Oldest" },
];

// Event status filter options
const EVENT_FILTER_OPTIONS = ["All", "planned", "completed", "tbc", "uncompleted"] as const;

// Lesson status filter options
const LESSON_FILTER_OPTIONS = ["All", ...Object.values(LESSON_STATUS_CONFIG).map((config) => config.status)] as const;

// Commission type filter options
const COMMISSION_FILTER_OPTIONS = ["All", "fixed", "percentage"] as const;

const VIEW_MODE_OPTIONS = [
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "lessons", label: "By Lesson", icon: List },
    { id: "commissions", label: "By Commission", icon: HandshakeIcon },
] as const;

// Sub-component: Lessons View
export function LessonsView({
    lessonRows,
    expandedLesson,
    setExpandedLesson,
    currency,
    teacherId,
    teacherUsername,
    onEquipmentUpdate,
}: {
    lessonRows: any[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    currency: string;
    teacherId?: string;
    teacherUsername?: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
}) {
    return (
        <motion.div
            key="lessons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
        >
            {lessonRows.map((lesson) => (
                <TeacherBookingLessonTable
                    key={lesson.lessonId}
                    lesson={lesson}
                    isExpanded={expandedLesson === lesson.lessonId}
                    onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)}
                    currency={currency}
                    teacherId={teacherId}
                    teacherUsername={teacherUsername}
                    onEquipmentUpdate={onEquipmentUpdate}
                    headerStats={{
                        bookingStatus: lesson.bookingStatus,
                        lessonStatus: lesson.lessonStatus,
                        totalRevenue: lesson.totalRevenue || 0,
                        totalPayments: lesson.totalPayments || 0,
                        currency,
                    }}
                />
            ))}
        </motion.div>
    );
}

// Main Component
interface TeacherRightColumnProps {
    teacher: TeacherData;
}

export function TeacherRightColumn({ teacher }: TeacherRightColumnProps) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "date", direction: "desc" });
    const [filter, setFilter] = useState<StatusFilter>("all");
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    // Reset filter when view mode changes
    const handleViewModeChange = useCallback((mode: string) => {
        setViewMode(mode as ViewMode);
        setFilter("all");
    }, []);

    // Get filter options based on view mode
    const filterOptions = useMemo(() => {
        switch (viewMode) {
            case "timeline":
                return EVENT_FILTER_OPTIONS;
            case "lessons":
                return LESSON_FILTER_OPTIONS;
            case "commissions":
                return COMMISSION_FILTER_OPTIONS;
            default:
                return EVENT_FILTER_OPTIONS;
        }
    }, [viewMode]);

    // Get filter label based on view mode
    const filterLabel = useMemo(() => {
        switch (viewMode) {
            case "timeline":
                return "Event Status";
            case "lessons":
                return "Lesson Status";
            case "commissions":
                return "Commission Type";
            default:
                return "Status";
        }
    }, [viewMode]);

    const formatCurrency = (num: number) => `${num.toFixed(2)} ${currency}`;

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    // Single source of truth: Use the unified getter
    const transactionEvents = useMemo(() => {
        return lessonsToTransactionEvents(teacher.relations?.lesson || [], currency);
    }, [teacher.relations?.lesson, currency]);

    // Handle equipment assignment and status update, then revalidate
    const handleEquipmentUpdate = useCallback(
        (eventId: string, equipment: any) => {
            router.refresh();
        },
        [router],
    );

    // Filter events by search and status (for timeline view)
    const filteredEvents = useMemo(() => {
        let filtered = transactionEvents;
        if (viewMode === "timeline" && filter !== "all") {
            filtered = filtered.filter((tx) => tx.event.status === filter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (tx) =>
                    tx.booking.leaderStudentName.toLowerCase().includes(query) ||
                    tx.event.location?.toLowerCase().includes(query) ||
                    tx.teacher.username.toLowerCase().includes(query),
            );
        }
        return filtered;
    }, [transactionEvents, searchQuery, filter, viewMode]);

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

    // Build lesson rows from pre-computed transactions
    const lessonRows = useMemo(() => {
        // Map payments for grouping
        const lessonPaymentsMap: Record<string, number> = {};
        safeArray(teacher.relations?.lesson).forEach((l) => {
            lessonPaymentsMap[l.id] = safeArray(l.teacher_lesson_payment).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        });

        let rows = groupTransactionsByLesson(transactionEvents, lessonPaymentsMap);

        // Apply filters
        if (viewMode === "lessons" && filter !== "all") {
            rows = rows.filter((row) => row.lessonStatus === filter);
        } else if (viewMode === "commissions" && filter !== "all") {
            rows = rows.filter((row) => row.commissionType === filter);
        }

        // Apply search query to grouped rows
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            rows = rows.filter((row) => row.leaderName.toLowerCase().includes(query) || row.lessonId.toLowerCase().includes(query));
        }

        return rows;
    }, [transactionEvents, teacher.relations?.lesson, viewMode, filter, searchQuery]);

    // Adapt TransactionEventData to TimelineEvent for timeline view
    const timelineEvents = useMemo(() => {
        return sortedEvents.map(transactionEventToTimelineEvent);
    }, [sortedEvents]);

    const hasNoLessons = (teacher.relations?.lesson || []).length === 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-64">
                    <SearchInput
                        placeholder="Search by leader name or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        entityColor={teacherEntity.color}
                    />
                </div>
                <SortDropdown
                    value={sort}
                    options={SORT_OPTIONS}
                    onChange={setSort}
                    entityColor={teacherEntity.color}
                    toggleMode={true}
                />
                <FilterDropdown
                    label={filterLabel}
                    value={filter === "all" ? "All" : filter}
                    options={[...filterOptions]}
                    onChange={(value) => setFilter(value === "All" ? "all" : (value as StatusFilter))}
                    entityColor={teacherEntity.color}
                />
            </div>

            <ToggleBar value={viewMode} onChange={handleViewModeChange} options={VIEW_MODE_OPTIONS} />

            {hasNoLessons ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground italic bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                    No lessons found for this teacher
                </div>
            ) : lessonRows.length === 0 && viewMode !== "timeline" ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground italic bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                    No lessons match your search or filter criteria
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {viewMode === "lessons" && (
                        <LessonsView
                            lessonRows={lessonRows}
                            expandedLesson={expandedLesson}
                            setExpandedLesson={setExpandedLesson}
                            currency={currency}
                            teacherId={teacher.schema.id}
                            teacherUsername={teacher.schema.username}
                            onEquipmentUpdate={handleEquipmentUpdate}
                        />
                    )}
                    {viewMode === "commissions" && (
                        <CommissionsView
                            lessonRows={lessonRows}
                            expandedLesson={expandedLesson}
                            setExpandedLesson={setExpandedLesson}
                            currency={currency}
                            teacherId={teacher.schema.id}
                            teacherUsername={teacher.schema.username}
                            onEquipmentUpdate={handleEquipmentUpdate}
                        />
                    )}
                    {viewMode === "timeline" && (
                        <Timeline
                            events={timelineEvents}
                            currency={currency}
                            formatCurrency={formatCurrency}
                            showTeacher={false}
                            showFinancials={true}
                            teacherId={teacher.schema.id}
                            teacherUsername={teacher.schema.username}
                            onEquipmentUpdate={handleEquipmentUpdate}
                        />
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}

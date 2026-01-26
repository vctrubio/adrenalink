"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { TeacherData } from "@/backend/data/TeacherData";
import { type LessonRow } from "@/backend/data/TeacherLessonData";
import { lessonsToTransactionEvents, transactionEventToTimelineEvent } from "@/getters/transaction-event-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { TransactionEventData } from "@/types/transaction-event";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { Timeline } from "@/src/components/timeline";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import { SearchInput } from "@/src/components/SearchInput";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import type { SortConfig, SortOption } from "@/types/sort";
import type { EventStatusFilter } from "@/src/components/timeline/TimelineHeader";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { Calendar, List } from "lucide-react";
import { TeacherLessonCard, TeacherBookingLessonTable } from "@/src/components/ids";
import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";
import { getHMDuration } from "@/getters/duration-getter";
import { StatItemUI } from "@/backend/data/StatsData";
import { CommissionsView } from "@/src/components/teacher/CommissionsView";

type ViewMode = "lessons" | "timeline" | "commissions";

const SORT_OPTIONS: SortOption[] = [
    { field: "date", direction: "desc", label: "Newest" },
    { field: "date", direction: "asc", label: "Oldest" },
];

const FILTER_OPTIONS = ["All", "planned", "completed", "tbc", "uncompleted"] as const;

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
    lessonRows: LessonRow[];
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
    const [filter, setFilter] = useState<EventStatusFilter>("all");
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    const formatCurrency = (num: number) => `${num.toFixed(2)} ${currency}`;

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    // Use standardized snake_case relation
    const lessons = teacher.relations?.lesson || [];

    // Single source of truth: Transform lessons to TransactionEventData once
    const transactionEvents = useMemo(() => {
        return lessonsToTransactionEvents(lessons, currency);
    }, [lessons, currency]);

    // Handle equipment assignment and status update, then revalidate
    const handleEquipmentUpdate = useCallback(
        (eventId: string, equipment: any) => {
            router.refresh();
        },
        [router],
    );

    // Filter events by search and status
    const filteredEvents = useMemo(() => {
        let filtered = transactionEvents;
        if (filter !== "all") {
            filtered = filtered.filter((event) => event.event.status === filter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (event) =>
                    event.leaderStudentName.toLowerCase().includes(query) ||
                    event.event.location?.toLowerCase().includes(query) ||
                    event.teacher.username.toLowerCase().includes(query),
            );
        }
        return filtered;
    }, [transactionEvents, searchQuery, filter]);

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

    // Build lesson rows from lessons + filtered events
    const lessonRows: LessonRow[] = useMemo(() => {
        return lessons
            .map((lesson: any) => {
                const lessonEvents = sortedEvents.filter((event) => event.event.lessonId === lesson.id);

                if (lessonEvents.length === 0) return null;

                const booking = lesson.booking;
                const commission = lesson.teacher_commission;
                const totalDuration = lessonEvents.reduce((sum, e) => sum + e.event.duration, 0);
                const totalHours = totalDuration / 60;
                const totalEarning = lessonEvents.reduce((sum, e) => sum + e.financials.teacherEarnings, 0);
                const totalRevenue = lessonEvents.reduce((sum, e) => sum + e.financials.studentRevenue, 0);
                // Calculate actual teacher payments from teacher_lesson_payment
                const totalPayments = (lesson.teacher_lesson_payment || []).reduce(
                    (sum: number, p: any) => sum + (p.amount || 0),
                    0
                );

                return {
                    lessonId: lesson.id,
                    bookingId: booking?.id || "",
                    leaderName: booking?.leader_student_name || "",
                    dateStart: booking?.date_start || "",
                    dateEnd: booking?.date_end || "",
                    lessonStatus: lesson.status || "",
                    bookingStatus: booking?.status || "",
                    commissionType: (commission?.commission_type as "fixed" | "percentage") || "fixed",
                    cph: commission ? parseFloat(commission.cph) : 0,
                    commissionDescription: commission?.description || null,
                    totalDuration,
                    totalHours,
                    totalEarning,
                    totalRevenue,
                    totalPayments,
                    eventCount: lessonEvents.length,
                    events: lessonEvents.map(transactionEventToTimelineEvent),
                    equipmentCategory: lessonEvents[0]?.packageData.categoryEquipment || "",
                    studentCapacity: lessonEvents[0]?.packageData.capacityStudents || 0,
                };
            })
            .filter((row): row is LessonRow => row !== null);
    }, [lessons, sortedEvents]);

    // Adapt TransactionEventData to TimelineEvent for timeline view
    const timelineEvents = useMemo(() => {
        return sortedEvents.map(transactionEventToTimelineEvent);
    }, [sortedEvents]);

    if (lessonRows.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground italic bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                No lessons found for this teacher
            </div>
        );
    }

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
                    label="Status"
                    value={filter === "all" ? "All" : filter}
                    options={[...FILTER_OPTIONS]}
                    onChange={(value) => setFilter(value === "All" ? "all" : (value as EventStatusFilter))}
                    entityColor={teacherEntity.color}
                />
            </div>

            <ToggleBar value={viewMode} onChange={(v) => setViewMode(v as ViewMode)} options={VIEW_MODE_OPTIONS} />

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
        </div>
    );
}

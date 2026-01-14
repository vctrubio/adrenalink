"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { TeacherData } from "@/backend/data/TeacherData";
import { type LessonRow } from "@/backend/data/TeacherLessonData";
import { buildEventModels, groupEventsByLesson, groupLessonsByCommission, eventModelToTimelineEvent, filterEvents, sortEvents, type EventModel, type LessonGroup, type CommissionGroup } from "@/backend/data/EventModel";
import { ENTITY_DATA } from "@/config/entities";
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

// Sub-component: Commission Header
function CommissionHeader({ commission, formatCurrency }: { commission: CommissionGroup; formatCurrency: (num: number) => string }) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    return (
        <div className="flex items-center justify-between py-3 border-b border-border/40">
            <div className="flex items-center gap-3">
                <TeacherLessonComissionValue commissionType={commission.type} cph={commission.cph} currency={currency} />
            </div>
            <div className="flex items-center gap-x-6 gap-y-2 opacity-80">
                <StatItemUI type="lessons" value={commission.lessonCount} hideLabel={false} iconColor={false} />
                <StatItemUI type="duration" value={commission.hours * 60} hideLabel={false} iconColor={false} />
                <StatItemUI type="commission" value={commission.earning} hideLabel={false} variant="primary" iconColor={false} />
            </div>
        </div>
    );
}

// Sub-component: Commissions View
function CommissionsView({
    lessonGroups,
    expandedLesson,
    setExpandedLesson,
    formatCurrency,
    bookingEntity,
    studentEntity,
    teacherId,
    teacherUsername,
    onEquipmentUpdate,
}: {
    lessonGroups: LessonGroup[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    formatCurrency: (num: number) => string;
    bookingEntity: any;
    studentEntity: any;
    teacherId?: string;
    teacherUsername?: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
}) {
    // Group lessons by commission using centralized function
    const commissionGroups = groupLessonsByCommission(lessonGroups);

    return (
        <motion.div
            key="commissions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            {commissionGroups.map((commission, idx) => (
                <div key={idx} className="space-y-2">
                    <CommissionHeader commission={commission} formatCurrency={formatCurrency} />
                    <div className="space-y-3">
                        {commission.lessons.map((lesson) => {
                            // Convert LessonGroup to LessonRow format for TeacherBookingLessonTable
                            const lessonRow: LessonRow = {
                                lessonId: lesson.lessonId,
                                bookingId: lesson.bookingId,
                                leaderName: lesson.leaderName,
                                dateStart: lesson.dateStart,
                                dateEnd: lesson.dateEnd,
                                lessonStatus: lesson.lessonStatus,
                                bookingStatus: lesson.bookingStatus,
                                commissionType: lesson.commissionType,
                                cph: lesson.cph,
                                totalDuration: lesson.totalDuration,
                                totalHours: lesson.totalHours,
                                totalEarning: lesson.totalEarning,
                                eventCount: lesson.eventCount,
                                events: lesson.events,
                                equipmentCategory: lesson.equipmentCategory,
                                studentCapacity: lesson.studentCapacity,
                            };
                            return (
                                <TeacherBookingLessonTable
                                    key={lesson.lessonId}
                                    lesson={lessonRow}
                                    isExpanded={expandedLesson === lesson.lessonId}
                                    onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)}
                                    bookingEntity={bookingEntity}
                                    studentEntity={studentEntity}
                                    teacherId={teacherId}
                                    teacherUsername={teacherUsername}
                                    onEquipmentUpdate={onEquipmentUpdate}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

// Sub-component: Lessons View
export function LessonsView({
    lessonRows,
    expandedLesson,
    setExpandedLesson,
    bookingEntity,
    studentEntity,
    teacherId,
    teacherUsername,
    onEquipmentUpdate,
}: {
    lessonRows: LessonRow[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    bookingEntity: any;
    studentEntity: any;
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
                    bookingEntity={bookingEntity}
                    studentEntity={studentEntity}
                    teacherId={teacherId}
                    teacherUsername={teacherUsername}
                    onEquipmentUpdate={onEquipmentUpdate}
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

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    // Use standardized snake_case relation
    const lessons = teacher.relations?.lesson || [];

    // Build centralized event models (single source of truth)
    const eventModels = useMemo(() => {
        return buildEventModels(lessons, {
            id: teacher.schema.id,
            first_name: teacher.schema.first_name,
            username: teacher.schema.username,
        });
    }, [lessons, teacher.schema.id, teacher.schema.first_name, teacher.schema.username]);

    // Handle equipment assignment and status update, then revalidate
    const handleEquipmentUpdate = useCallback((eventId: string, equipment: any) => {
        // Revalidate the page to refresh data
        router.refresh();
    }, [router]);

    // Apply global search/filter to events (single source of truth)
    const filteredEvents = useMemo(() => {
        return filterEvents(eventModels, searchQuery, filter);
    }, [eventModels, searchQuery, filter]);

    // Apply sort to events
    const sortedEvents = useMemo(() => {
        return sortEvents(filteredEvents, { field: sort.field || "date", direction: sort.direction });
    }, [filteredEvents, sort]);

    // Group events by lesson for lessons view
    const lessonGroups = useMemo(() => {
        return groupEventsByLesson(sortedEvents);
    }, [sortedEvents]);

    // Convert lesson groups to legacy LessonRow format for backward compatibility
    const lessonRows: LessonRow[] = useMemo(() => {
        return lessonGroups.map((group) => ({
            lessonId: group.lessonId,
            bookingId: group.bookingId,
            leaderName: group.leaderName,
            dateStart: group.dateStart,
            dateEnd: group.dateEnd,
            lessonStatus: group.lessonStatus,
            bookingStatus: group.bookingStatus,
            commissionType: group.commissionType,
            cph: group.cph,
            totalDuration: group.totalDuration,
            totalHours: group.totalHours,
            totalEarning: group.totalEarning,
            eventCount: group.eventCount,
            events: group.events,
            equipmentCategory: group.equipmentCategory,
            studentCapacity: group.studentCapacity,
        }));
    }, [lessonGroups]);

    // Convert events to timeline format
    const timelineEvents = useMemo(() => {
        return sortedEvents.map(eventModelToTimelineEvent);
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
                        bookingEntity={bookingEntity}
                        studentEntity={studentEntity}
                        teacherId={teacher.schema.id}
                        teacherUsername={teacher.schema.username}
                        onEquipmentUpdate={handleEquipmentUpdate}
                    />
                )}
                {viewMode === "commissions" && (
                    <CommissionsView
                        lessonGroups={lessonGroups}
                        expandedLesson={expandedLesson}
                        setExpandedLesson={setExpandedLesson}
                        formatCurrency={formatCurrency}
                        bookingEntity={bookingEntity}
                        studentEntity={studentEntity}
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

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TeacherData } from "@/backend/data/TeacherData";
import { buildTeacherLessonData, filterTeacherLessonData, type LessonRow } from "@/backend/data/TeacherLessonData";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { Timeline } from "@/src/components/timeline";
import { ToggleBar } from "@/src/components/ui/ToggleBar";
import { SearchInput } from "@/src/components/SearchInput";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import type { EventStatusFilter } from "@/types/status";
import type { SortConfig } from "@/types/sort";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { Calendar, List } from "lucide-react";
import { TeacherLessonCard, TeacherBookingLessonTable } from "@/src/components/ids";
import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";
import { getHMDuration } from "@/getters/duration-getter";

type ViewMode = "lessons" | "timeline" | "commissions";

const SORT_OPTIONS = [
    { field: "date", direction: "desc", label: "Newest" },
    { field: "date", direction: "asc", label: "Oldest" },
] as const;

const FILTER_OPTIONS = ["All", "planned", "completed", "tbc", "uncompleted"] as const;

const VIEW_MODE_OPTIONS = [
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "lessons", label: "By Lesson", icon: List },
    { id: "commissions", label: "By Commission", icon: HandshakeIcon },
] as const;

// Sub-component: Commission Header
interface CommissionStats {
    type: string;
    hours: number;
    earning: number;
    lessonCount: number;
    cph: number;
}

function CommissionHeader({ commission, formatCurrency }: { commission: CommissionStats; formatCurrency: (num: number) => string }) {
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    return (
        <div className="rounded-lg bg-muted/30 border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TeacherLessonComissionValue commissionType={commission.type} cph={commission.cph} currency={currency} />
                    <span className="text-sm font-semibold text-muted-foreground capitalize">
                        {commission.type === "fixed" ? "Fixed" : "Percentage"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FlagIcon size={14} />
                    <span>{commission.lessonCount} lessons</span>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DurationIcon size={14} />
                    <span className="font-medium">{getHMDuration(commission.hours * 60)}</span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(Math.round(commission.earning * 100) / 100)}
                </span>
            </div>
        </div>
    );
}

// Sub-component: Commissions View
function CommissionsView({
    lessonRows,
    expandedLesson,
    setExpandedLesson,
    formatCurrency,
}: {
    lessonRows: LessonRow[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    formatCurrency: (num: number) => string;
}) {
    // Group lessons by unique commission rate (type + cph)
    const commissionGroups = lessonRows.reduce(
        (acc, lesson) => {
            const key = `${lesson.commissionType}-${lesson.cph}`;
            if (!acc[key]) {
                acc[key] = {
                    type: lesson.commissionType,
                    hours: 0,
                    earning: 0,
                    cph: lesson.cph,
                    lessons: [] as LessonRow[],
                    lessonCount: 0,
                };
            }
            acc[key].hours += lesson.totalHours;
            acc[key].earning += lesson.totalEarning;
            acc[key].lessons.push(lesson);
            acc[key].lessonCount += 1;
            return acc;
        },
        {} as Record<string, CommissionStats & { lessons: LessonRow[] }>,
    );

    const commissionArray = Object.values(commissionGroups).sort((a, b) => b.earning - a.earning);

    return (
        <motion.div
            key="commissions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            {commissionArray.map((commission, idx) => (
                <div key={idx} className="space-y-2">
                    <CommissionHeader commission={commission} formatCurrency={formatCurrency} />
                    <div className="space-y-2">
                        {commission.lessons.map((lesson) => (
                            <TeacherLessonCard
                                key={lesson.lessonId}
                                lesson={lesson}
                                isExpanded={expandedLesson === lesson.lessonId}
                                onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

// Sub-component: Lessons View
function LessonsView({
    lessonRows,
    expandedLesson,
    setExpandedLesson,
    bookingEntity,
    studentEntity,
}: {
    lessonRows: LessonRow[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    bookingEntity: any;
    studentEntity: any;
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

    // Build lesson rows and timeline events from lessons data
    const { lessonRows, timelineEvents } = buildTeacherLessonData(lessons, {
        id: teacher.schema.id,
        first_name: teacher.schema.first_name,
        username: teacher.schema.username,
    });

    // Apply global search/filter across all view modes
    const { filteredLessonRows, filteredTimelineEvents } = filterTeacherLessonData(lessonRows, timelineEvents, searchQuery, filter);

    // Apply sort to timeline events
    const sortedTimelineEvents = useMemo(() => {
        const result = [...filteredTimelineEvents];

        result.sort((a, b) => {
            let valA: number, valB: number;

            if (sort.field === "date") {
                valA = a.date.getTime();
                valB = b.date.getTime();
            } else {
                // Default to date
                valA = a.date.getTime();
                valB = b.date.getTime();
            }

            return sort.direction === "desc" ? valB - valA : valA - valB;
        });

        return result;
    }, [filteredTimelineEvents, sort]);

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
                        lessonRows={filteredLessonRows}
                        expandedLesson={expandedLesson}
                        setExpandedLesson={setExpandedLesson}
                        bookingEntity={bookingEntity}
                        studentEntity={studentEntity}
                    />
                )}
                {viewMode === "commissions" && (
                    <CommissionsView
                        lessonRows={filteredLessonRows}
                        expandedLesson={expandedLesson}
                        setExpandedLesson={setExpandedLesson}
                        formatCurrency={formatCurrency}
                    />
                )}
                {viewMode === "timeline" && (
                    <Timeline
                        events={sortedTimelineEvents}
                        currency={currency}
                        formatCurrency={formatCurrency}
                        showTeacher={false}
                        showFinancials={true}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

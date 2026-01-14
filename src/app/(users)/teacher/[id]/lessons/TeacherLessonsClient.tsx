"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type TeacherData } from "@/backend/data/TeacherData";
import { buildEventModels, groupEventsByLesson, sortEvents, filterEvents } from "@/backend/data/EventModel";
import { ENTITY_DATA } from "@/config/entities";
import { TeacherBookingLessonTable } from "@/src/components/ids/TeacherBookingLessonTable";
import { type LessonRow } from "@/backend/data/TeacherLessonData";
import { SearchInput } from "@/src/components/SearchInput";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import type { SortConfig, SortOption } from "@/types/sort";
import type { EventStatusFilter } from "@/src/components/timeline/TimelineHeader";

interface TeacherLessonsClientProps {
    teacher: TeacherData;
    currency: string;
}

const SORT_OPTIONS: SortOption[] = [
    { field: "date", direction: "desc", label: "Newest" },
    { field: "date", direction: "asc", label: "Oldest" },
];

const FILTER_OPTIONS = ["All", "planned", "completed", "tbc", "uncompleted"] as const;

export function TeacherLessonsClient({ teacher, currency }: TeacherLessonsClientProps) {
    const router = useRouter();
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "date", direction: "desc" });
    const [filter, setFilter] = useState<EventStatusFilter>("all");

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    // Build event models
    const eventModels = useMemo(() => {
        const lessons = teacher.relations?.lesson || [];
        return buildEventModels(lessons, {
            id: teacher.schema.id,
            first_name: teacher.schema.first_name,
            username: teacher.schema.username,
        });
    }, [teacher]);

    // Handle equipment update
    const handleEquipmentUpdate = useCallback((eventId: string, equipment: any) => {
        router.refresh();
    }, [router]);

    // Filter and Sort
    const filteredEvents = useMemo(() => {
        return filterEvents(eventModels, searchQuery, filter);
    }, [eventModels, searchQuery, filter]);

    const sortedEvents = useMemo(() => {
        return sortEvents(filteredEvents, { field: sort.field || "date", direction: sort.direction });
    }, [filteredEvents, sort]);

    // Group by lesson
    const lessonGroups = useMemo(() => {
        return groupEventsByLesson(sortedEvents);
    }, [sortedEvents]);

    // Convert to LessonRow
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">My Lessons</h2>
            </div>

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

            <div className="space-y-3">
                {lessonRows.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                        No lessons found.
                    </div>
                ) : (
                    lessonRows.map((lesson) => (
                        <TeacherBookingLessonTable
                            key={lesson.lessonId}
                            lesson={lesson}
                            isExpanded={expandedLesson === lesson.lessonId}
                            onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)}
                            bookingEntity={bookingEntity}
                            studentEntity={studentEntity}
                            teacherId={teacher.schema.id}
                            teacherUsername={teacher.schema.username}
                            onEquipmentUpdate={handleEquipmentUpdate}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

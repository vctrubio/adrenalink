"use client";

import { useState, useMemo } from "react";
import { useTeacherUser } from "@/src/providers/teacher-user-provider";
import { TeacherBookingLessonTable } from "@/src/components/ids";
import { SearchInput } from "@/src/components/SearchInput";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { ENTITY_DATA } from "@/config/entities";
import type { SortConfig } from "@/types/sort";
import { LESSON_STATUS_CONFIG, type LessonStatus } from "@/types/status";

const SORT_OPTIONS = [
    { field: "date", direction: "desc" as const, label: "Newest" },
    { field: "date", direction: "asc" as const, label: "Oldest" },
];

// Get lesson status options with labels from config
const LESSON_STATUS_OPTIONS = Object.values(LESSON_STATUS_CONFIG).map((config) => config.status);
const FILTER_OPTIONS = ["All", ...LESSON_STATUS_OPTIONS] as const;

export function TeacherLessonsClient() {
    const { data: teacherUser, schoolHeader } = useTeacherUser();
    const currency = schoolHeader?.currency || "YEN";
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: "date", direction: "desc" });
    const [filter, setFilter] = useState<string>("All");
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    // Filter and sort lessonRows based on search and status
    const filteredAndSortedLessonRows = useMemo(() => {
        let filtered = teacherUser.lessonRows;
        
        // Filter by lesson status
        if (filter !== "All") {
            filtered = filtered.filter((lesson) => {
                return lesson.lessonStatus === filter;
            });
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (lesson) =>
                    lesson.leaderName.toLowerCase().includes(query) ||
                    lesson.events.some((event) => 
                        event.location?.toLowerCase().includes(query) ||
                        event.bookingStudents?.some((student) => 
                            `${student.firstName} ${student.lastName}`.toLowerCase().includes(query)
                        )
                    ),
            );
        }
        
        // Sort
        const sorted = [...filtered];
        sorted.sort((a, b) => {
            if (sort.field === "date" || !sort.field) {
                const dateA = new Date(a.dateStart).getTime();
                const dateB = new Date(b.dateStart).getTime();
                return sort.direction === "desc" ? dateB - dateA : dateA - dateB;
            }
            return 0;
        });
        
        return sorted;
    }, [teacherUser.lessonRows, searchQuery, filter, sort]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">My Lessons</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-64">
                    <SearchInput
                        placeholder="Search for students"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        entityColor={teacherEntity.color}
                    />
                </div>
                <SortDropdown value={sort} options={SORT_OPTIONS} onChange={setSort} entityColor={teacherEntity.color} toggleMode={true} />
                <FilterDropdown
                    label="Status"
                    value={filter}
                    options={[...FILTER_OPTIONS]}
                    onChange={(value) => setFilter(value)}
                    entityColor={teacherEntity.color}
                />
            </div>

            <div className="space-y-3">
                {filteredAndSortedLessonRows.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                        No lessons found.
                    </div>
                ) : (
                    filteredAndSortedLessonRows.map((lesson) => (
                        <TeacherBookingLessonTable
                            key={lesson.lessonId}
                            lesson={lesson}
                            isExpanded={expandedLesson === lesson.lessonId}
                            onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)}
                            currency={currency}
                            teacherId={teacherUser.teacher.id}
                            teacherUsername={teacherUser.teacher.username}
                            clickable={false}
                            headerStats={{
                                bookingStatus: lesson.bookingStatus,
                                lessonStatus: lesson.lessonStatus,
                                totalRevenue: lesson.totalRevenue || 0,
                                totalPayments: lesson.totalPayments || 0,
                                currency,
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

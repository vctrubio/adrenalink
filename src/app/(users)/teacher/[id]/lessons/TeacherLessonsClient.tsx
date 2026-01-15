"use client";

import { useState, useMemo } from "react";
import { useTeacherUser } from "@/src/providers/teacher-user-provider";
import type { TransactionEventData } from "@/types/transaction-event";
import { EventUserCard } from "@/src/components/events/EventUserCard";
import { CardList } from "@/src/components/ui/card/card-list";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";
import { MapPin } from "lucide-react";
import { SearchInput } from "@/src/components/SearchInput";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { ENTITY_DATA } from "@/config/entities";

const SORT_OPTIONS = [
    { field: "date", direction: "desc" as const, label: "Newest" },
    { field: "date", direction: "asc" as const, label: "Oldest" },
];

const FILTER_OPTIONS = ["All", "planned", "completed", "tbc", "uncompleted"] as const;

export function TeacherLessonsClient() {
    const { data: teacherUser, currency } = useTeacherUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<{ field: string; direction: "asc" | "desc" }>({ field: "date", direction: "desc" });
    const [filter, setFilter] = useState<string>("All");

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    // Filter lessons
    const filteredLessons = useMemo(() => {
        return teacherUser.lessons.filter((lesson) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesLeader = lesson.leaderStudentName.toLowerCase().includes(query);
                const matchesLocation = lesson.event.location?.toLowerCase().includes(query);
                const matchesStudent = lesson.studentNames.some((name) => name.toLowerCase().includes(query));
                if (!matchesLeader && !matchesLocation && !matchesStudent) return false;
            }

            // Status filter
            if (filter !== "All" && lesson.event.status !== filter) return false;

            return true;
        });
    }, [teacherUser.lessons, searchQuery, filter]);

    // Sort lessons
    const sortedLessons = useMemo(() => {
        return [...filteredLessons].sort((a, b) => {
            const dateA = new Date(a.event.date).getTime();
            const dateB = new Date(b.event.date).getTime();
            return sort.direction === "desc" ? dateB - dateA : dateA - dateB;
        });
    }, [filteredLessons, sort]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">My Lessons</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-64">
                    <SearchInput
                        placeholder="Search by leader name, student, or location..."
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
                {sortedLessons.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
                        No lessons found.
                    </div>
                ) : (
                    sortedLessons.map((lesson) => <TransactionLessonCard key={lesson.event.id} lesson={lesson} currency={currency} />)
                )}
            </div>
        </div>
    );
}

// Sub-component: Transaction Lesson Card
function TransactionLessonCard({ lesson, currency }: { lesson: TransactionEventData; currency: string }) {
    const fields = [
        { label: "Leader", value: lesson.leaderStudentName },
        ...lesson.studentNames.map((name, idx) => ({ label: `Student ${idx + 1}`, value: name })),
        { label: "Location", value: lesson.event.location || "N/A" },
        { label: "Revenue", value: `${lesson.financials.studentRevenue.toFixed(0)} ${currency}` },
        { label: "Commission", value: `${lesson.financials.teacherEarnings.toFixed(0)} ${currency}` },
        { label: "Profit", value: `${lesson.financials.profit.toFixed(0)} ${currency}` },
    ];

    const footerLeftContent = (
        <div className="flex items-center gap-5">
            <div className="[&_span]:text-white">
                <EquipmentStudentCommissionBadge
                    categoryEquipment={lesson.packageData.categoryEquipment}
                    equipmentCapacity={lesson.packageData.capacityEquipment}
                    studentCapacity={lesson.packageData.capacityStudents}
                    commissionType={lesson.financials.commissionType}
                    commissionValue={lesson.financials.commissionValue}
                />
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 text-zinc-400">
                <MapPin size={20} className="text-zinc-400" />
                <span className="text-sm font-semibold tracking-tight truncate max-w-[120px] text-zinc-300">
                    {lesson.event.location || "N/A"}
                </span>
            </div>
        </div>
    );

    return (
        <EventUserCard date={lesson.event.date} duration={lesson.event.duration} status={lesson.event.status} footerLeftContent={footerLeftContent}>
            <CardList fields={fields} />
        </EventUserCard>
    );
}

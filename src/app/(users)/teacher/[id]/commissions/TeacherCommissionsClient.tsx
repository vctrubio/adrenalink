"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type TeacherData } from "@/backend/data/TeacherData";
import { buildEventModels, groupLessonsByCommission, groupEventsByLesson, type CommissionGroup } from "@/backend/data/EventModel";
import { ENTITY_DATA } from "@/config/entities";
import { TeacherBookingLessonTable } from "@/src/components/ids/TeacherBookingLessonTable";
import { type LessonRow } from "@/backend/data/TeacherLessonData";
import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";
import { StatItemUI } from "@/backend/data/StatsData";

interface TeacherCommissionsClientProps {
    teacher: TeacherData;
    currency: string;
}

// Sub-component: Commission Header
function CommissionHeader({ commission, currency }: { commission: CommissionGroup; currency: string }) {
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

export function TeacherCommissionsClient({ teacher, currency }: TeacherCommissionsClientProps) {
    const router = useRouter();
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    // Build event models (all events)
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

    // Group events by lesson (needed for commission grouping)
    const lessonGroups = useMemo(() => {
        return groupEventsByLesson(eventModels);
    }, [eventModels]);

    // Group lessons by commission
    const commissionGroups = useMemo(() => {
        return groupLessonsByCommission(lessonGroups);
    }, [lessonGroups]);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">My Commissions</h2>

            {commissionGroups.length === 0 ? (
                <p className="text-muted-foreground">No commissions found</p>
            ) : (
                <div className="space-y-8">
                    {commissionGroups.map((commission, idx) => (
                        <div key={idx} className="space-y-2">
                            <CommissionHeader commission={commission} currency={currency} />
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
                                            teacherId={teacher.schema.id}
                                            teacherUsername={teacher.schema.username}
                                            onEquipmentUpdate={handleEquipmentUpdate}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

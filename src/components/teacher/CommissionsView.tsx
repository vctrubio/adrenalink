"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatItemUI } from "@/backend/data/StatsData";
import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";
import { TeacherBookingLessonTable } from "@/src/components/ids";
import type { LessonRow } from "@/types/transaction-event";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";

interface CommissionsViewProps {
    lessonRows: LessonRow[];
    expandedLesson: string | null;
    setExpandedLesson: (id: string | null) => void;
    currency: string;
    teacherId?: string;
    teacherUsername?: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
}

export function CommissionsView({
    lessonRows,
    expandedLesson,
    setExpandedLesson,
    currency,
    teacherId,
    teacherUsername,
    onEquipmentUpdate,
}: CommissionsViewProps) {
    const credentials = useSchoolCredentials();

    // Group lessons by commission
    const commissionGroups = useMemo(() => {
        const map = new Map<string, LessonRow[]>();
        for (const lesson of lessonRows) {
            const key = `${lesson.commissionType}-${lesson.cph}`;
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)!.push(lesson);
        }

        return Array.from(map.values()).map((lessons) => {
            const firstLesson = lessons[0];
            const totalHours = lessons.reduce((sum, l) => sum + (l.totalHours || 0), 0);
            const totalEarning = lessons.reduce((sum, l) => sum + (l.totalEarning || 0), 0);

            return {
                type: firstLesson.commissionType as "fixed" | "percentage",
                cph: firstLesson.cph,
                description: firstLesson.commissionDescription,
                lessonCount: lessons.length,
                hours: totalHours,
                earning: totalEarning,
                lessons,
            };
        });
    }, [lessonRows]);

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
                    <div className="flex items-center justify-between py-3 border-b border-border/40">
                        <div className="flex items-center gap-3 flex-wrap">
                            <TeacherLessonComissionValue
                                commissionType={commission.type}
                                cph={commission.cph}
                                currency={credentials?.currency || currency}
                            />
                            {commission.description && (
                                <span className="text-sm italic text-muted-foreground">
                                    {commission.description}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-x-6 gap-y-2 opacity-80">
                            <StatItemUI type="lessons" value={commission.lessonCount} hideLabel={false} iconColor={false} />
                            <StatItemUI type="duration" value={commission.hours * 60} hideLabel={false} iconColor={false} />
                            <StatItemUI
                                type="commission"
                                value={commission.earning}
                                hideLabel={false}
                                variant="primary"
                                iconColor={false}
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {commission.lessons.map((lesson) => (
                            <TeacherBookingLessonTable
                                key={lesson.lessonId}
                                lesson={lesson}
                                isExpanded={expandedLesson === lesson.lessonId}
                                onToggle={() => setExpandedLesson(expandedLesson === lesson.lessonId ? null : lesson.lessonId)}
                                currency={currency}
                                teacherId={teacherId}
                                teacherUsername={teacherUsername}
                                onEquipmentUpdate={onEquipmentUpdate}
                                headerStats={null}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </motion.div>
    );
}
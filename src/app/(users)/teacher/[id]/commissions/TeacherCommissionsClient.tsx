"use client";

import { useMemo } from "react";
import { useTeacherUser } from "@/src/providers/teacher-user-provider";
import type { LessonSummary } from "@/supabase/server/teacher-user";
import { StatItemUI } from "@/backend/data/StatsData";

interface CommissionGroup {
    commissionId: string;
    commissionType: "fixed" | "percentage";
    cph: number;
    lessonCount: number;
    totalDuration: number;
    totalHours: number;
    totalEarnings: number;
    lessons: LessonSummary[];
}

export function TeacherCommissionsClient() {
    const { data: teacherUser, currency } = useTeacherUser();

    // Group lesson summaries by commission ID
    const commissionGroups = useMemo(() => {
        const groupMap = new Map<string, CommissionGroup>();

        teacherUser.lessonSummaries.forEach((lesson) => {
            if (!groupMap.has(lesson.commissionId)) {
                groupMap.set(lesson.commissionId, {
                    commissionId: lesson.commissionId,
                    commissionType: lesson.commissionType,
                    cph: lesson.cph,
                    lessonCount: 0,
                    totalDuration: 0,
                    totalHours: 0,
                    totalEarnings: 0,
                    lessons: [],
                });
            }

            const group = groupMap.get(lesson.commissionId)!;
            group.lessonCount++;
            group.totalDuration += lesson.totalDuration;
            group.totalEarnings += lesson.totalEarnings;
            group.lessons.push(lesson);
        });

        // Convert to array and calculate hours
        return Array.from(groupMap.values()).map((group) => ({
            ...group,
            totalHours: group.totalDuration / 60,
        }));
    }, [teacherUser.lessonSummaries]);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">My Commissions</h2>

            {commissionGroups.length === 0 ? (
                <p className="text-muted-foreground">No commissions found</p>
            ) : (
                <div className="space-y-8">
                    {commissionGroups.map((commission) => (
                        <div key={commission.commissionId} className="space-y-4">
                            {/* Commission Header */}
                            <div className="flex items-center justify-between py-4 px-5 border border-border bg-card rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Commission Type</span>
                                        <span className="text-2xl font-black text-foreground">
                                            {commission.commissionType === "fixed"
                                                ? `${commission.cph} ${currency}/hr`
                                                : `${commission.cph}% Revenue`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-x-8 gap-y-2 opacity-80">
                                    <StatItemUI type="lessons" value={commission.lessonCount} hideLabel={false} iconColor={false} />
                                    <StatItemUI type="duration" value={commission.totalDuration} hideLabel={false} iconColor={false} />
                                    <StatItemUI
                                        type="commission"
                                        value={commission.totalEarnings}
                                        hideLabel={false}
                                        variant="primary"
                                        iconColor={false}
                                    />
                                </div>
                            </div>

                            {/* Lesson List for this commission */}
                            <div className="pl-4 space-y-2">
                                {commission.lessons.map((lesson) => (
                                    <LessonSummaryCard key={lesson.lessonId} lesson={lesson} currency={currency} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Sub-component: Lesson Summary Card
function LessonSummaryCard({ lesson, currency }: { lesson: LessonSummary; currency: string }) {
    const hours = lesson.totalDuration / 60;

    return (
        <div className="flex items-center justify-between py-3 px-4 bg-muted/20 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">Lesson</span>
                    <span className="text-sm font-mono text-foreground/80">{lesson.lessonId.slice(0, 8)}</span>
                </div>
            </div>

            <div className="flex items-center gap-x-6 gap-y-1 text-sm">
                <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">Events</span>
                    <span className="font-semibold text-foreground">{lesson.eventCount}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">Hours</span>
                    <span className="font-semibold text-foreground">{hours.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">Earned</span>
                    <span className="font-bold text-primary">
                        {lesson.totalEarnings.toFixed(0)} {currency}
                    </span>
                </div>
            </div>
        </div>
    );
}

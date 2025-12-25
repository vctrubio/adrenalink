"use client";

import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { LessonEventDurationBadge } from "@/src/components/ui/badge/lesson-event-duration";
import { LessonEventRow, type LessonEventRowData } from "@/src/components/ids/LessonEventRow";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

export interface TeacherComissionLessonData {
    lessonId: string;
    teacherUsername: string;
    status: string;
    commissionType: string;
    cph: number;
    eventCount: number;
    duration: number;
    earned: number;
    events: LessonEventRowData[];
}

interface TeacherComissionLessonTableProps {
    lesson: TeacherComissionLessonData;
    formatCurrency: (num: number) => string;
    currency: string;
    teacherEntity: any;
}

export function TeacherComissionLessonTable({ lesson, formatCurrency, currency, teacherEntity }: TeacherComissionLessonTableProps) {
    return (
        <div className="border-b border-border/30 last:border-b-0">
            {/* Lesson Row */}
            <div className="px-3 py-2 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3">
                    <HoverToEntity entity={teacherEntity} id={lesson.teacherUsername}>
                        <div style={{ color: teacherEntity.color }}>
                            <HeadsetIcon size={16} />
                        </div>
                    </HoverToEntity>
                    <span className="font-semibold text-sm">{lesson.teacherUsername}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1.5" style={{ color: "#22c55e" }}>
                            <HandshakeIcon size={14} />
                            <span className="font-bold text-green-600 dark:text-green-400">{lesson.commissionType === "percentage" ? `${lesson.cph}%` : `${lesson.cph} ${currency}`}</span>
                        </div>
                        <span className="text-muted-foreground">×</span>
                        <LessonEventDurationBadge status={lesson.status} events={lesson.eventCount} hours={lesson.duration / 60} />
                        <span className="text-muted-foreground">=</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">
                            {formatCurrency(lesson.earned)} {currency}
                        </span>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <LessonEventRow events={lesson.events} isExpanded={true} />
        </div>
    );
}

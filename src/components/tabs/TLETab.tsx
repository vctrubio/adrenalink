"use client";

import { useState } from "react";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTeacherLessonCommission } from "@/getters/teacher-commission-getter";
import { getEventStatusColor, getEventStatusLabel } from "@/types/status";
import type { ClassboardLesson, ClassboardEvent } from "@/backend/models/ClassboardModel";

const DURATION_COLOR_FILL = "#f59e0b";

interface TLETabProps {
    bookingId: string;
    lessons: ClassboardLesson[];
    teacherId?: string;
}

// Minimal commission display - clean inline formula
const CommissionDisplay = ({ commission, commissionColor }: { commission: ReturnType<typeof getTeacherLessonCommission>; commissionColor?: string }) => {
    return (
        <div className="flex items-center gap-1.5 text-xs">
            <div className="flex-shrink-0" style={{ color: commissionColor }}>
                <HandshakeIcon size={12} />
            </div>
            <div className="text-muted-foreground">
                {commission.commissionRate} × <span style={{ color: DURATION_COLOR_FILL }}>{commission.hours}</span>
            </div>
            <div className="text-muted-foreground">=</div>
            <div className="font-semibold text-foreground" style={{ color: commissionColor }}>
                {commission.earned}
            </div>
        </div>
    );
};

// Event item - minimal and clean
const EventItem = ({ event, statusColor, statusLabel }: { event: ClassboardEvent; statusColor: string; statusLabel: string }) => {
    return (
        <div className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="flex-shrink-0" style={{ color: statusColor }}>
                    <FlagIcon size={10} />
                </div>
                <div>
                    {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })}{" "}
                    {new Date(event.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
                <div className="text-muted-foreground/60">•</div>
                <div>{statusLabel}</div>
            </div>
            <div className="flex items-center gap-1 font-semibold" style={{ color: DURATION_COLOR_FILL }}>
                <DurationIcon size={12} />
                {getPrettyDuration(event.duration)}
            </div>
        </div>
    );
};

// Teacher footer bookmark - compact horizontal badge
const TeacherBookmark = ({
    teacher,
    isExpanded,
    teacherColor,
    commission,
    commissionColor,
}: {
    teacher: { username: string; firstName: string; lastName: string };
    isExpanded: boolean;
    teacherColor?: string;
    commission: ReturnType<typeof getTeacherLessonCommission>;
    commissionColor?: string;
}) => {
    return (
        <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
                <div className="flex-shrink-0" style={{ color: teacherColor }}>
                    <HeadsetIcon size={18} />
                </div>
                <div className="text-sm font-medium text-foreground">
                    {teacher?.username}
                </div>
            </div>
            <CommissionDisplay commission={commission} commissionColor={commissionColor} />
        </div>
    );
};

export const TLETab = ({ bookingId, lessons, teacherId }: TLETabProps) => {
    const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);

    // Get entity colors
    const teacherColor = ENTITY_DATA.find((e) => e.id === "teacher")?.color;
    const commissionColor = ENTITY_DATA.find((e) => e.id === "commission")?.color;

    // Check if lessons exist
    if (lessons.length === 0) {
        return null;
    }

    // Filter lessons by teacherId if provided
    const filteredLessons = teacherId ? lessons.filter((lesson) => lesson.teacher.id === teacherId) : lessons;

    return (
        <div className="flex flex-col">
            {filteredLessons.map((lesson) => {
                const isExpanded = expandedTeacherId === lesson.id;
                const events = lesson.events;

                // Calculate lesson revenue based on teacher's actual hours
                const teacherMinutes = events.reduce((sum, evt) => sum + evt.duration, 0);
                const teacherHours = teacherMinutes / 60;

                // Get commission breakdown
                const commission = getTeacherLessonCommission(events, lesson.commission, 0, 0);

                return (
                    <div
                        key={lesson.id}
                        className="bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setExpandedTeacherId(isExpanded ? null : lesson.id)}
                    >
                        <TeacherBookmark teacher={lesson.teacher} isExpanded={isExpanded} teacherColor={teacherColor} commission={commission} commissionColor={commissionColor} />

                        {isExpanded && (
                            <div className="px-3 pb-2 space-y-0.5 border-t border-border/50">
                                {events.map((event) => (
                                    <EventItem key={event.id} event={event} statusColor={getEventStatusColor(event.status)} statusLabel={getEventStatusLabel(event.status)} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

"use client";

import Link from "next/link";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { ENTITY_DATA } from "@/config/entities";
import { getTeacherLessonCommission } from "@/getters/teacher-commission-getter";
import { getEventStatusColor, getEventStatusLabel } from "@/types/status";
import type { ClassboardLesson } from "@/backend/models/ClassboardModel";

const DURATION_COLOR = "#f59e0b";

interface BookingTeacherLessonTabProps {
    lessons: ClassboardLesson[];
    selectedTeacherId: string | undefined;
    pricePerStudent: number;
    packageDurationMinutes: number;
}

const CommissionDisplay = ({ commission, commissionColor }: { commission: ReturnType<typeof getTeacherLessonCommission>; commissionColor?: string }) => (
    <div className="flex items-center gap-1.5 text-xs">
        <div className="flex-shrink-0" style={{ color: commissionColor }}>
            <HandshakeIcon size={12} />
        </div>
        <div className="text-muted-foreground">
            {commission.commissionRate} × <span style={{ color: DURATION_COLOR }}>{commission.hours}</span>
        </div>
        <div className="text-muted-foreground">=</div>
        <div className="font-semibold text-foreground" style={{ color: commissionColor }}>
            {commission.earned}
        </div>
    </div>
);

const TeacherHeader = ({ teacher, commission, commissionColor, teacherColor }: { teacher: ClassboardLesson["teacher"]; commission: ReturnType<typeof getTeacherLessonCommission>; commissionColor?: string; teacherColor?: string }) => (
    <div className="flex items-center gap-3 pb-2 border-b border-border">
        <Link href={`/teachers/${teacher.username}`}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: `${teacherColor}20`, color: teacherColor }}>
                <HeadsetIcon size={24} />
            </div>
        </Link>
        <div className="flex flex-col">
            <div className="text-sm font-semibold text-foreground">{teacher.username}</div>
            <CommissionDisplay commission={commission} commissionColor={commissionColor} />
        </div>
    </div>
);

const EventRow = ({ event, index, teacherColor }: { event: ClassboardLesson["events"][0]; index: number; teacherColor?: string }) => {
    const statusColor = getEventStatusColor(event.status);
    const statusLabel = getEventStatusLabel(event.status);
    const eventDate = new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const eventTime = new Date(event.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const duration = event.duration;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    const durationText = mins > 0 ? `${hours}:${mins.toString().padStart(2, "0")}` : `${hours}h`;

    return (
        <div className="flex items-center justify-between p-2 text-xs hover:bg-muted/20 transition-colors border-b border-border last:border-b-0">
            <div className="flex items-center gap-2 flex-1">
                <div style={{ color: statusColor }}>
                    <FlagIcon size={14} />
                </div>
                <div className="text-muted-foreground">
                    {eventDate} at {eventTime}
                </div>
                <div className="text-muted-foreground/40">•</div>
                <div className="text-muted-foreground capitalize">{statusLabel}</div>
            </div>
            <div className="font-semibold ml-4" style={{ color: DURATION_COLOR }}>
                {durationText}
            </div>
        </div>
    );
};

export const BookingTeacherLessonTab = ({ lessons, selectedTeacherId, pricePerStudent, packageDurationMinutes }: BookingTeacherLessonTabProps) => {
    const teacherColor = ENTITY_DATA.find((e) => e.id === "teacher")?.color;
    const commissionColor = ENTITY_DATA.find((e) => e.id === "commission")?.color;

    if (!selectedTeacherId) {
        return null;
    }

    const selectedLesson = lessons.find((l) => l.id === selectedTeacherId);

    if (!selectedLesson) {
        return null;
    }

    const events = selectedLesson.events || [];
    const commission = getTeacherLessonCommission(events, selectedLesson.commission, pricePerStudent, packageDurationMinutes);

    return (
        <div className="space-y-2">
            <TeacherHeader teacher={selectedLesson.teacher} commission={commission} commissionColor={commissionColor} teacherColor={teacherColor} />

            {events.length > 0 ? (
                <div className="divide-y divide-border">
                    {events.map((event) => (
                        <div key={event.id} className="pt-2">
                            <EventRow event={event} index={0} teacherColor={teacherColor} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">No events scheduled</div>
            )}
        </div>
    );
};

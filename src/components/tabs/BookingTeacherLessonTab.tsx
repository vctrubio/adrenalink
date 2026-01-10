"use client";

import Link from "next/link";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { ENTITY_DATA } from "@/config/entities";
import {
    calculateCommission,
    calculateLessonRevenue,
    type CommissionInfo,
    type CommissionCalculation,
} from "@/getters/commission-calculator";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import type { ClassboardLesson } from "@/backend/classboard/ClassboardModel";

const DURATION_COLOR = "#f59e0b";

interface BookingTeacherLessonTabProps {
    lessons: ClassboardLesson[];
    selectedTeacherId: string | undefined;
    pricePerStudent: number;
    packageDurationMinutes: number;
    studentCount: number;
}

const CommissionDisplay = ({
    calculation,
    commissionColor,
}: {
    commission: CommissionCalculation;
    calculation: CommissionCalculation;
    commissionColor?: string;
}) => (
    <div className="flex items-center gap-1.5 text-xs">
        <div className="flex-shrink-0" style={{ color: commissionColor }}>
            <HandshakeIcon size={12} />
        </div>
        <div className="text-muted-foreground">
            {calculation.commissionRate} × <span style={{ color: DURATION_COLOR }}>{calculation.hours}</span>
        </div>
        <div className="text-muted-foreground">=</div>
        <div className="font-semibold text-foreground" style={{ color: commissionColor }}>
            {calculation.earnedDisplay}
        </div>
    </div>
);

const TeacherHeader = ({
    teacher,
    calculation,
    commissionColor,
    teacherColor,
}: {
    teacher: ClassboardLesson["teacher"];
    calculation: CommissionCalculation;
    commissionColor?: string;
    teacherColor?: string;
}) => (
    <div className="flex items-center gap-3 pb-2 border-b border-border">
        <Link href={`/teachers/${teacher.id}`}>
            <div
                className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: `${teacherColor}20`, color: teacherColor }}
            >
                <HeadsetIcon size={24} />
            </div>
        </Link>
        <div className="flex flex-col">
            <div className="text-sm font-semibold text-foreground">{teacher.username}</div>
            <CommissionDisplay commission={calculation} calculation={calculation} commissionColor={commissionColor} />
        </div>
    </div>
);

const EventRow = ({ event, index, teacherColor }: { event: ClassboardLesson["events"][0]; index: number; teacherColor?: string }) => {
    const eventDate = new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const eventTime = new Date(event.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const duration = event.duration;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    const durationText = mins > 0 ? `${hours}:${mins.toString().padStart(2, "0")}` : `${hours}h`;

    return (
        <div className="flex items-center justify-between p-2 text-xs hover:bg-muted/20 transition-colors border-b border-border last:border-b-0">
            <div className="flex items-center gap-2 flex-1">
                <div style={{ color: EVENT_STATUS_CONFIG[event.status].color }}>
                    <FlagIcon size={14} />
                </div>
                <div className="text-muted-foreground">
                    {eventDate} at {eventTime}
                </div>
                <div className="text-muted-foreground/40">•</div>
                <div className="text-muted-foreground capitalize">{EVENT_STATUS_CONFIG[event.status].label}</div>
            </div>
            <div className="font-semibold ml-4" style={{ color: DURATION_COLOR }}>
                {durationText}
            </div>
        </div>
    );
};

export const BookingTeacherLessonTab = ({
    lessons,
    selectedTeacherId,
    pricePerStudent,
    packageDurationMinutes,
    studentCount,
}: BookingTeacherLessonTabProps) => {
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
    const lessonDurationMinutes = events.reduce((sum, evt) => sum + evt.duration, 0);

    const lessonRevenue = calculateLessonRevenue(pricePerStudent, studentCount, lessonDurationMinutes, packageDurationMinutes);

    const commissionInfo: CommissionInfo = {
        type: selectedLesson.commission.type as "fixed" | "percentage",
        cph: parseFloat(selectedLesson.commission.cph),
    };

    const calculation = calculateCommission(lessonDurationMinutes, commissionInfo, lessonRevenue, packageDurationMinutes);

    return (
        <div className="space-y-2">
            <TeacherHeader
                teacher={selectedLesson.teacher}
                calculation={calculation}
                commissionColor={commissionColor}
                teacherColor={teacherColor}
            />

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

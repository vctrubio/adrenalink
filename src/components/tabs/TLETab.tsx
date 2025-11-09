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
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

interface TLETabProps {
    booking: ActiveBookingModel;
    teacherId?: string;
}

// Commission breakdown table with icon
const CommissionTable = ({ commission, commissionColor, packageColor }: { commission: ReturnType<typeof getTeacherLessonCommission>; commissionColor?: string; packageColor?: string }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-shrink-0" style={{ color: commissionColor }}>
                <HandshakeIcon size={16} />
            </div>
            <table className="text-xs flex-shrink-0">
                <tbody>
                    <tr>
                        <td className="text-muted-foreground pr-2">Commission</td>
                        <td className="text-foreground font-bold text-center pr-2 w-6">×</td>
                        <td className="text-muted-foreground pr-2">Price/Hour</td>
                        <td className="text-foreground font-bold text-center pr-2 w-6">×</td>
                        <td className="text-muted-foreground pr-2">Hours</td>
                        <td className="text-foreground font-bold text-center pr-2 w-6">=</td>
                        <td className="text-muted-foreground">Earned</td>
                    </tr>
                    <tr>
                        <td className="font-medium pr-2" style={{ color: commissionColor }}>
                            {commission.commissionRate}
                        </td>
                        <td className="text-foreground font-bold text-center pr-2">×</td>
                        <td className="font-medium pr-2" style={{ color: packageColor }}>
                            {commission.pricePerHour}
                        </td>
                        <td className="text-foreground font-bold text-center pr-2">×</td>
                        <td className="font-medium pr-2" style={{ color: packageColor }}>
                            {commission.hours}
                        </td>
                        <td className="text-foreground font-bold text-center pr-2">=</td>
                        <td className="font-medium" style={{ color: commissionColor }}>
                            {commission.earned}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// Event item with date, time, status and duration
const EventItem = ({ event, statusColor, statusLabel }: { event: ActiveBookingModel["events"][0]; statusColor: string; statusLabel: string }) => {
    return (
        <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5" style={{ color: statusColor }}>
                <FlagIcon size={14} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "2-digit",
                        })}{" "}
                        {new Date(event.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}{" "}
                        • {statusLabel}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <DurationIcon size={14} />
                        <span className="text-xs font-semibold text-foreground">{getPrettyDuration(event.duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Teacher header button with collapsible state
const TeacherHeader = ({
    teacher,
    isExpanded,
    onClick,
    teacherColor,
    commission,
    commissionColor,
    packageColor,
}: {
    teacher?: { id: string; firstName: string; lastName: string };
    isExpanded: boolean;
    onClick: () => void;
    teacherColor?: string;
    commission: ReturnType<typeof getTeacherLessonCommission>;
    commissionColor?: string;
    packageColor?: string;
}) => {
    return (
        <button onClick={onClick} className="flex items-center justify-between gap-3 px-4 py-2 transition-colors cursor-pointer hover:opacity-80">
            <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg flex-shrink-0" style={{ color: teacherColor, backgroundColor: `${teacherColor}15` }}>
                    <HeadsetIcon size={16} />
                </div>
                <div className="text-sm font-semibold text-foreground truncate">
                    {teacher?.firstName} {teacher?.lastName}
                </div>
            </div>
            {isExpanded && <CommissionTable commission={commission} commissionColor={commissionColor} packageColor={packageColor} />}
        </button>
    );
};

export const TLETab = ({ booking, teacherId }: TLETabProps) => {
    const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);

    // Get entity colors
    const teacherColor = ENTITY_DATA.find((e) => e.id === "teacher")?.color;
    const commissionColor = ENTITY_DATA.find((e) => e.id === "commission")?.color;
    const packageColor = ENTITY_DATA.find((e) => e.id === "schoolPackage")?.color;

    // Check if events exist
    if (booking.events.length === 0) {
        return <div className="text-xs text-muted-foreground">No events scheduled</div>;
    }

    // Filter events by teacherId if provided
    const filteredEvents = teacherId ? booking.events.filter((event) => event.teacher?.id === teacherId) : booking.events;

    // Group events by teacher
    const eventsByTeacher = filteredEvents.reduce(
        (acc, event) => {
            const teacherKey = event.teacher?.id || "unknown";
            if (!acc[teacherKey]) {
                acc[teacherKey] = {
                    teacher: event.teacher,
                    events: [],
                };
            }
            acc[teacherKey].events.push(event);
            return acc;
        },
        {} as Record<
            string,
            {
                teacher?: { id: string; firstName: string; lastName: string };
                events: typeof booking.events;
            }
        >,
    );

    return (
        <div className="space-y-3">
            {Object.entries(eventsByTeacher).map(([teacherKey, { teacher, events }]) => {
                const isExpanded = expandedTeacherId === teacherKey;

                // Calculate lesson revenue based on teacher's actual hours vs package total hours
                const teacherMinutes = events.reduce((sum, evt) => sum + evt.duration, 0);
                const teacherHours = teacherMinutes / 60;
                const totalBookingRevenue = booking.package.pricePerStudent * booking.students.length;
                const lessonRevenue = totalBookingRevenue * (teacherHours / (booking.package.durationMinutes / 60));

                // Get commission breakdown
                const commission = getTeacherLessonCommission(events, events[0]?.commission, lessonRevenue, booking.package.durationMinutes);

                return (
                    <div
                        key={teacherKey}
                        className="border rounded-xl overflow-hidden transition-colors"
                        style={{
                            borderColor: teacherColor,
                            backgroundColor: isExpanded ? `${teacherColor}20` : "transparent",
                        }}
                    >
                        <TeacherHeader teacher={teacher} isExpanded={isExpanded} onClick={() => setExpandedTeacherId(isExpanded ? null : teacherKey)} teacherColor={teacherColor} commission={commission} commissionColor={commissionColor} packageColor={packageColor} />

                        {isExpanded && (
                            <div className="space-y-2 pl-4 py-2 px-4 border-t" style={{ borderColor: teacherColor }}>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { ENTITY_DATA } from "@/config/entities";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import { StudentUsernameBadge } from "@/src/components/ui/badge/student-username";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { getTimeFromISO } from "@/getters/queue-getter";
import { getHMDuration } from "@/getters/duration-getter";
import { EventDurationTag } from "@/src/components/tags/EventDurationTag";
import { updateEventStatus } from "@/supabase/server/classboard";
import { EventStatusLabel } from "@/src/components/labels/EventStatusLabel";
import { EquipmentFulfillmentCell } from "@/src/components/equipment/EquipmentFulfillmentCell";
import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { getPPP } from "@/getters/integer-getter";
import { TrendingUp } from "lucide-react";
import type { TimelineEvent, EquipmentAssignmentProps } from "./types";

interface TimelineEventCardProps extends EquipmentAssignmentProps {
    event: TimelineEvent;
    currency: string;
    formatCurrency: (num: number) => string;
    showTeacher?: boolean;
    showFinancials?: boolean;
}

export function TimelineEventCard({
    event,
    currency,
    formatCurrency,
    showTeacher = true,
    showFinancials = true,
    teacherId,
    teacherUsername,
    onEquipmentUpdate,
}: TimelineEventCardProps) {
    const [currentStatus, setCurrentStatus] = useState<EventStatus>(event.eventStatus as EventStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const TeacherIcon = teacherEntity.icon;
    const statusConfig = EVENT_STATUS_CONFIG[currentStatus] || EVENT_STATUS_CONFIG.planned;
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === event.equipmentCategory);
    const EquipmentIcon = equipmentConfig?.icon;

    const handleStatusChange = async (newStatus: EventStatus) => {
        if (newStatus === currentStatus || isUpdating) return;
        setIsUpdating(true);
        try {
            await updateEventStatus(event.eventId, newStatus);
            setCurrentStatus(newStatus);
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (cascade: boolean) => {
        console.log("Delete requested for event", event.eventId, "cascade:", cascade);
    };

    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative group">
            <div
                className="absolute -left-[31px] top-3 w-4 h-4 rounded-full border-2 border-background"
                style={{ backgroundColor: statusConfig.color }}
            />
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-4xl font-black tracking-tighter leading-none text-foreground">
                            {event.time}
                        </span>
                        <EventDurationTag
                            icon={<MapPin size={10} />}
                            location={event.location}
                            duration={getHMDuration(event.duration)}
                        />
                    </div>

                    {!showTeacher ? (
                        <EventStatusLabel
                            status={currentStatus}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            icon={EquipmentIcon}
                            capacity={event.capacityEquipment || 0}
                        />
                    ) : (
                        <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider"
                            style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                        >
                            {currentStatus}
                        </span>
                    )}
                </div>

                {event.bookingStudents && event.bookingStudents.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {event.bookingStudents.map((student) => (
                            <StudentUsernameBadge
                                key={student.id}
                                id={student.id}
                                firstName={student.firstName}
                                lastName={student.lastName}
                                color={studentEntity.color}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3 flex-wrap mt-2">
                    {showTeacher && (
                        <Link href={`/teachers/${event.teacherId}`}>
                            <TeacherUsernameCommissionBadge
                                teacherIcon={TeacherIcon}
                                teacherUsername={event.teacherUsername}
                                teacherColor={teacherEntity.color}
                                commissionValue={String(event.commissionCph)}
                                commissionType={event.commissionType as "fixed" | "percentage"}
                                currency={currency}
                            />
                        </Link>
                    )}
                </div>

                {showFinancials && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-border/50 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Teacher Commission</span>
                            <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto] items-center gap-1">
                                <div className="text-green-600 dark:text-green-400">
                                    <HandshakeIcon size={14} />
                                </div>
                                <span className="font-bold">
                                    {event.commissionType === "percentage" ? `${event.commissionCph}%` : `${event.commissionCph} ${currency}`}
                                </span>
                                <span className="text-muted-foreground">×</span>
                                <span className="font-mono">{getHMDuration(event.duration)}</span>
                                <span className="text-muted-foreground">=</span>
                                <span className="font-mono font-semibold">
                                    {getPPP(Math.round(event.teacherEarning * 100) / 100)} {currency}
                                </span>
                            </div>
                        </div>
                        {event.totalRevenue > 0 && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Students Paid</span>
                                    <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto] items-center gap-1">
                                        <div className="text-foreground">
                                            <CreditIcon size={14} />
                                        </div>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="font-mono text-xs">
                                                {(() => {
                                                    const studentCount = event.bookingStudents?.length || event.capacityStudents || 1;
                                                    const hours = event.duration / 60;
                                                    // Calculate price per hour: totalRevenue = pricePerHour * studentCount * hours
                                                    // So: pricePerHour = totalRevenue / (studentCount * hours)
                                                    const pricePerHour = studentCount > 0 && hours > 0 ? event.totalRevenue / (studentCount * hours) : 0;
                                                    return pricePerHour && isFinite(pricePerHour) ? getPPP(Math.round(pricePerHour * 100) / 100) : "0";
                                                })()}
                                            </span>
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">/h</span>
                                        </div>
                                        <span className="text-muted-foreground">×</span>
                                        <span className="font-mono">{event.bookingStudents?.length || event.capacityStudents || 0}</span>
                                        <span className="text-muted-foreground">=</span>
                                        <span className="font-mono font-semibold">
                                            {getPPP(Math.round(event.totalRevenue * 100) / 100)} {currency}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Profit</span>
                                    <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto] items-center gap-1">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span className="flex items-center gap-1 font-mono font-semibold text-primary">
                                            <TrendingUp size={14} className="text-foreground/60" />
                                            {getPPP(Math.round((event.totalRevenue - event.teacherEarning) * 100) / 100)} {currency}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                            <span className="text-muted-foreground">Equipment</span>
                            <EquipmentFulfillmentCell
                                eventId={event.eventId}
                                eventTime={event.time}
                                eventDuration={event.duration}
                                equipments={event.equipments}
                                categoryId={event.equipmentCategory || undefined}
                                teacherId={teacherId}
                                teacherUsername={teacherUsername}
                                eventStatus={currentStatus}
                                onUpdate={onEquipmentUpdate}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

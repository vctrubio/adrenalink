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
import type { TimelineEvent } from "./types";

interface TimelineEventCardProps {
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
                            {getTimeFromISO(event.date.toISOString())}
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

                <div className="flex items-center gap-3 flex-wrap ">
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
                            <div className="flex items-center gap-1">
                                <span className="font-mono ">{event.commissionCph}</span>
                                <span className="text-muted-foreground">×</span>
                                <span className="font-mono ">{getHMDuration(event.duration)}</span>
                                <span className="text-muted-foreground">=</span>
                                <span className="font-mono font-semibold ">
                                    {formatCurrency(Math.round(event.teacherEarning * 100) / 100)}
                                </span>
                            </div>
                        </div>
                        {event.totalRevenue > 0 && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Students Paid</span>
                                    <span className="font-mono font-semibold">
                                        {formatCurrency(Math.round(event.totalRevenue * 100) / 100)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Revenue</span>
                                    <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                                        {formatCurrency(Math.round(event.schoolRevenue * 100) / 100)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

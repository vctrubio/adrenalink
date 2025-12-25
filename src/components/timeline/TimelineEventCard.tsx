"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { ENTITY_DATA } from "@/config/entities";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { EventStartDurationTime } from "@/src/components/ui/EventStartDurationTime";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import type { TimelineEvent } from "./types";

interface TimelineEventCardProps {
    event: TimelineEvent;
    currency: string;
    formatCurrency: (num: number) => string;
    showTeacher?: boolean;
    showFinancials?: boolean;
}

export function TimelineEventCard({ event, currency, formatCurrency, showTeacher = true, showFinancials = true }: TimelineEventCardProps) {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const TeacherIcon = teacherEntity.icon;
    const statusConfig = EVENT_STATUS_CONFIG[event.eventStatus as keyof typeof EVENT_STATUS_CONFIG];

    return (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative group">
            <div className="absolute -left-[31px] top-3 w-4 h-4 rounded-full border-2 border-background" style={{ backgroundColor: statusConfig?.color }} />
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <EventStartDurationTime date={event.date.toISOString()} duration={event.duration} />
                    <div className="flex items-center gap-2">
                        {!showTeacher && event.bookingStudents && event.bookingStudents.length > 0 && (
                            <span className="text-sm font-semibold text-foreground">{event.bookingStudents[0].firstName}</span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${statusConfig?.color}20`, color: statusConfig?.color }}>
                            {event.eventStatus}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-sm mb-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                    </div>
                    {showTeacher && (
                        <HoverToEntity entity={teacherEntity} id={event.teacherUsername}>
                            <TeacherUsernameCommissionBadge
                                teacherIcon={TeacherIcon}
                                teacherUsername={event.teacherUsername}
                                teacherColor={teacherEntity.color}
                                commissionValue={String(event.commissionCph)}
                                commissionType={event.commissionType as "fixed" | "percentage"}
                                currency={currency}
                            />
                        </HoverToEntity>
                    )}
                    {!showTeacher && event.equipmentCategory && event.capacityEquipment && event.capacityStudents && (
                        <EquipmentStudentCommissionBadge
                            categoryEquipment={event.equipmentCategory}
                            equipmentCapacity={event.capacityEquipment}
                            studentCapacity={event.capacityStudents}
                            commissionType={event.commissionType as "fixed" | "percentage"}
                            commissionValue={event.commissionCph}
                        />
                    )}
                </div>

                {!showTeacher && event.bookingStudents && event.bookingStudents.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-3 text-sm">
                        {event.bookingStudents.map((student) => (
                            <HoverToEntity key={student.id} entity={ENTITY_DATA.find((e) => e.id === "student")!} id={student.id}>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                                    <div style={{ color: ENTITY_DATA.find((e) => e.id === "student")?.color }}>
                                        <HelmetIcon size={14} />
                                    </div>
                                    <span className="text-xs font-medium">{student.firstName} {student.lastName}</span>
                                </div>
                            </HoverToEntity>
                        ))}
                    </div>
                )}

                {showFinancials && (
                    <div className="space-y-2 pt-3 border-t border-border/50 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Teacher Commission</span>
                            <div className="flex items-center gap-1">
                                <span className="font-mono font-semibold text-green-600 dark:text-green-400">{event.commissionCph}</span>
                                <span className="text-muted-foreground">×</span>
                                <span className="font-mono font-semibold text-primary">{(event.duration / 60).toFixed(1)}h</span>
                                <span className="text-muted-foreground">=</span>
                                <span className="font-mono font-semibold text-green-600 dark:text-green-400">{formatCurrency(Math.round(event.teacherEarning * 100) / 100)}</span>
                            </div>
                        </div>
                        {event.totalRevenue > 0 && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Students Paid</span>
                                    <span className="font-mono font-semibold">{formatCurrency(Math.round(event.totalRevenue * 100) / 100)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Revenue</span>
                                    <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(Math.round(event.schoolRevenue * 100) / 100)}</span>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

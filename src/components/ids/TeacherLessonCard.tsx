"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { ENTITY_DATA } from "@/config/entities";
import { EVENT_STATUS_CONFIG, LESSON_STATUS_CONFIG } from "@/types/status";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { getHMDuration } from "@/getters/duration-getter";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { LessonEventDurationBadge } from "@/src/components/ui/badge/lesson-event-duration";
import { BookingStatusLabel } from "@/src/components/labels/BookingStatusLabel";
import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";

export interface TeacherLessonCardEvent {
    eventId: string;
    date: Date;
    time: string;
    dateLabel: string;
    dayOfWeek: string;
    duration: number;
    durationLabel: string;
    location: string;
    status: string;
}

export interface TeacherLessonCardData {
    lessonId: string;
    bookingId: string;
    leaderName: string;
    dateStart: string;
    dateEnd: string;
    lessonStatus: string;
    bookingStatus: string;
    commissionType: string;
    cph: number;
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    events: TeacherLessonCardEvent[];
    equipmentCategory: string;
    studentCapacity: number;
}

interface TeacherLessonCardProps {
    lesson: TeacherLessonCardData;
    isExpanded: boolean;
    onToggle: () => void;
}

export function TeacherLessonCard({ lesson, isExpanded, onToggle }: TeacherLessonCardProps) {
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === lesson.equipmentCategory);
    const EquipmentIcon = equipmentConfig?.icon;
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    return (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
            <button onClick={onToggle} className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                    <HoverToEntity entity={bookingEntity} id={lesson.bookingId}>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {EquipmentIcon && <EquipmentIcon size={20} />}
                        </div>
                    </HoverToEntity>
                    <div className="flex items-center gap-2">
                        <div style={{ color: studentEntity.color }}>
                            <HelmetIcon size={16} />
                        </div>
                        <span className="font-semibold">{lesson.leaderName}</span>
                        {lesson.studentCapacity > 1 && (
                            <span className="text-xs text-muted-foreground">+{lesson.studentCapacity - 1} students</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <BookingStatusLabel status={lesson.bookingStatus} size={16} />
                        <DateRangeBadge startDate={lesson.dateStart} endDate={lesson.dateEnd} />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <TeacherLessonComissionValue 
                            commissionType={lesson.commissionType} 
                            cph={lesson.cph} 
                            currency={currency} 
                        />
                        <span className="text-muted-foreground">×</span>
                        <LessonEventDurationBadge status={lesson.lessonStatus} events={lesson.eventCount} hours={lesson.totalHours} />
                        <span className="text-muted-foreground">=</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">{(Math.round(lesson.totalEarning * 100) / 100).toFixed(2)} {currency}</span>
                    </div>
                    <div className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        <AdranlinkIcon size={18} />
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-4 pb-3 space-y-2">
                            {lesson.events.map((event) => (
                                <div key={event.eventId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                                    <div className="flex items-center gap-3">
                                        <FlagIcon size={14} style={{ color: EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG]?.color }} />
                                        <span className="font-medium">{event.dateLabel}</span>
                                        <span className="font-mono text-muted-foreground">{event.time}</span>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <DurationIcon size={12} />
                                            <span className="font-mono">{getHMDuration(event.duration)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <MapPin size={12} />
                                            <span>{event.location}</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG]?.color}20`, color: EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG]?.color }}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {lesson.events.length === 0 && (
                                <div className="text-sm text-muted-foreground py-2 text-center">No events scheduled</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
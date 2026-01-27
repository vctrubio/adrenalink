"use client";

import { LessonEventDurationBadge } from "@/src/components/ui/badge/lesson-event-duration";
import { BookingStatusLabel } from "@/src/components/labels/BookingStatusLabel";
import { LessonEventRow } from "@/src/components/ids/LessonEventRow";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";
import { type LessonRow } from "@/types/transaction-event";
import { getLeaderCapacity } from "@/getters/bookings-getter";
import { getPPP } from "@/getters/integer-getter";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { LessonHeaderStats, type LessonHeaderStats as LessonHeaderStatsType } from "./LessonHeaderStats";

interface TeacherBookingLessonTableProps {
    lesson: LessonRow;
    isExpanded: boolean;
    onToggle: () => void;
    currency: string;
    teacherId?: string;
    teacherUsername?: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
    clickable?: boolean; // Default true for admin view, false for teacher user view
    headerStats?: LessonHeaderStatsType | null; // If null, don't show header. If provided, show header with stats.
}

export function TeacherBookingLessonTable({
    lesson,
    isExpanded,
    onToggle,
    currency,
    teacherId,
    teacherUsername,
    onEquipmentUpdate,
    clickable = true,
    headerStats,
}: TeacherBookingLessonTableProps) {
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === lesson.equipmentCategory);
    const EquipmentIcon = equipmentConfig?.icon;

    const borderClass = headerStats ? "border-t border-border" : "rounded-lg border border-border";
    const tableContent = (
        <div className={`${borderClass} bg-card hover:border-primary/30 transition-colors`}>
            <div
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {EquipmentIcon && (
                        clickable ? (
                            <Link 
                                href={`/bookings/${lesson.bookingId}`}
                                onClick={(e) => e.stopPropagation()}
                                prefetch={false}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/20 shrink-0 hover:bg-muted/40 transition-colors">
                                    <EquipmentIcon size={16} className="text-foreground/60" />
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/20 shrink-0">
                                <EquipmentIcon size={16} className="text-foreground/60" />
                            </div>
                        )
                    )}
                    
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            {getLeaderCapacity(lesson.leaderName, lesson.studentCapacity)}
                        </div>
                        <div className="flex items-center gap-2">
                            <BookingStatusLabel
                                status={lesson.bookingStatus}
                                bookingId={clickable ? lesson.bookingId : undefined}
                                size={12}
                                startDate={lesson.dateStart}
                                endDate={lesson.dateEnd}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs">
                        <TeacherLessonComissionValue commissionType={lesson.commissionType} cph={lesson.cph} currency={currency} />
                        <span className="text-muted-foreground/60">×</span>
                        <LessonEventDurationBadge status={lesson.lessonStatus} events={lesson.eventCount} hours={lesson.totalHours} />
                        <span className="text-muted-foreground/60">=</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">
                            {getPPP(lesson.totalEarning)} {currency}
                        </span>
                    </div>
                    <ChevronDown 
                        size={16} 
                        className={`text-muted-foreground/40 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    />
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-border/40">
                    <LessonEventRow 
                        events={lesson.events} 
                        isExpanded={isExpanded}
                        equipmentCategory={lesson.equipmentCategory}
                        teacherId={teacherId}
                        teacherUsername={teacherUsername}
                        onEquipmentUpdate={onEquipmentUpdate}
                    />
                </div>
            )}
        </div>
    );

    // If headerStats is provided, wrap in container with header
    if (headerStats) {
        return (
            <div className="rounded-lg border border-border overflow-hidden">
                <LessonHeaderStats stats={headerStats} />
                <div className="bg-card">
                    {tableContent}
                </div>
            </div>
        );
    }

    // Otherwise, return table without header
    return tableContent;
}

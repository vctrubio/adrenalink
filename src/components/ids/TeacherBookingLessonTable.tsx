"use client";

import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { LessonEventDurationBadge } from "@/src/components/ui/badge/lesson-event-duration";
import { BookingStatusLabel } from "@/src/components/labels/BookingStatusLabel";
import { LessonEventRow } from "@/src/components/ids/LessonEventRow";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { TeacherLessonComissionValue } from "@/src/components/ui/TeacherLessonComissionValue";
import { type LessonRow } from "@/backend/data/TeacherLessonData";
import { getLeaderCapacity } from "@/getters/bookings-getter";
import { ChevronDown } from "lucide-react";

interface TeacherBookingLessonTableProps {
    lesson: LessonRow;
    isExpanded: boolean;
    onToggle: () => void;
    bookingEntity: any;
    studentEntity: any;
    teacherId?: string;
    teacherUsername?: string;
    onEquipmentUpdate?: (eventId: string, equipment: any) => void;
}

export function TeacherBookingLessonTable({
    lesson,
    isExpanded,
    onToggle,
    bookingEntity,
    studentEntity,
    teacherId,
    teacherUsername,
    onEquipmentUpdate,
}: TeacherBookingLessonTableProps) {
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === lesson.equipmentCategory);
    const EquipmentIcon = equipmentConfig?.icon;
    const credentials = useSchoolCredentials();
    const currency = credentials?.currency || "YEN";

    return (
        <div className="rounded-lg border border-border overflow-hidden bg-card hover:border-primary/30 transition-colors">
            <div
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {EquipmentIcon && (
                        <HoverToEntity entity={bookingEntity} id={lesson.bookingId}>
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/20 shrink-0">
                                <EquipmentIcon size={16} className="text-foreground/60" />
                            </div>
                        </HoverToEntity>
                    )}
                    
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            {getLeaderCapacity(lesson.leaderName, lesson.studentCapacity)}
                        </div>
                        <div className="flex items-center gap-2">
                            <BookingStatusLabel
                                status={lesson.bookingStatus}
                                bookingId={lesson.bookingId}
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
                            {(Math.round(lesson.totalEarning * 100) / 100).toFixed(2)} {currency}
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
}
